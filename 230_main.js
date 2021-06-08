/* 
	Copyright Peter Csurgay 2020-2021
	Todo UI:
		lines tree building and playback
		read PGN and covert to full pgn data
		save PGN to file
		read PGN from file
		scroll pgn window
		mouseover tooltips
		labelbox for eval/clk
		fix 1-0 ending to come after last move comments
		annotation bubbles (! ? ?? !! ?!...)
		interrupt long thinking and long move indication
	
	Todo engine:
		correct make and unmake move
		stack for restoring canCastle enpassantTarget etc.
		detect repetition in search
		go for exchange when ahead, avoid when behind
		go for draw when behind, avoid when ahead
		
	Feature history:
		menu buttons
		random legitimate move
		demo mode
		status info
		promotion
		enpassant
		fifty moves counter
		detect mate, checkmate in 1
		detect draw: stalemate, insufficient material, fifty moves
		do mate if possible
		castling move and canCastle disable
		no castling in-chess/thru-chess
		undo move
		play backward, forward
		show FEN and PGN
		clickable PGN
		read UCI long algebraic notation game and playback
		arrow indicate last and next move
		toolbar with buttons
		check validity of manual moves
		change color to move (AI)
		evaluation of new fen (material, mobility, attacks)
		search best move (depth 1 and 2 and 3)
		detect draw: repetition
		setup position (delete, move, and insert pieces)
		promotion interactive choice
		detect checkmate in search
		save / load fen
		flip position (pieces, squarenames, arrows)
		animate moves
		consolidate moves (click, ai, forward/takeback)
		move sound, take sound, castle sound
		unambiguation file and/or row for display PGN
		drag pieces for move
		pgn control keys (right left home end)
		drag with animation (piece dragged with mouse)
		tremble piece a little when attacks
		animated position changes
		annotaion color arrows and square target circles
		PGN tokenizer for annotation (!?, +-, Clk, Eval...)
		mouse wheel fwd/bwd
		new setup selector
		layouts functions enable draw/click
		resize control for board
		save arrow/square annotation into pgn tags
		flip and pgn load board animation
		textbox, mutiple, blinking cursor
		move input command
		takeback before disambiguation calc
		use mouse shift keys instead of shift states
*/

function main() {
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	if (urlParams.has('NOSVG')) NOSVG = urlParams.get('NOSVG');
	if (urlParams.has('NOIMAGEDATA')) NOIMAGEDATA = urlParams.get('NOIMAGEDATA');
	if (urlParams.has('PGNLOG')) PGNLOG = urlParams.get('PGNLOG');
	if (urlParams.has('SILENT')) SILENT = urlParams.get('SILENT');
	if (urlParams.has('EVENTLOG')) EVENTLOG = urlParams.get('EVENTLOG');
	if (urlParams.has('SMALLBOARD')) SMALLBOARD = urlParams.get('SMALLBOARD');
	if (urlParams.has('TEXTBOX')) TEXTBOX = urlParams.get('TEXTBOX');
	ui.loadPieces();
	ui.ticktimer = setInterval(tick, 100)
	initializeSavedFens(setup);
	initGame( initialPosition );
	ui.canvas = document.getElementById("mycanvas");
	ui.ctx = ui.canvas.getContext("2d");
	ui.ctx.imageSmoothingEnabled = false;
	ui.canvas.width = window.innerWidth; ui.canvas.height = window.innerHeight;
	window.addEventListener("wheel", doWheel, false);
	document.addEventListener('keydown', doKeyDown, false);
	document.addEventListener('keyup', doKeyUp, false);
	window.addEventListener('resize', function(event) { doResize(); });
	ui.canvas.addEventListener('mouseup', doMouseUp, false);
	ui.canvas.addEventListener('mousedown', doMouseDown, false);
	ui.canvas.addEventListener('mousemove', doMouseMove, false);
	ui.eventTimer = setTimeout( fsmTick, 100 );
}
var lan = 'c2c4 g8f6 b1c3 e7e6 e2e4 c7c5 g1f3 b8c6 f1e2 e6e5 e1g1 f8e7 d2d3 e8g8 a1b1 a7a6 a2a4 d7d6 f3e1 c8d7 e1c2 a8b8 c1d2 f8e8 b2b3 h7h6 h2h3 c6d4 b3b4 e7f8 b4b5 d4e6 b5b6 e6d4 f2f4 e5f4 d2f4 d4e6 f4g3';
function playLongAlgebraicNotation(lan) {
	var l = lan.split(' ');
	for (var i=0; i<l.length; i++) {
		var m = new MoveData();
		m.moveF = 'abcdefgh'.indexOf( l[i][0] );
		m.moveR = parseInt( l[i][1] ) - 1;
		m.newF = 'abcdefgh'.indexOf( l[i][2] );
		m.newR = parseInt( l[i][3] ) - 1;
		m.movePiece = pos.b[m.moveF][m.moveR];
		m.leftPiece = EMPTY;
		m.takenPiece = pos.b[m.newF][m.newR];
		m.becomesPiece = pos.b[m.moveF][m.moveR];
		var move = new Move();
		move.setMoveData(m);
		doMove( move, 'pgn' ); // this is obsolete now!
	}
}
function onloadCallback() {
	// playLongAlgebraicNotation(lan);  // result in fullPgnString
	nextPos();
}
