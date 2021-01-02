const { Move, registerMoves } = require('./')

class MoveForward extends Move {
	addNeighbors(neighbors) {
		let forwardNode = this.forward(1)
		if (this.isStandable(forwardNode))
			neighbors.push(this.makeMovement(forwardNode, 1))
	}
}


class MoveDiagonal extends Move {
	addNeighbors(neighbors) {
		let landingNode = this.right(1).forward(1)

		let isRightWalkable = this.isWalkable(this.right(1).up(1))
		let isForwardWalkable = this.isWalkable(this.forward(1).up(1))
		if (!isRightWalkable && !isForwardWalkable) return []

		if (this.isStandable(landingNode)) {
			neighbors.push(this.makeMovement(landingNode, Math.SQRT2))
		}
	}
}

class MoveForwardUp extends Move {
	addNeighbors(neighbors) {
		let upNode = this.up(1)
		let landingNode = this.up(1).forward(1)

		if (
			   this.isWalkable(upNode)
			&& this.isStandable(landingNode)
			&& this.isStandable(this.origin)
		)
			neighbors.push(this.makeMovement(landingNode, 2.5))
	}
}

class MoveForwardDown extends Move {
	addNeighbors(neighbors) {
		let forwardNode = this.forward(1)
		let landingNode = forwardNode.up(1)
		for (let i = 0; i < 3; i++) {
			landingNode = landingNode.down(1)
			if (this.isStandable(landingNode)) break
		}

		if (this.isStandable(landingNode) && this.isWalkable(forwardNode))
			neighbors.push(this.makeMovement(landingNode, 1.5))
	}
}

class MoveDiagonalUp extends Move {
	addNeighbors(neighbors) {
		let upNode = this.up(1)
		let landingNode = this.up(1).forward(1).right(1)

		let isRightWalkable = this.isJumpable(this.right(1).up(1))
		let isForwardWalkable = this.isJumpable(this.forward(1).up(1))
		if (!isRightWalkable && !isForwardWalkable) return []

		if (
			   this.isWalkable(this.origin)
			&& this.isWalkable(upNode)
			&& this.isStandable(landingNode)) {
			neighbors.push(this.makeMovement(landingNode, Math.SQRT2 * 1.5))
		}
	}
}

class MoveDiagonalDown extends Move {
	addNeighbors(neighbors) {
		let forwardNode = this.forward(1)
		let landingNode = this.right(1, forwardNode)
		for (let i = 0; i < 3; i++) {
			landingNode = this.down(1, landingNode)
			if (this.isStandable(landingNode)) break
		}

		if (this.isStandable(landingNode) && this.isWalkable(forwardNode))
			neighbors.push(this.makeMovement(landingNode, Math.SQRT2 * 1.5))
	}
}



registerMoves([
	MoveForward, MoveForwardUp, MoveForwardDown,
	MoveDiagonal, MoveDiagonalUp, MoveDiagonalDown
])