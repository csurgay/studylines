class MoveData {
	constructor() {
		this.movePiece = ''; this.leftPiece = '';
		this.moveF = -1; this.moveR = -1; this.newF = -1; this.newR = -1;
		this.takenPiece = ''; this.becomesPiece = '';
		this.display = '';
	}
	init() {
		this.movePiece = ''; this.leftPiece = '';
		this.moveF = -1; this.moveR = -1; this.newF = -1; this.newR = -1;
		this.takenPiece = ''; this.becomesPiece = '';
		this.display = '';
	}
}
class Move extends MoveData {
	constructor() {
		super();
		this.promotionMove = [];
		this.special = '';
		this.check = ''; 
		this.moveFeedback = '';
		this.targetSquares = [];
	}
	init() {
		super.init();
		this.promotionMove = [];
		this.special = '';
		this.check = ''; 
		this.moveFeedback = '';
		this.targetSquares = [];
	}
	getMoveData() {
		var d = new MoveData();
		d.movePiece = this.movePiece; d.leftPiece = this.leftPiece;
		d.moveF = this.moveF; d.moveR = this.moveR; d.newF = this.newF; d.newR = this.newR;
		d.takenPiece = this.takenPiece; d.becomesPiece = this.becomesPiece;
		d.display = this.display;
		return d;
	}
	setMoveData( d ) {
		this.movePiece = d.movePiece; this.leftPiece = d.leftPiece;
		this.moveF = d.moveF; this.moveR = d.moveR; this.newF = d.newF; this.newR = d.newR;
		this.takenPiece = d.takenPiece; this.becomesPiece = d.becomesPiece;
		this.display = d.display;
	}
}
