class Button extends Rect {
	constructor() {
		super(null, 0,0,0,0, 'frame', layout.All);
		this.color_background = COLOR.BUTTON.BACKGROUND;
		this.color_frame = COLOR.BUTTON.FRAME;
		this.color = COLOR.BUTTON.COLOR;
	}
}
class ButtonColor extends Button {
	render() {
		super.render();
		ui.ctx.beginPath();
		var img = (pos.color=='w'?ui.imgs[6]:ui.imgs[0]);
		if (NOSVG) drawText(6, '', 'center', 'middle', pos.color, this.ax+this.w/2, this.ay+this.h/2);
		else ui.ctx.drawImage(img, this.ax+this.w/2-this.h/2, this.ay, this.h, this.h);
		ui.ctx.stroke();
	}
	clicked() {
		var sF = pos.fen.split(' ');
		pos.color = oppColor( pos.color );
		pos.fen = sF[0] + ' ' + pos.color + ' ' + sF[2] + ' ' + sF[3] + ' '+ sF[4] + ' ' + sF[5];
		g.fens[g.ply] = pos.fen;
		nextPos();
	}
}
function actionButtonHome() {
	if (g.ply != 0) {
		g.ply=0; 
		nextPos(true,true);
	}
}
class ButtonHome extends Button {
	render(x,y,w,h) {
		super.render();
		ui.ctx.beginPath();
		moveTo(this.ax+4*this.w/5, this.ay+this.h/5);
		lineTo(this.ax+4*this.w/5, this.ay+4*this.h/5);
		lineTo(this.ax+2*this.w/5, this.ay+this.h/2);
		lineTo(this.ax+4*this.w/5, this.ay+this.h/5);
		moveTo(this.ax+this.w/5, this.ay+this.h/5);
		lineTo(this.ax+this.w/5, this.ay+4*this.h/5);
		lineTo(this.ax+3*this.w/10, this.ay+4*this.h/5);
		lineTo(this.ax+3*this.w/10, this.ay+this.h/5);
		lineTo(this.ax+this.w/5, this.ay+this.h/5);
		ui.ctx.stroke();
	}
	clicked() {
		actionButtonHome();
	}
}
function actionButtonTakeback() {
	if (g.ply>0) {
		a.pos.initPos( g.bs[g.ply] );
		var d = g.moves[ g.ply ];
		var tbd = new MoveData();
		tbd.movePiece = d.movePiece; tbd.newF = d.moveF; tbd.newR = d.moveR;
		tbd.leftPiece = d.takenPiece; tbd.takenPiece = d.takenPiece;
		tbd.moveF = d.newF; tbd.moveR = d.newR; tbd.becomesPiece = d.movePiece;
		g.ply--;
		a.sound( d );
		a.anim( tbd, 'click', false );
	}
}
class ButtonTakeback extends Button {
	render() {
		super.render();
		ui.ctx.beginPath();
		moveTo(this.ax+4*this.w/5, this.ay+this.h/5);
		lineTo(this.ax+4*this.w/5, this.ay+4*this.h/5);
		lineTo(this.ax+this.w/5, this.ay+this.h/2);
		lineTo(this.ax+4*this.w/5, this.ay+this.h/5);
		ui.ctx.stroke();
	}
	clicked() {
		actionButtonTakeback();
	}
}
function actionButtonForward() {
	if (g.ply<g.maxPly) {
		a.pos.initPos( g.bs[g.ply] );
		g.ply++;
		a.sound( g.moves[ g.ply ] );
		a.anim( g.moves[ g.ply ], 'click', true );
	}
}
class ButtonForward extends Button {
	render() {
		super.render();
		ui.ctx.beginPath();
		moveTo(this.ax+this.w/5, this.ay+this.h/5);
		lineTo(this.ax+this.w/5, this.ay+4*this.h/5);
		lineTo(this.ax+4*this.w/5, this.ay+this.h/2);
		lineTo(this.ax+this.w/5, this.ay+this.h/5);
		ui.ctx.stroke();
	}
	clicked() {
		actionButtonForward();
	}
}
function actionButtonEnd() {
	if (g.ply != g.maxPly) {
		g.ply=g.maxPly;
		nextPos(true,true);
	}
}
class ButtonEnd extends Button {
	render() {
		super.render();
		ui.ctx.beginPath();
		moveTo(this.ax+this.w/5, this.ay+this.h/5);
		lineTo(this.ax+this.w/5, this.ay+4*this.h/5);
		lineTo(this.ax+3*this.w/5, this.ay+this.h/2);
		lineTo(this.ax+this.w/5, this.ay+this.h/5);
		moveTo(this.ax+4*this.w/5, this.ay+this.h/5);
		lineTo(this.ax+4*this.w/5, this.ay+4*this.h/5);
		lineTo(this.ax+7*this.w/10, this.ay+4*this.h/5);
		lineTo(this.ax+7*this.w/10, this.ay+this.h/5);
		lineTo(this.ax+4*this.w/5, this.ay+this.h/5);
		ui.ctx.stroke();
	}
	clicked() {
		actionButtonEnd();
	}
}
class ButtonDepth extends Button {
	render() {
		super.render();
		drawText(4,'','center','middle','d:'+b1.depth,this.ax+this.w/2,this.ay+this.h/2);
	}
	clicked() {
		b1.depth = (b1.depth + 1) % 4;
		nextPos();
	}
}
function doAiMove( pos ) {
	var move = searchMove( pos );
	m.movePiece = move[0]; m.leftPiece = EMPTY;
	m.moveF = move[1]; m.moveR = move[2];
	m.newF = move[3]; m.newR = move[4];
	m.takenPiece = move[5]; m.becomesPiece = move[6];
	doMove( m, 'click' );
}
class ButtonAIMove extends Button {
	render() {
		super.render();
		drawText(4,'','center','middle','MOVE',this.ax+this.w/2,this.ay+this.h/2);
	}
	clicked() {
		doAiMove( pos );
	}
}
var demoTimer;
class ButtonDemo extends Button {
	render() {
		super.render();
		var txt = b1.demo?'DEMO':'demo';
		drawText(4,'','center','middle',txt,this.ax+this.w/2,this.ay+this.h/2);
	}
	clicked() {
		b1.demo = !b1.demo;
		doRedraw();
		if (b1.demo) demoTimer = setTimeout(function() { doAiMove(pos);}, 50);
	}
}
function actionButtonSquareNames(value) {
	b1.squareNames = value;
	doRedraw();
}
class ButtonSquareNames extends Button {
	render() {
		super.render();
		var txt = b1.squareNames?'A1':'a1';
		drawText(6,'','center','middle',txt,this.ax+this.w/2,this.ay+this.h/2);
	}
	clicked() {
		actionButtonSquareNames(!b1.squareNames);
	}
}
class ButtonFlip extends Button {
	render() {
		super.render();
		var txt = b1.flip?'FLIP':'flip';
		drawText(4,'','center','middle',txt,this.ax+this.w/2,this.ay+this.h/2);
	}
	clicked() {
		var spos = new Position(); spos.initPos(pos); // saved position
		for (var f=0; f<8; f++) for (var r=0; r<8; r++) {
			var p = spos.b[f][r].substr(0,2);
			var other = 'none';
			for (var ff=0; ff<8; ff++) for (var rr=0; rr<8; rr++) {
				if (spos.b[ff][rr].substr(0,2)==p && (ff!=f || rr!=r)) {
					if (p[1]!='P') {
						other = [ff,rr];
					}
					else if (spos.b[ff][rr][2]==''+(9-parseInt(spos.b[f][r][2]))) {
						other = [ff,rr];
					}
				}
			}
			if ('QK'.indexOf(p[1])!=-1 || other=='none')
				a.pos.b[7-f][7-r] = spos.b[f][r];
			else {
				a.pos.b[7-f][7-r] = spos.b[other[0]][other[1]];
				a.pos.b[7-other[0]][7-other[1]] = spos.b[f][r];
			}
		}
		a.animPos();
		pos.initPos( spos );
		b1.flip = !b1.flip;
	}
}
class ButtonAttackSpots extends Button {
	render() {
		super.render();
		var rgb = b1.attackSpots?[210,40,40]:[100,100,100];
		drawSpot( rgb, this.ax+this.w/2, this.ay+this.h/2, this.h/3 );
	}
	clicked() {
		b1.attackSpots = !b1.attackSpots;
		nextPos();
	}
}
class ButtonTrail extends Button {
	render() {
		super.render();
		var txt = b1.trail?'Trail':'trail';
		drawText(4,'','center','middle',txt,this.ax+this.w/2,this.ay+this.h/2);
	}
	clicked() {
		b1.trail = !b1.trail;
		nextPos();
	}
}
class ButtonSetupPos extends Button {
	render() {
		super.render();
		drawText(4,'','center','middle','setup',this.ax+this.w/2,this.ay+this.h/2);
	}
	clicked() {
		g.nextState(SM.S.SETUP.IDLE); g.state = SM.S.SETUP.IDLE; // this requires for immediate effect
		setup.savedSetupFen = [ pos.fen, b1.title.text ];
		actionButtonSquareNames(true);
		nextPos();
		ss.render();
	}
}
class ButtonPgn extends Button {
	constructor() {
		super();
		this.s; // tokenizer string
		this.c; // tokenizer lookahead char
		this.ptr; // tokenizer pointer
		this.pgn; // full pgn as a string
		this.l // pgn length
	}
	render() {
		super.render();
		drawText(4,'','center','middle','pgn',this.ax+this.w/2,this.ay+this.h/2);
	}
	clicked() {
		a.pos.initPos(pos);
		pgn.ptr = ( pgn.ptr + 1 ) % pgn.nPgns;
		this.pgn = constPgns[pgn.ptr][0];
		b1.title.text = '';
		// b1.title.text += pgn.ptr + '. ';
		b1.title.text += constPgns[pgn.ptr][1];
		g.initFen();
		pos.initFen();
		this.l = this.pgn.length; this.ptr = 0;
		while( this.ptr<this.l ) {
			if (!this.endOfGame()) {
				this.c = this.spaces();
				if (this.c=='{') { this.comment(); this.c = this.spaces(); }
				this.moveNumber(); this.spaces();
				this.pgnMove(); this.c = this.spaces();
				if (this.c=='{') { this.comment(); this.c = this.spaces(); }
				if (this.c=='(') { this.sideline(); this.c = this.spaces(); }
				if (!this.endOfGame()) {
					if ('123456789'.indexOf(this.c) >=0) { this.moveNumber(); this.spaces(); }
					this.pgnMove(); this.c = this.spaces();
					if (this.c=='{') { this.comment(); this.c = this.spaces(); }	
					if (this.c=='(') { this.sideline(); this.c = this.spaces(); }
				}
			}
		}
		a.animPos();
		if (PGNLOG) console.log('pgn loaded');
	}
	endOfGame() {
		var savedPtr = this.ptr;
		this.s = '';
		while( this.ptr<this.l && this.pgn[this.ptr] != ' ' ) { this.s += this.pgn[this.ptr]; this.ptr++; }
		if (this.s=='1-0' || this.s=='0-1' || this.s=='1/2-1/2') return true;
		else { this.ptr = savedPtr; return false; }
	}
	moveNumber() {
		this.s = '';
		while( this.ptr<this.l && this.pgn[this.ptr] != '.' ) { this.s += this.pgn[this.ptr]; this.ptr++; }
		while( this.pgn[this.ptr]=='.' ) { this.s += this.pgn[this.ptr]; this.ptr++; }
		if (PGNLOG) console.log(this.s);
	}
	spaces() {
		while( this.ptr<this.l && this.pgn[this.ptr] == ' ' ) { this.ptr++; }
		return this.pgn[this.ptr];
	}
	pgnMove() {
		this.s = '';
		while( this.ptr<this.l && this.pgn[this.ptr] != ' ' ) { this.s += this.pgn[this.ptr]; this.ptr++; }
		if (this.ptr<=this.l) {
			// look for annotation ( + ! ? !! ?? !? ?! )
			var t1 = this.s.slice(-1);
			var t2 = this.s.slice(-2);
			var ending = '';
			if ( ['!!','??','!?','?!'].includes(t2) ) {
				this.s = this.s.substr(0,this.s.length-2);
				ending = t2;
			}
			else if ( ['+','#','!','?'].includes(t1) ) {
				this.s = this.s.substr(0,this.s.length-1);
				ending = t1;
			}
			if (PGNLOG) {
				console.log('pgn move: ' + this.s);
				console.log('ending annotation: ' + ending)
			}
			doPgnMove( g,pos,this.s ); this.ptr++;
		}
	}
	comment() {		// eat up {} comments if there is any
		while ( this.pgn[this.ptr] == '{' ) {
			this.s = '';
			this.ptr++;
			this.spaces();
			while( this.ptr<this.l && this.pgn[this.ptr] != '}' ) {
				if (this.pgn[this.ptr]=='[') { 
					this.ptr++;
					this.spaces();
					if (this.pgn[this.ptr] == '%') {
						var tag = '';
						while( this.pgn[this.ptr] != ' ' ) {
							tag += this.pgn[this.ptr];
							this.ptr++;
						}
						if (PGNLOG) console.log('tag: ' + tag);
						this.spaces();
						if (this.pgn[this.ptr] != ']') {
							var value = '';
							while( this.pgn[this.ptr] != ']' ) {
								value += this.pgn[this.ptr];
								this.ptr++;
							}
							if (PGNLOG) console.log('tag value: ' + value);
							if (tag=='%ar') { g.ann[g.ply].arrows.push(value); }
							else if (tag=='%sq') { g.ann[g.ply].squares.push(value); }
							else if (tag=='%eval') { g.ann[g.ply].eval = value; }
							else if (tag=='%clk') { g.ann[g.ply].clk = value; }
							else { g.ann[g.ply].tags.push(tag); g.ann[g.ply].values.push(value); }
							this.ptr++;
							this.spaces();
						}
					}
					else alert('pgn tag without %, see log');
				}
				else {
					this.s += this.pgn[this.ptr]; this.ptr++;
				}
			}
			if (this.s.length>0) {
				if (PGNLOG) console.log('comment: ' + this.s);
				g.ann[g.ply].comments.push(this.s);
			}
			this.ptr++;
			this.spaces();
		}
	}
	sideline() {		// eat up () sideline if there is any, NO NESTING YET!!!
		while ( this.pgn[this.ptr] == '(' ) {
			this.s = '';
			this.ptr++;
			while( this.ptr<this.l && this.pgn[this.ptr] != ')' ) { this.s += this.pgn[this.ptr]; this.ptr++; }
			if (PGNLOG) console.log('sideline: ' + this.s);
			this.ptr++;
			this.spaces();
		}
	}
}
class ButtonSetupNew extends Button {
	render() {
		super.render();
		drawText(4,'','center','middle','New',this.ax+this.w/2,this.ay+this.h/2);
	}
	clicked() {
		setup.modified = true;
		pos.initFen( initialPosition );
		g.fens[g.ply] = pos.fen;
		nextPos();
	}
}
class ButtonSetupEmpty extends Button {
	render() {
		super.render();
		drawText(4,'','center','middle','Empty',this.ax+this.w/2,this.ay+this.h/2);
	}
	clicked() {
		setup.modified = true;
		pos.initFen( '8/8/8/8/8/8/8/8 w KQkq - 0 1' );
		g.fens[g.ply] = pos.fen;
		nextPos();
	}
}
class ButtonSetupLoad extends Button {
	render() {
		super.render();
		drawText(4,'','center','middle','Load',this.ax+this.w/2,this.ay+this.h/2);
	}
	clicked() {
		setup.modified = true;
		pos.initFen( setup.savedFen[ setup.pSavedFen ][0] );
		b1.title.text = setup.savedFen[ setup.pSavedFen ][1];
		setup.pSavedFen = ( setup.pSavedFen + 1 ) % setup.nSavedFen;
		g.fens[g.ply] = pos.fen;
		nextPos();
	}
}
class ButtonSetupSave extends Button {
	render() {
		super.render();
		drawText(4,'','center','middle','Save',this.ax+this.w/2,this.ay+this.h/2);
	}
	clicked() {
		savedFen[ nSavedFen ] = [];
		savedFen[ nSavedFen ][0] = fenString;
		savedFen[ nSavedFen++ ][1] = 'Saved setup position';
	}
}
class ButtonSetupRevert extends Button {
	render() {
		super.render();
		drawText(4,'','center','middle','Reset',this.ax+this.w/2,this.ay+this.h/2);
	}
	clicked() {
		setup.modified = false;
		pos.initFen( setup.savedSetupFen[0] );
		b1.title.text = setup.savedSetupFen[1];
		g.fens[g.ply] = pos.fen;
		nextPos();
	}
}
class ButtonSetupExit extends Button {
	render() {
		super.render();
		drawText(4,'','center','middle','Exit',this.ax+this.w/2,this.ay+this.h/2);
	}
	clicked() {
		if (setup.modified) initGame(pos.fen);
		g.nextState(SM.S.IDLE); g.state=SM.S.IDLE; // to take immediate effect
		doRedraw();
	}
}
