const { RaycastIterator } = require('mineflayer/lib/iterators')

function isPlayerOnBlock(playerPosition, blockPosition, onGround=false, overhang=true) {
	// returns true if you can stand on the block
	
	if (!blockPosition) return false // theres no target position lmao
	
	blockPosition = blockPosition.floored().offset(.5, 0, .5)
	const xDistance = Math.abs(playerPosition.x - blockPosition.x)
	const zDistance = Math.abs(playerPosition.z - blockPosition.z)
	const yDistance = Math.abs(playerPosition.y - blockPosition.y)
	let onBlock
	if (!overhang)
		onBlock = xDistance < .5 && zDistance < .5 && yDistance < 1
	else
		onBlock = (xDistance < .7 && zDistance < .7 && yDistance < 1) || (onGround && xDistance < .8 && zDistance < .8 && yDistance < 0.001)
	return onBlock
}

function getViewDirection (pitch, yaw) {
	const csPitch = Math.cos(pitch)
	const snPitch = Math.sin(pitch)
	const csYaw = Math.cos(yaw)
	const snYaw = Math.sin(yaw)
	return new Vec3(-snYaw * csPitch, snPitch, -csYaw * csPitch)
}

function blockIsNotEmpty(pos) {
	const block = bot.blockAt(pos, false)
	return block !== null && block.boundingBox !== 'empty'
}

function canReach(startPosition, endPosition, maxDistance=3) {
	let stepSize = endPosition.minus(startPosition)
	let distance = Math.sqrt(stepSize.x * stepSize.x + stepSize.y * stepSize.y + stepSize.z * stepSize.z)
	if (distance > maxDistance) return false
	stepSize = stepSize.scaled(1 / distance)
	stepSize = stepSize.scaled(1 / 5)
	const totalSteps = distance * 5
	let stepPosition
	let previousPosition = startPosition
	for (let i = 1; i < totalSteps; i++) {
		stepPosition = previousPosition.plus(stepSize)
		// check that blocks don't inhabit the same position
		if (!stepPosition.floored().equals(previousPosition.floored())) {
			// check block is not transparent
			if (blockIsNotEmpty(stepPosition)) return false
		}
		previousPosition = stepPosition
	}
	return true
}

// (node) => {
// 	let distance = node.distanceTo(position)
// 	if (bot.pathfinder.complexPathOptions.maxDistance && distance > bot.pathfinder.complexPathOptions.maxDistance) return false
// 	else if (bot.pathfinder.complexPathOptions.minDistance && distance < bot.pathfinder.complexPathOptions.minDistance) return false
// 	else if (bot.pathfinder.complexPathOptions.maxDistance || bot.pathfinder.complexPathOptions.minDistance) return true
// 	return isPlayerOnBlock(node, position, true)
// }

module.exports = { isPlayerOnBlock }