const { Move, registerMoves } = require('.')

class MoveForwardParkour1 extends Move {
	// 1 block jump
	addNeighbors(neighbors) {
		const landingNode = this.forward(2)
		const spaceNode1 = this.forward(1).up(1)
		const gapNode1 = this.forward(1)
		if (
			   this.isAir(gapNode1)
			&& this.isWalkable(spaceNode1)
			&& this.isStandable(landingNode)
		)
			neighbors.push(this.makeMovement(landingNode, 1.5))
	}
}

class MoveForwardParkour2 extends Move {
	// 2 block jump
	addNeighbors(neighbors) {
		const landingNode = this.forward(3)
		const spaceNode1 = this.forward(1).up(1)
		const spaceNode2 = this.forward(2).up(1)
		const gapNode1 = this.forward(1)
		const gapNode2 = this.forward(2)
		if (
			   this.isAir(gapNode1)
			&& this.isAir(gapNode2)
			&& this.isJumpable(spaceNode1)
			&& this.isJumpable(spaceNode2)
			&& this.isStandable(landingNode)
			&& this.isStandable(this.origin)
		)
			neighbors.push(this.makeMovement(landingNode, 2.5))
	}
}

class MoveForwardParkour3 extends Move {
	// 3 block jump
	addNeighbors(neighbors) {
		const landingNode = this.forward(4)
		const spaceNode1 = this.forward(1).up(1)
		const spaceNode2 = this.forward(2).up(1)
		const spaceNode3 = this.forward(3).up(1)
		const gapNode1 = this.forward(1)
		const gapNode2 = this.forward(2)
		const gapNode3 = this.forward(3)
		if (
			this.isAir(gapNode1)
			&& this.isAir(gapNode2)
			&& this.isAir(gapNode3)
			&& this.isJumpable(spaceNode1)
			&& this.isJumpable(spaceNode2)
			&& this.isJumpable(spaceNode3)
			&& this.isStandable(landingNode)
		)
			neighbors.push(this.makeMovement(landingNode, 4))
	}
}

class MoveForwardUpParkour1 extends Move {
	// 1 block jump going upward
	addNeighbors(neighbors) {
		let landingNode = this.forward(2).up(1)
		let firstGap = this.forward(1)
		let spaceNode1 = this.forward(1).up(1)
		if (
			   this.isWalkable(firstGap)
			&& this.isWalkable(spaceNode1)
			&& this.isStandable(landingNode)
		)
			neighbors.push(this.makeMovement(landingNode, 1.5))
	}
}

class MoveForwardUpParkour2 extends Move {
	// 2 block jump going upward
	addNeighbors(neighbors) {
		let landingNode = this.forward(3).up(1)
		let firstGap = this.forward(1)
		let spaceNode1 = this.forward(1).up(1)
		let spaceNode2 = this.forward(2).up(1)
		if (
			   this.isWalkable(firstGap)
			&& this.isWalkable(spaceNode1)
			&& this.isWalkable(spaceNode2)
			&& this.isStandable(landingNode)
		)
			neighbors.push(this.makeMovement(landingNode, 3.03))
	}
}

class MoveForwardUpParkour3 extends Move {
	// 3 block jump going upward
	addNeighbors(neighbors) {
		let landingNode = this.forward(4).up(1)
		let spaceNode1 = this.forward(1).up(1)
		let spaceNode2 = this.forward(2).up(1)
		let spaceNode3 = this.forward(3).up(1)
		if (
			   this.isJumpable(spaceNode1)
			&& this.isJumpable(spaceNode2)
			&& this.isJumpable(spaceNode3)
			&& this.isStandable(landingNode)
		)
			neighbors.push(this.makeMovement(landingNode, 5))
	}
}

class MoveForwardDownParkour1 extends Move {
	// 1 block jump going downward
	addNeighbors(neighbors) {
		let landingNode = this.forward(2).down(1)
		let spaceNode1 = this.forward(1).down(1)
		if (
			   this.isJumpable(spaceNode1)
			&& this.isStandable(landingNode)
		) {
			neighbors.push(this.makeMovement(landingNode, 1))
		}
	}
}

class MoveForwardDownParkour2 extends Move {
	// 2 block jump going downward
	addNeighbors(neighbors) {
		let landingNode = this.forward(3).down(1)
		let spaceNode1 = this.forward(1).up(1)
		let spaceNode2 = this.forward(2).up(1)
		if (
			   this.isWalkable(spaceNode1)
			&& this.isWalkable(spaceNode2)
			&& this.isStandable(landingNode)
		)
			neighbors.push(this.makeMovement(landingNode, 2))
	}
}

