const { Move, registerMoves } = require('./')

class MoveForwardSwim extends Move {
	addNeighbors(neighbors) {
		let landingNode = this.forward(1)
		if (this.isWater(landingNode))
			neighbors.push(this.makeMovement(landingNode, 5))
	}
}


class MoveForwardUpSwim extends Move {
	addNeighbors(neighbors) {
		let upNode = this.up(1)
		let landingNode = this.forward(1).up(1)
		if (
			   this.isWater(this.origin)
			&& this.isWalkable(upNode)
			&& this.isStandable(landingNode)
		)
			neighbors.push(this.makeMovement(landingNode, 5))
	}
}

class MoveForwardDownSwim extends Move {
	addNeighbors(neighbors) {
		let landingNode = this.forward(1).down(1)
		if (
			   this.isStandable(this.origin)
			&& this.isWater(landingNode)
		)
			neighbors.push(this.makeMovement(landingNode, 10))
	}
}


class MoveDiagonalSwim extends Move {
	addNeighbors(neighbors) {
		let landingNode = this.right(1).forward(1)

		let isRightWalkable = this.isWater(this.right(1))
		let isForwardWalkable = this.isWater(this.forward(1))
		if (!isRightWalkable && !isForwardWalkable) return []

		if (this.isWater(landingNode))
			neighbors.push(this.makeMovement(landingNode, 5 * Math.SQRT2))
	}
}

class MoveUpSwim extends Move {
	addNeighbors(neighbors) {
		let position = this.up(0)
		let landingNode = this.up(1)

		if (this.isWater(position) && this.isWater(landingNode))
			neighbors.push(this.makeMovement(landingNode, 4))
	}
}


class MoveDownSwim extends Move {
	addNeighbors(neighbors) {
		let landingNode = this.down(1)

		if (this.isWater(landingNode))
			neighbors.push(this.makeMovement(landingNode, 10))
	}
}

registerMoves([
	MoveForwardSwim,
	MoveDiagonalSwim,
	MoveUpSwim,
	MoveDownSwim,
	MoveForwardUpSwim,
	MoveForwardDownSwim
])