const { canSprintJump, canWalkJump, isPointOnPath } = require('./physics')
const { isPlayerOnBlock } = require('./utils')

function executeMove({ bot, target, skip, centered, isEnd, complexPathPoints }) {
	const executeOptions = { bot, target, skip: skip ?? true, centered: centered ?? false, isEnd }
	return new Promise((resolve, reject) => {
		if (executeOptions) {
			executeOptions.resolve = resolve

			// create an event listener for every physic tick (every 50ms)
			// we're making an anonymous function here so it can pass the arguments to the function
			let moveVariables = {}
			const listener = () => executeMoveTick(executeOptions, moveVariables)
			executeOptions.listener = listener
			bot.on('physicTick', listener)
		} else {
			// if there's no options, just resolve instantly
			resolve()
		}
	})
}

async function executeMoveTick({ bot, target, skip: allowSkippingPath, centered, isEnd, listener, resolve, complexPathPoints }, moveVariables) {
	// do one tick of pathing towards a specific target
	// telling the bot how exactly to move is here
	// generally this will just be a straight line, but if you want to add stuff like neos thats gonna be a lot more complex
	bot.setControlState('sprint', !moveVariables.walkingUntilGround)
	bot.setControlState('forward', true)

	const defaultIsEnd = ((position, onGround) => {
		return isPlayerOnBlock(position, target, onGround, true)
		|| (allowSkippingPath && isPointOnPath(position, { complexPathPoints }))
	})
	// if (!isEnd) isEnd = defaultIsEnd
	isEnd = defaultIsEnd

	if (!moveVariables.headLockedUntilGround)
		// look at the target
		// the 1.625 is the position of the bot's eyes, so it looks directly at the target
		await bot.lookAt(target.offset(0, 1.625, 0), true)

	if (!isEnd(bot.entity.position, bot.entity.onGround)) {
		let blockBelow = bot.world.getBlock(bot.entity.position.offset(0, -1, 0).floored())
		let blockInside = bot.world.getBlock(bot.entity.position.offset(0, 0, 0).floored())
		let blockInside2 = bot.world.getBlock(bot.entity.position.offset(0, 1, 0).floored())
		if (
			(blockInside && (blockBelow.name === 'water' || blockInside.name === 'water' || blockInside2.name === 'water') && target.y >= bot.entity.position.y - .5)
			|| (blockInside && blockInside2.name === 'ladder' && target.y >= bot.entity.position.y)
		) {
			// in water or ladder
			bot.setControlState('sprint', false)
			if (bot.entity.position.xzDistanceTo(target) < .5)
				bot.setControlState('forward', false)
			bot.setControlState('jump', true)
		} else if (bot.entity.onGround && canSprintJump(bot, isEnd)) {
			moveVariables.headLockedUntilGround = true
			bot.setControlState('jump', true)
			if (bot.pathfinder.debug)
				console.log('sprint jump!')
		} else if (bot.entity.onGround && canWalkJump(bot, isEnd)) {
			bot.setControlState('sprint', false)
			moveVariables.headLockedUntilGround = true
			moveVariables.walkingUntilGround = true
			bot.setControlState('jump', true)
			if (bot.pathfinder.debug)
				console.log('hop!')
		} else {
			if (bot.entity.onGround) {
				moveVariables.headLockedUntilGround = false
				moveVariables.walkingUntilGround = false
				bot.setControlState('jump', false)
			}
		}
	} else {
		// arrived at path ending :)
		bot.setControlState('jump', false)
		resolve()
		moveVariables.headLockedUntilGround = false
		moveVariables.walkingUntilGround = false
		bot.removeListener('physicTick', listener)
		return true
	}
	return false
}

// 


module.exports = { executeMove }