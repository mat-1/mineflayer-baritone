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
		// y distance is doubled so it prefers going up
		return node.offset(.5, 0, .5).xzDistanceTo(this.pos) + Math.abs(node.y - this.pos.y) * 2
	}
	
	isEnd(node) {
		return isPlayerOnBlock(node, this.pos, true, false)
	}

	equals(node) {
		return node.equals(this.pos)
	}
}

class GoalBlock extends GoalXYZ {
	constructor(x, y, z) {
		super()
		if (x && !y && !z)
			this.pos = x.floored().offset(.5, 0, .5)
		else
			this.pos = new Vec3(Math.floor(x) + .5, y, Math.floor(z) + .5)
	}
}


class GoalReach extends GoalXYZ {
	constructor(x, y, z) {
		super()
		if (x && !y && !z)
			this.pos = x.offset(.5, 0, .5)
		else
			this.pos = new Vec3(x + .5, y, z + .5)
	}
	
	isEnd(node) {
		return canReach(node, this.pos.offset(0, 1.625, 0), 3)
	}
}

class GoalAny extends Goal {
	constructor(goals) {
		super()
		this.goals = goals
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