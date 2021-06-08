class Annotation {
	constructor() {
		this.last = []; // ply last move arrow
		this.next = []; // ply next move arrow
		this.arrows = []; // ply ctrl/shift arrows
		this.squares = []; // ply ctrl/shift squares
		this.comments = []; // ply comments
		this.eval = ''; // evaluation +-
		this.clk = ''; // clock
		this.tags = []; // ply tags
		this.values = []; // ply values for tags
	}
}
class Game {
	constructor() {
		this.layout = SM.L.PLAY;
		this.state = SM.S.IDLE;
		this.nextStateValue = '';
		this.ply = 0;
		this.maxPly = 0;
		this.bs = []; // boards
		this.fens = [];
		this.moves = []; // [ MoveData ]
		this.ann = []; // annotations [0]notes [1]lastArrow[4] [2]nextArrow[4] [3]CtrlArrows[] [4]CtrlSquares[]
		this.fullPgn = []; // classic pgn game text format
		this.clickPgn = []; // click boxes in the pgn moves window
		this.fullPgnString = ''; // complete pgn of the game, assembled during pgn display
		this.annotatedPgnString = ''; // full pgn with tags and arrows
	}
	initFen(fen = initialPosition) {
		this.layout = SM.L.PLAY;
		this.state = SM.S.IDLE;
		this.nextStateValue = SM.S.IDLE;
		this.ply = 0;
		this.maxPly = 0;
		this.bs = [];
		this.fens = [];
		this.moves = [];
		this.ann = [];
		this.fullPgn = [];
		this.clickPgn = [];
		this.fens[0] = fen;
		this.bs[0] = fen2pos( fen );
		this.initMoveAnn(0);
	}
	inState( state ) {
		if (typeof state !== 'undefined') {
			return this.state == state;
		}
		else {
			alert('undefined state in Game.inState()');
			console.log(new Error().stack);
		}
	}
	nextState( state ) {
		if (typeof state !== 'undefined') {
			// console.log( 'State: ' + this.state + ' -> ' + state );
			this.nextStateValue = state;
		}
		else {
			alert('undefined state in Game.nextState()');
			console.log(new Error().stack)
		}
	}
	setNextState() {
		if (typeof this.nextStateValue !== 'undefined') {
			this.state = this.nextStateValue;
		}
		else {
			alert('undefined nextStateValue in Game.setNextState()')
			console.log(new Error().stack);
		}
	}
	initMoveAnn(ply) {
		this.ann[ply] = new Annotation(); // this move's empty ann (nextMoveArrow)
		this.ann[ply+1] = new Annotation(); // nextMove's empty ann (prevMoveArrow)
	}
}

// pgn window
class Pgn extends Rect {
	constructor() {
		super(panel, 0,210,500,350, 'frame', layout.Main);
		this.d = 5; // padding
		this.l = 20; // line spacing
		this.ptr = -1; // ptr to actual pgn in const array
		this.nPgns = constPgns.length; // number of pgns in const array
		this.color_background = COLOR.PGN.BACKGROUND;
		this.color_frame = COLOR.PGN.FRAME;
		this.color = COLOR.PGN.COLOR;
		this.anyAnnotation = false; // for 1... black move number calc
	}
	render() {
		super.render();
		ui.ctx.beginPath();
		var posx = pgn.ax+2*pgn.d, posy = pgn.ay+pgn.d;
		g.fullPgnString = '';
		g.annotatedPgnString = this.annotation(g.ann[0])+' ';
		var moveNumber = '';
		var whitesMove = true;
		var blackMoveNumberNeeded = false;
		for (var i=1; i<=g.maxPly; i++) {
			var str = g.moves[i].display;
			var boldFace = (i==g.ply)?'bold':'';
			whitesMove = (i % 2 == 1);
			if (whitesMove) moveNumber = '' + ((i+1)/2) + '. ';
			else moveNumber = '' + (i/2) + '... ';
			var noAnnMoveNumber = whitesMove?moveNumber:'';
			var mT = Math.round(drawText(4,'bold','left','top',noAnnMoveNumber+str,posx,posy,'measure'));
			if ( posx + mT +pgn.d >= pgn.ax+pgn.w-5*pgn.d) { posx = pgn.ax+2*pgn.d; posy += pgn.l; }
			drawText(4,boldFace,'left','top',noAnnMoveNumber+str,posx,posy);
			g.fullPgnString += whitesMove?moveNumber+str+' ':str+' ';
			this.anyAnnotation = false;
			var a = g.ann[i];
			str += this.annotation(a); // changes anyAnnotation
			if (!whitesMove && !blackMoveNumberNeeded) moveNumber = '';
			if (whitesMove) blackMoveNumberNeeded = this.anyAnnotation;
			g.annotatedPgnString += moveNumber + str + ' ';
			g.clickPgn[i] = [ i, posx-2, posy-2, posx+mT+2, posy+pgn.l+2 ];
			posx += mT + pgn.d;
		}
		ui.ctx.stroke();
		ui.ctx.closePath();
	}
	annotation(a) {
		var str = '';
		if (a.tags.length>0) {
			this.anyAnnotation = true;
			str += ' {';
			for (var j=0; j<a.tags.length; j++) str += ' [' + a.tags[j] + ' ' + a.values[j] + ']';
			str += ' }';
		}
		if (a.comments.length>0) {
			this.anyAnnotation = true;
			for (var j=0; j<a.comments.length; j++) str += ' { ' + a.comments[j] + ' }';
		}
		if (a.arrows.length>0 || a.squares.length>0) {
			str += ' {';
			this.anyAnnotation = true;
			for (var j=0; j<a.arrows.length; j++) {
				str += ' [%ar ' + a.arrows[j] + ']';
			}
			for (var j=0; j<a.squares.length; j++) {
				str += ' [%sq ' + a.squares[j] + ']';
			}
			str += ' }';
		}
		return str;
	}
	clicked(mx,my) {
		for (var i=1; i<=g.maxPly; i++) {
			var p = g.clickPgn[i];
			if (mx>p[1] && my>p[2] && mx<p[3] && my<p[4]) {
				if (g.ply != i ) {
					g.ply = i;
					nextPos(true,true);
				}
			}
		}
	}
}
