const { PlayerState } = require('prismarine-physics')
const { distanceFromLine } = require('./pointtoline')
const { isPlayerOnBlock } = require('./utils')
const { Vec3 } = require('vec3')

function getControlState(bot) {
	// we have to do this instead of just returning the control state since it uses custom get() methods
	return {
		forward: bot.controlState.forward,
		back: bot.controlState.back,
		left: bot.controlState.left,
		right: bot.controlState.right,
		jump: bot.controlState.jump,
		sprint: bot.controlState.sprint,
		sneak: bot.controlState.sneak
	}
}

function simulateUntil(bot, func, ticks=1, controlstate={}, returnState=false, returnInitial=true, extraState) {
	// simulate the physics for the bot until func returns true for a number of ticks
	const originalControl = getControlState(bot)
	const simulationControl = originalControl
	Object.assign(simulationControl, controlstate)
	const state = new PlayerState(bot, simulationControl)
	Object.assign(state, extraState)
	if (func(state) && returnInitial) return state
	const world = { getBlock: (pos) => { return bot.blockAt(pos, false) } }

	let airTicks = 0

	for (let i = 0; i < ticks; i++) {
		state.control = simulationControl
		bot.physics.simulatePlayer(state, world)

		// this is used by tryStraightPath to make sure it doesnt take fall damage
		if (!state.onGround) airTicks++
		else airTicks = 0
		state.airTicks = airTicks

		if (func(state)) return state
	}
	return returnState ? state : false
}

function canSprintJump(bot, { isEnd, complexPathPoints }) {
	// Checks if the bot should sprint jump. This is also used for parkour
	const returnState = simulateUntil(bot, state => state.onGround, 40, {jump: true, sprint: true, forward: true}, true, false)
	if (!returnState) {
		console.log('never landed on ground, at', returnState.pos)
		return false // never landed on ground
	}
	
	const jumpDistance = bot.entity.position.distanceTo(returnState.pos)
	let fallDistance = bot.entity.position.y - returnState.pos.y
	// We're checking that the bot will not fall more than 2 blocks, because since it's jumping it would take fall damage
	if (jumpDistance <= .5 || fallDistance >= 2) return false
	
	const isOnPath = (isEnd || isPointOnPath)(returnState.pos, { bot, onGround: true })
	if (bot.pathfinder.debug)
		console.log('isOnPath', isOnPath, returnState.pos, isEnd)
	if (!isOnPath) return false
	return true
}

// checks if the bot should walk jump. sprint jumps are used most of the time, but in case a sprint jump is too much itll do this instead
function canWalkJump(bot, { complexPathPoints }) {
	const isStateGood = (state) => {
		if (!state) return false
		const jumpDistance = bot.entity.position.distanceTo(state.pos)
		let fallDistance = bot.entity.position.y - state.pos.y
		if (jumpDistance <= 1 || fallDistance > 2) return false
		const isOnPath = isPointOnPath(state.pos, { bot, max: 10, complexPathPoints, onGround: true })
		if (!isOnPath) return false
		return true
	}
	
	// const returnState = simulateUntil(bot, state => state.onGround, 20, {jump: true, sprint: false, forward: true}, true, false)
	const returnState = simulateUntil(bot, state => state.onGround, 20, {jump: true, sprint: false, forward: true}, true, false)
	const returnStateWithoutJump = simulateUntil(bot, isStateGood, 20, {jump: false, sprint: true, forward: true}, true, false)
	if (!returnState) return false // never landed on ground
	
	if (!isStateGood(returnState)) {
		console.log('cant walk jump', returnState.pos)
		return false
	}
	
	// if it can do just as good just from sprinting, then theres no point in jumping
	if (isStateGood(returnStateWithoutJump)) {
		console.log('could walk jump')
		return false
	}

	console.log('*** walk jump')
	return true
}


function willBeOnGround(bot, ticks=1) {
	return simulateUntil(bot, (state) => state.onGround, ticks, {}, false, true)
}	


function isPointOnPath(point, { bot, max=null, onGround=false, complexPathPoints }) {
	// returns true if a point is on the current path
	if (!complexPathPoints)
		return false

	if (complexPathPoints.length === 1)
		return isPlayerOnBlock(point, complexPathPoints[0], onGround)
	let pathIndex
	for (pathIndex = 1; pathIndex < Math.min(complexPathPoints.length, max ?? 100); ++pathIndex) {
		let segmentStart = complexPathPoints[pathIndex - 1]
		let segmentEnd = complexPathPoints[pathIndex]

		if (isPlayerOnBlock(point, segmentStart, onGround) || isPlayerOnBlock(point, segmentEnd, onGround)) {
			return true
		}

		let calculatedDistance = distanceFromLine(segmentStart, segmentEnd, point.offset(-.5, 0, -.5))
		if (calculatedDistance < .8 && (bot.entity.onGround || willBeOnGround(bot))) {
			return true
		}
	}
	return false
}

function tryStraightPath(bot, goal) {
	// try to just sprint jump toward the goal, returns a boolean if its possible
	const isStateGood = (state) => {
		if (!state) return false
		if (state.airTicks > 15) return false // if youre falling for more than 15 ticks, then its probably too dangerous
		if (state.isCollidedHorizontally) return false
		if (goal.isEnd(state.pos)) return true
		return null
	}

	const shouldStop = (state) => {
		return isStateGood(state) !== null
	}
	
	// try sprint jumping towards the player for 10 seconds
	const returnState = simulateUntil(bot, shouldStop, 200, {jump: false, sprint: true, forward: true}, true, false, convertPointToDirection(bot, goal.pos))
	if (!isStateGood(returnState)) return false
	return true
}

function convertPointToDirection(bot, point) {
	// make the point a vec3
	const pointVec3 = new Vec3(point.x, point.y, point.z)

	const delta = pointVec3.minus(bot.entity.position.offset(0, bot.entity.height, 0))
	const yaw = Math.atan2(-delta.x, -delta.z)
	const groundDistance = Math.sqrt(delta.x * delta.x + delta.z * delta.z)
	const pitch = Math.atan2(delta.y, groundDistance)
	return {
		pitch,
		yaw
	}
}


module.exports = {
	canSprintJump, canWalkJump, isPointOnPath, tryStraightPath, simulateUntil, getControlState, willBeOnGround,
	convertPointToDirection
}