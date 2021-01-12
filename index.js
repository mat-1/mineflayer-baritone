const movements = require('./movements')
const AStar = require('./astar')
const { Vec3 } = require('vec3')
const { performance } = require('perf_hooks')
const goals = require('./goals')
const { executeMove } = require('./movementExecutor')

function inject (bot) {
	bot.pathfinder = {}

	bot.pathfinder.timeout = 5000
	bot.pathfinder.straightLine = true
	bot.pathfinder.complexPathOptions = {}
	bot.pathfinder.debug = true


	let targetEntity = null
	let complexPathGoal = null
	let complexPathPoints = []
	let calculating = false
	let lastFollowed = performance.now()
	let currentPathNumber = 0
	let currentCalculatedPathNumber = 0



	function followTick() {
		// updates the target position every followedAgo milliseconds
		let entity = bot.entities[targetEntity.id]
		if (bot.pathfinder.debug)
			console.log(entity.onGround)
		if (!entity) return
		if (!entity.onGround) return
		if (!bot.entity.onGround) return

		const distanceToTarget = bot.entity.position.distanceTo(entity.position)
		if (bot.pathfinder.complexPathOptions.maxDistance && distanceToTarget > bot.pathfinder.complexPathOptions.maxDistance);
		else if (bot.pathfinder.complexPathOptions.minDistance && distanceToTarget < bot.pathfinder.complexPathOptions.minDistance);
		else if (bot.pathfinder.complexPathOptions.maxDistance || bot.pathfinder.complexPathOptions.minDistance) return

		let entityMoved = complexPathGoal === null || !entity.position.equals(complexPathGoal)
		let followedAgo = performance.now() - lastFollowed
		if (!calculating && entityMoved && followedAgo > 100) {
			lastFollowed = performance.now()
			complexPath(entity.position.clone(), bot.pathfinder.complexPathOptions)
		}
	}

	async function follow(entity, options={}) {
		targetEntity = entity
		bot.pathfinder.complexPathOptions = options
	}

	async function complexPath(pathGoal, options={}) {
		// uses A* to find a path and combines straight paths to get to the goal
		if(!(pathGoal instanceof goals.Goal))
			pathGoal = new goals.GoalBlock(pathGoal.x, pathGoal.y, pathGoal.z)
		let pathNumber

		if (options.incPath === false)
			pathNumber = currentPathNumber
		else
			pathNumber = ++currentPathNumber

		if (bot.pathfinder.debug) console.log('waiting for move to finish')
		await bot.pathfinder.finishMovement(pathGoal)
		if (pathGoal.pos)
			await bot.lookAt(pathGoal.pos, true)
		if (bot.pathfinder.debug) console.log('waiting for move to finish [DONE]')

		if (currentCalculatedPathNumber > pathNumber) return

		bot.pathfinder.complexPathOptions = options

		complexPathGoal = pathGoal
		calculating = true
		continuousPath = true
		const start = bot.entity.position.floored()

		if (false && bot.pathfinder.straightLine && pathGoal.pos && tryStraightPath(pathGoal)) {
			// just run straight toward the goal, useful when chasing people
			if (bot.pathfinder.debug)
				console.log('straight pathing :)', pathGoal.pos)
			bot.lookAt(pathGoal.pos, true)
			calculating = false
			goingToPathTarget = pathGoal.pos.clone()
			complexPathPoints = [start, pathGoal.pos]
			await executeMove({
				bot,
				target: pathGoal.pos,
				skip: false,
				centered: options.centered,
				isEnd: () => pathGoal.isEnd(bot.entity.position),
				complexPathPoints
			})
		} else {
			const timeout = bot.pathfinder.timeout

			let calculateStart = performance.now()
			if (bot.pathfinder.debug) console.log('started calculating...')
			const result = await AStar({
				start,
				goal: pathGoal,
				neighbor: (node) => {
					return movements.getNeighbors(bot.world, node)
				},
				timeout,
				bot
			})
			let calculateEnd = performance.now()
			if (bot.pathfinder.debug) {
				console.log('spent', calculateEnd - calculateStart, 'ms calculating goal')

				console.log('RESULT:', result)
				if (result.status === 'noPath')
					console.log('no path from', new Vec3(pathGoal.pos.x, pathGoal.pos.y, pathGoal.pos.z), 'to', result.path[result.path.length - 1])
			}
			if (currentCalculatedPathNumber > pathNumber) return
			else currentCalculatedPathNumber = pathNumber
			calculating = false
			complexPathPoints = result.path
			while (complexPathPoints.length > 0) {
				const movement = complexPathPoints[0]
				await executeMove({
					bot,
					target: complexPathPoints.length == 1 && pathGoal.pos ? pathGoal.pos : movement.offset(.5, 0, .5),
					isEnd: complexPathPoints.length == 1 ? (position, onGround) => onGround && pathGoal.isEnd(position) : null,
					complexPathPoints,
					stopCondition: () => currentCalculatedPathNumber > pathNumber
				})
				if (bot.pathfinder.debug)
					console.log('now at', movement)
				if (currentCalculatedPathNumber > pathNumber || complexPathPoints === null) {
					if (bot.pathfinder.debug) console.log('looks like another path replaced this one!')
					return
				}
				complexPathPoints.shift()
			}
			if (result.status === 'timeout' && pathNumber === currentPathNumber) {
				// if it times out, recalculate once we reach the end
				complexPathPoints = null
				bot.clearControlStates()
				options.incPath = false
				if (bot.pathfinder.debug)
					console.log('timeout, continuing', pathGoal.pos)
				return await complexPath(pathGoal, options)
			} else {
				if (options.centered) {
					if (bot.pathfinder.debug)
						console.log('pathGoal.pos', pathGoal.pos)
					if (result.status === 'sucess')
						await executeMove({
							bot,
							target: pathGoal.pos,
							skip: false,
							centered: true,
							complexPathPoints
					})
				}
			}
		}
		complexPathPoints = null
		bot.clearControlStates()
	}


	bot.pathfinder.goto = async (position, options={}) => {
		bot.clearControlStates()
		if (options.straight)
			await executeMove({
				bot,
				target: position,
				skip: false,
				centered: options.centered,
				complexPathPoints
			})
		else
			await complexPath(position, options)
	}

	bot.pathfinder.follow = async (entity, options={}) => {
		/*
		Options:
		- maxDistance
		- minDistance
		- mustReach
		*/
		await follow(entity, options)
	}

	bot.pathfinder.finishMovement = () => {
		return new Promise(async(resolve, reject) => {
			if (bot.pathfinder.executor)
				await bot.pathfinder.executor.wait()
			let checkGroundTick = () => {
				if (bot.entity.onGround) {
					bot.clearControlStates()
					bot.removeListener('physicTick', checkGroundTick)
					resolve()
				}
			}
			bot.on('physicTick', checkGroundTick)
		})
}

	bot.pathfinder.stop = async() => {
		targetEntity = null
		complexPathPoints = null
		straightPathOptions = null
		await bot.pathfinder.finishMovement()
		bot.clearControlStates()
	}

	async function moveTick() {
		if (targetEntity) followTick()
		// if (straightPathOptions !== null) if (await straightPathTick()) straightPathTick()
	}

	bot.on('physicTick', moveTick)
}

module.exports = {
	pathfinder: inject,
	goals
}
