function nextPos(setPos=false,animPos=false) { // setPos: adjust pos to stored g.fens
	a.pos.initPos(pos);
	if (setPos) pos.initPos( g.bs[g.ply] );
	if (animPos) a.animPos(); else callbackAnimPos();
}
function callbackAnimPos() {
	doRedraw();
}

class Anim {
	constructor() {
		this.pos = new Position();
		this.d = new MoveData();
		this.aniTimer;
		this.aniStep;
		this.aniPhases = 7.0;
		this.animsec = 30; // millisec for ani phases
		this.attacker = false; // this move attacks something from [newF][newR]
		this.forward = false; // this is a forward move, not a takeback
		this.posPairs = []; // start and end pos for all pieces for new pos to anim
	}
	anim( moveData, mode, forward ) { // mode: 'drag' or 'click'
		this.d = moveData;
		this.forward = forward;
		this.aniStep = ( mode=='drag' ? 0 : this.aniPhases );
		this.attacker = false;
		var attacks = calcMoves(pos,this.d.newF,this.d.newR,'attacks',this.d.movePiece, 'normal');
		for (var i=0; i<attacks.length; i++) {
			if ( pos.b[ attacks[i][0] ][ attacks[i][1] ][0] == oppColor( this.d.movePiece[0] ) ) {
				this.attacker = true;
			}
		}
		this.aniTimer = setTimeout(ani, this.animsec);
	}
	linear( v1, v2, weight ) {
		return ( weight*v1 + (this.aniPhases-weight)*v2 ) / this.aniPhases;
	}
	animPos() {
		this.aniStep = this.aniPhases;
		this.posPairs = [];
		for (var f=0; f<8; f++) for (var r=0; r<8; r++) {
			if (this.pos.b[f][r] != EMPTY) {
				var d = new MoveData();
				d.movePiece = this.pos.b[f][r];
				d.moveF = f; d.moveR = r;
				var found = false;
				for (var ff=0; ff<8; ff++) for (var rr=0; rr<8; rr++) {
					if (pos.b[ff][rr] == this.pos.b[f][r]) {
						found = true;
						d.newF = ff; d.newR = rr;
					}
				}
				if (!found) {
					if (f<=r && f<=7-r) { d.newF = -1; d.newR = r; 	}
					else if (f>=r && 7-f>=r) { d.newF = f; d.newR = -1; }
					else if (7-f<=r && 7-f<=7-r) { d.newF = 8; d.newR = r; }
					else if (f>=7-r && 7-f>=7-r) { d.newF = f; d.newR = 8; }
				}
				this.posPairs.push(d);
			}
		}
		for (var ff=0; ff<8; ff++) for (var rr=0; rr<8; rr++) {
			if (pos.b[ff][rr] != EMPTY) {
				var found = false;
				for (var f=0; f<8; f++) for (var r=0; r<8; r++) {
					if (pos.b[ff][rr] == this.pos.b[f][r]) {
						found = true;
					}
				}
				if (!found) {
					var d = new MoveData();
					d.movePiece = pos.b[ff][rr];
					d.newF = ff; d.newR = rr;
					if (ff<=rr && ff<=7-rr) { d.moveF = -1; d.moveR = rr; 	}
					else if (ff>=rr && 7-ff>=rr) { d.moveF = ff; d.moveR = -1; }
					else if (7-ff<=rr && 7-ff<=7-rr) { d.moveF = 8; d.moveR = rr; }
					else if (ff>=7-rr && 7-ff>=7-rr) { d.moveF = ff; d.moveR = 8; }
					this.posPairs.push(d);
				}
			}
		}
		ui.ctx.save();
		ui.ctx.beginPath();
		ui.ctx.rect(0,0,b1.offset,b1.offset);
		ui.ctx.clip();
		this.aniTimer = setTimeout(aniPos, this.animsec);
	}
	sound ( d ) {
		if (SILENT==0) {
			if (d.takenPiece!=EMPTY) soundCapture.play(); 
			else if (d.movePiece[1]=='K' && Math.abs(d.moveF-d.newF)==2) soundCastle2.play();
			else soundMove.play();
		}
	}
	sleep(milliseconds) {
		const date = Date.now();
		let currentDate = null;
		do {
			currentDate = Date.now();
		} while (currentDate - date < milliseconds);
	}
}
function ani() {
	var dTremble = ( (a.attacker && a.forward) ? 3 : 0 );
	b1.render();
	a.pos.b[ a.d.moveF ][ a.d.moveR ] = a.d.leftPiece;
	drawPieces(a.pos.b);
	// drawArrows(g.ply);
	var mF = b1.flip?7-a.d.moveF:a.d.moveF;
	var mR = b1.flip?7-a.d.moveR:a.d.moveR;
	var nF = b1.flip?7-a.d.newF:a.d.newF;
	var nR = b1.flip?7-a.d.newR:a.d.newR;
	a.aniStep--;
	if ( a.aniStep >= 0 ) {
		drawAbsPiece( a.d.movePiece, 
			a.linear( b1.f2x(mF)+b1.d/2-14*b1.dp/30, b1.f2x(nF)+b1.d/2-14*b1.dp/30, a.aniStep), 
			a.linear( b1.r2y(mR)+b1.d/2-14*b1.dp/30, b1.r2y(nR)+b1.d/2-14*b1.dp/30, a.aniStep),
			14*b1.dp/15 );
	}
	else if (a.aniStep == -1) {
		drawAbsPiece( a.d.movePiece, b1.f2x(nF)+b1.d/2-14*b1.dp/30-dTremble, b1.r2y(nR)+b1.d/2-14*b1.dp/30,
		14*b1.dp/15 );
	}
	else if (a.aniStep == -2) {
		drawAbsPiece( a.d.movePiece, b1.f2x(nF)+b1.d/2-14*b1.dp/30+dTremble, b1.r2y(nR)+b1.d/2-14*b1.dp/30,
		14*b1.dp/15 );
	}
	else if (a.aniStep == -3) {
		drawAbsPiece( a.d.movePiece, b1.f2x(nF)+b1.d/2-14*b1.dp/30, b1.r2y(nR)+b1.d/2-14*b1.dp/30,
		14*b1.dp/15 );
	}
	drawArrows(g.ply);
	if (a.aniStep < -3) {
		nextPos(true);
		callbackMove();
	}
	else setTimeout( ani, a.animsec );
}
function aniPos() {
	b1.render();
	a.aniStep--;
	if ( a.aniStep >= 0 ) {
		for (var i=0; i<a.posPairs.length; i++) {
			var mF = b1.flip?7-a.posPairs[i].moveF:a.posPairs[i].moveF;
			var mR = b1.flip?7-a.posPairs[i].moveR:a.posPairs[i].moveR;
			var nF = b1.flip?7-a.posPairs[i].newF:a.posPairs[i].newF;
			var nR = b1.flip?7-a.posPairs[i].newR:a.posPairs[i].newR;
			drawAbsPiece( a.posPairs[i].movePiece, 
				a.linear( b1.f2x(mF)+b1.d/2-14*b1.dp/30, b1.f2x(nF)+b1.d/2-14*b1.dp/30, a.aniStep), 
				a.linear( b1.r2y(mR)+b1.d/2-14*b1.dp/30, b1.r2y(nR)+b1.d/2-14*b1.dp/30, a.aniStep),
				14*b1.dp/15);
		}
		setTimeout( aniPos, a.animsec );
	}
	else {
		ui.ctx.restore();
		callbackAnimPos();
	}
}
