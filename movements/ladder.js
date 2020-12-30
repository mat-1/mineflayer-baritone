const { Move, registerMoves } = require('./')


class MoveUpLadder extends Move {
	addNeighbors(neighbors) {
		let position = this.up(0)
		let landingNode = this.up(1)

		if ((this.isAir(position) || this.isLadder(position)) && this.isLadder(landingNode))
			neighbors.push(this.makeMovement(landingNode, 2))
	}
}


class MoveDownLadder extends Move {
	addNeighbors(neighbors) {
		let position = this.down(0)
		let landingNode = this.down(1)

		if (this.isStandable(position) && this.isLadder(landingNode))
			neighbors.push(this.makeMovement(landingNode, 2))
	}
}

registerMoves([ MoveUpLadder ])