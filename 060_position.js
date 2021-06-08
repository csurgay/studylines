class Position {
	constructor() {
		this.fen = '';
		this.b = [];
		this.color = '';
		this.castle = '';
		this.enpassant = '';
		this.fifty = 0;
		this.counter = 0;
	}
	initPos(pos) {
		this.fen = pos.fen;
		for (var f=0; f<8; f++) {
			this.b[f] = [];
			for (var r=0; r<8; r++) {
				this.b[f][r] = pos.b[f][r];
			}
		}
		this.color = pos.color;
		this.castle = pos.castle;
		this.enpassant = pos.enpassant;
		this.fifty = pos.fifty;
		this.counter = pos.counter;
	}
	initFen(fen = initialPosition) {
		var pos = fen2pos(fen);
		this.fen = pos.fen;
		this.b = pos.b;
		this.color = pos.color;
		this.castle = pos.castle;
		this.enpassant = pos.enpassant;
		this.fifty = pos.fifty;
		this.counter = pos.counter;
	}
	calcFen() {
		this.fen = pos2fen(this);
	}
	inside(f,r) {
		return (f>=0 && f<8 && r>=0 && r<8);
	}
	findKing(c) {
		for (var f=0; f<8; f++)
			for (var r=0; r<8; r++)
				if ( this.b[f][r][0]==c && this.b[f][r][1]=='K' ) 
					return [ f, r ];
		return null;
	}
	nextIndex(piece) { // returns the first piece index not in this position yet
		var ind = '0123456789'; // max 9 pieces of the same kind only!
		for (var f=0; f<8; f++) for (var r=0; r<8; r++)
			if (pos.b[f][r].substr(0,2)==piece)
				ind = ind.replace( pos.b[f][r][2], '-' );
		var ret = ' '; var found = false;
		var i=1; while(i<ind.length && !found) {
			if (ind[i]!='-') { ret = ind[i]; found = true; }
			i++;
		}
		if (ret==' ') alert('Position.nextIndex: no index found in this pos for piece: '+piece);
		else return ret;
	}
}
