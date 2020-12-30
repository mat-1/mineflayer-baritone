const { isPlayerOnBlock, canReach } = require('./utils')
const { Vec3 } = require('vec3')

class Goal {
	heuristic(node) {
		return 0
	}

	isEnd(node) {
		return true
	}

	equals(node) {
		return true
	}
}


class GoalXYZ extends Goal {
	constructor(x, y, z) {
		super()
		if (x && !y && !z)
			this.pos = x
		else
			this.pos = new Vec3(x, y, z)
	}
	
	heuristic(node) {
		return node.distanceTo(this.pos)
	}
	
	isEnd(node) {
		return isPlayerOnBlock(node, this.pos, true)
	}

	equals(node) {
		return node.equals(this.pos)
	}
}

class GoalBlock extends GoalXYZ {
	constructor(x, y, z) {
		super()
		if (x && !y && !z)
			this.pos = x.offset(.5, 0, .5)
		else
			this.pos = new Vec3(x + .5, y, z + .5)
	}
}


class GoalReach extends Goal {
	constructor(x, y, z) {
		super()
		if (x && !y && !z)
			this.pos = x.offset(.5, 0, .5)
		else
			this.pos = new Vec3(x + .5, y, z + .5)
	}
	
	heuristic(node) {
		return node.distanceTo(this.pos)
	}
	
	isEnd(node) {
		return canReach(node, this.pos, true)
	}

	equals(node) {
		return node.equals(this.pos)
	}
}

class GoalAny extends Goal {
	constructor(goals) {
		this.goals = goals
	}

	get pos() {
		// returns the position of the goal with the best heuristic
		let lowestHeuristic = Number.MAX_VALUE
		let bestPos = null
		for (const goal of this.goals) {
			const goalHeuristic = goal.heuristic(node)
			if (goalHeuristic < lowestHeuristic) {
				lowestHeuristic = goalHeuristic
				bestPos = goal.pos
			}
		}
		return bestPos
	}

	heuristic(node) {
		// returns the lowest heuristic out of all the goals
		let lowestHeuristic = Number.MAX_VALUE
		for (const goal of this.goals) {
			const goalHeuristic = goal.heuristic(node)
			if (goalHeuristic < lowestHeuristic)
				lowestHeuristic = goalHeuristic
		}
		return lowestHeuristic
	}

	isEnd(node) {
		for (const goal of this.goals) {
			if (goal.isEnd(node)) return true
		}
		return false
	}

	equals(node) {
		for (const goal of this.goals) {
			if (goal.equals(node)) return true
		}
		return false
	}
}

module.exports = { Goal, GoalXYZ, GoalBlock, GoalReach, GoalAny }