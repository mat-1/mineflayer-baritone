const Heap = require('./heap')
const { performance } = require('perf_hooks')

module.exports = AStar

function AStar({ start, goal, neighbor, timeout, bot }) {
	if (timeout === undefined) timeout = Infinity
	hash = defaultHash

	const startNode = {
		data: start,
		g: 0,
		h: goal.heuristic(start)
	}
	let bestNode = startNode
	startNode.f = startNode.h
	// leave .parent undefined
	const closedDataSet = new Set()
	const openHeap = new Heap()
	const openDataMap = new Map()
	openHeap.push(startNode)
	openDataMap.set(hash(startNode.data), startNode)
	var startTime = performance.now()

	return new Promise(async(resolve) => {
		let lastSleep = performance.now()
		let iterationCount = 0
		while (!openHeap.isEmpty()) {
			iterationCount ++
			if (performance.now() - lastSleep >= 50) {
				// need to do this so the bot doesnt lag
				await new Promise(r => setTimeout(r, 0))
				lastSleep = performance.now()
			}

			if (performance.now() - startTime > timeout) {
				const path = reconstructPath(bestNode)
				if (bot.pathfinder.debug)
					console.log('timeout iterationCount', iterationCount, path)
				return resolve({
					status: 'timeout',
					cost: bestNode.g,
					path
				})
			}

			const node = openHeap.pop()
			openDataMap.delete(hash(node.data))
			if (goal.isEnd(node.data)) {
				// done
				if (bot.pathfinder.debug)
					console.log('success iterationCount', iterationCount)
				return resolve({
					status: 'success',
					cost: node.g,
					path: reconstructPath(node),
				})
			}
			// not done yet
			closedDataSet.add(hash(node.data))
			const neighbors = neighbor(node.data)
			for (const neighborData of neighbors) {
				if (closedDataSet.has(hash(neighborData)))
					// skip closed neighbors
					continue
				const gFromThisNode = node.g + neighborData.cost
				let neighborNode = openDataMap.get(hash(neighborData))
				let update = false
				if (neighborNode === undefined) {
					// add neighbor to the open set
					neighborNode = {
						data: neighborData
					}
					// other properties will be set later
					openDataMap.set(hash(neighborData), neighborNode)
				} else {
					if (neighborNode.g < gFromThisNode)
						// skip this one because another route is faster
						continue
					update = true
				}
				// found a new or better route.
				// update this neighbor with this node as its new parent
				neighborNode.parent = node
				neighborNode.g = gFromThisNode
				neighborNode.h = goal.heuristic(neighborData)
				neighborNode.f = gFromThisNode + neighborNode.h
				if (neighborNode.h < bestNode.h) bestNode = neighborNode
				if (update) {
					openHeap.update(neighborNode)
				} else {
					openHeap.push(neighborNode)
				}
			}
		}
		if (bot.pathfinder.debug)
			console.log('noPath iterationCount', iterationCount)
		return resolve({
			status: 'noPath',
			cost: bestNode.g,
			path: reconstructPath(bestNode)
		})
	})

}

function reconstructPath(node) {
	if (node.parent !== undefined) {
		var pathSoFar = reconstructPath(node.parent)
		pathSoFar.push(node.data)
		return pathSoFar
	} else {
		// this is the starting node
		return [node.data]
	}
}

function defaultHash(node) {
	return node.x + ' ' + node.y + ' ' + node.z
}