class MoveForwardDownParkour3 extends Move {
	// 3 block jump going downward
	addNeighbors(neighbors) {
		let landingNode = this.forward(4).down(1)
		let spaceNode1 = this.forward(1).up(1)
		let spaceNode2 = this.forward(2).up(1)
		let spaceNode3 = this.forward(3).up(1)
		if (
			   this.isJumpable(spaceNode1)
			&& this.isJumpable(spaceNode2)
			&& this.isJumpable(spaceNode3)
			&& this.isStandable(landingNode)
		)
			neighbors.push(this.makeMovement(landingNode, 4))
	}
}

class MoveDiagonalParkour extends Move {
	addNeighbors(neighbors) {
		let landingNode = this.right(2).forward(2)

		let isDiagonalWalkable1 = this.isJumpable(this.right(1).forward(1))
		let isRightWalkable1 = this.isJumpable(this.right(1))
		let isForwardWalkable1 = this.isJumpable(this.forward(1))
		let isRightWalkable2 = this.isJumpable(this.right(2).forward(1))
		let isForwardWalkable2 = this.isJumpable(this.right(1).forward(2))
		if (
			   (!isRightWalkable1 && !isForwardWalkable1)
			|| (!isRightWalkable2 && !isForwardWalkable2)
			|| (!isDiagonalWalkable1)
			|| (!this.isWalkable(this.origin))
		) return []

		if (this.isStandable(landingNode)) {
			neighbors.push(this.makeMovement(landingNode, 3.04))
		}
	}
}

class MoveDiagonalUpParkour extends Move {
	addNeighbors(neighbors) {
		let landingNode = this.right(2).forward(2).up(1)

		let spaceNode1 = this.right(1).forward(1)

		let isRightWalkable1 = this.isJumpable(this.right(1))
		let isForwardWalkable1 = this.isJumpable(this.forward(1))
		let isRightWalkable2 = this.isJumpable(this.right(2).forward(1).up(1))
		let isForwardWalkable2 = this.isJumpable(this.right(1).forward(2).up(1))
		if (
			   (this.isJumpable(spaceNode1))
			&& (isRightWalkable1 || isForwardWalkable1)
			&& (isRightWalkable2 || isForwardWalkable2)
			&& this.isStandable(landingNode)
			&& this.isStandable(this.origin)
		) {
			neighbors.push(this.makeMovement(landingNode, 3.01))
		}
	}
}

class MoveDiagonalDownParkour extends Move {
	addNeighbors(neighbors) {
		let landingNode = this.right(2).forward(2).down(1)

		let spaceNode1 = this.right(1).forward(1).down(1)

		let isRightWalkable1 = this.isWalkable(this.right(1).up(1))
		let isForwardWalkable1 = this.isWalkable(this.forward(1).up(1))
		let isRightWalkable2 = this.isJumpable(this.right(2).forward(1).down(1))
		let isForwardWalkable2 = this.isJumpable(this.right(1).forward(2).down(1))
	
		if (
			   (this.isWalkable(spaceNode1))
			&& (
				   (isRightWalkable1 && isRightWalkable2)
				|| (isForwardWalkable1 && isForwardWalkable2)
			)
			&& this.isStandable(landingNode)
		) {
			neighbors.push(this.makeMovement(landingNode, 2))
		}
	}
}

class MoveSemiDiagonalParkour extends Move {
	/*
	-X
	--
	X-
	(X is a solid block, - is air)
	*/
	addNeighbors(neighbors) {
		let landingNode = this.right(1).forward(2)

		let isRightWalkable1 = this.isJumpable(this.right(1).up(1))
		let isForwardWalkable1 = this.isJumpable(this.forward(1).up(1))
		let isDiagonalWalkable1 = this.isJumpable(this.forward(1).right(1).up(1))
		let isDiagonalWalkable2 = this.isJumpable(this.forward(2).up(1))
		if (
			   (!isRightWalkable1 && !isForwardWalkable1)
			|| !(isDiagonalWalkable1 || isDiagonalWalkable2)
			|| !(isForwardWalkable1 || isDiagonalWalkable1)
		) return []

		if (this.isStandable(landingNode)) {
			neighbors.push(this.makeMovement(landingNode, 3.02))
		}
	}
}



registerMoves([
	MoveForwardParkour1, MoveForwardParkour2, MoveForwardParkour3,
	MoveForwardUpParkour1, MoveForwardUpParkour2, MoveForwardUpParkour3,
	MoveForwardDownParkour1, MoveForwardDownParkour2, MoveForwardDownParkour3,
	MoveDiagonalParkour, MoveDiagonalUpParkour, MoveDiagonalDownParkour,
	MoveSemiDiagonalParkour
])