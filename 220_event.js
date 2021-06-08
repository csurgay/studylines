class Event {
	constructor() {
		this.eventName = '';
		this.evt = null;
		this.now = 0;
		this.mx = -1;
		this.my = -1;
		this.onBoard = false;
		this.f = -1;
		this.r = -1;
		this.button = -1;
	}
	setEventName( eventName ) {
		if (typeof eventName !== 'undefined') {
			this.eventName=eventName;
		}
		else alert('undefined event in setEvent()');
	}
	event( eventName ) {
		if (typeof eventName !== 'undefined') {
			return this.eventName==eventName;
		}
		else alert('undefined event in event()');
	}
}
// mouse right click
window.oncontextmenu = function (evt) {
    return false;     // cancel default menu
}
function doKeyDown(evt) {
	if (ui.lastEvent.eventName!=SM.E.KEYDOWN || Date.now() - ui.lastEvent.now > 10) {
		ui.push(SM.E.KEYDOWN,evt);
	}
}
function doKeyUp(evt) {
	if (ui.lastEvent.eventName!=SM.E.KEYUP || Date.now() - ui.lastEvent.now > 10) {
		ui.push(SM.E.KEYUP,evt);
	}
}
function doMouseDown(evt) {
	if (evt.which == 2) return; // middle (wheel) button ignore
	else if (evt.which == 1) ui.push(SM.E.MOUSEDOWN,evt);
	else if (evt.which == 3) ui.push(SM.E.RIGHTDOWN,evt);
}
function doMouseMove(evt) {
	ui.push(SM.E.MOUSEMOVE,evt);
}
function doMouseUp(evt) {
	if (evt.which == 2) return; // middle (wheel) button ignore
	else if (evt.which == 1) ui.push(SM.E.MOUSEUP,evt);
	else if (evt.which == 3) ui.push(SM.E.RIGHTUP,evt);
}
function doWheel(evt) {
	ui.push(SM.E.MOUSEWHEEL,evt);
}
function promotion() {
	return (m.becomesPiece[1] == 'P') && // human move, no real 'becomesPiece' yet
		( m.movePiece.substr(0,2)=='wP' && m.newR==7)
		|| (m.movePiece.substr(0,2)=='bP' && m.newR==0);
}
function arrayIndexOf(haystack, needle){
  var i, j, current;
  for(i = 0; i < haystack.length; ++i){
    if(needle.length === haystack[i].length){
      current = haystack[i];
      for(j = 1; j < needle.length -1 && needle[j] === current[j]; ++j); // -1 to exclude dash D/S
      if(j === needle.length -1)
        return i;
    }
  }
  return -1;
}
var arrowF, arrowR, button;
function adjustMouseXY(e) {
	if (e.mx<b1.f2x(0)+b1.d/2) e.mx=b1.f2x(0)+b1.d/2;
	if (e.mx>b1.f2x(7)+b1.d/2) e.mx=b1.f2x(7)+b1.d/2;
	if (e.my>b1.r2y(0)+b1.d/2) e.my=b1.r2y(0)+b1.d/2;
	if (e.my<b1.r2y(7)+b1.d/2) e.my=b1.r2y(7)+b1.d/2;
	if (e.f<0) e.f=0; 
	if (e.f>7) e.f=7;
	if (e.r<0) e.r=0; 
	if (e.r>7) e.r=7;
}
async function paste(textbox, begin, end) { // paste from clipboard
	try {
		const pastetext = await navigator.clipboard.readText();
		textbox.text = begin + pastetext + end;
		textbox.ptrCursor += pastetext.length;
		doRedraw();
		return true;
	}
	catch (error) {
		logerror('paste', 'error', error);
	}
}
async function copy(text) { // copy to clipboard
	try {
		await navigator.clipboard.writeText(text);
		return true;
	}
	catch (error) {
		logerror('copy', 'error', error);
	}
}
function fsmTick() {
	ui.cursorBlinkTimer--;
	if (ui.cursorBlinkTimer<=0) {
		ui.cursorBlinkTimer = 50;
		if (ui.focus != null) {
			ui.focus.cursorBlink = !ui.focus.cursorBlink;
			ui.focus.render();
		}
	}
	if (ui.events.length > 0) {
		var e = ui.events.shift();
		if (EVENTLOG==1) console.log( g.state + ':' + e.eventName );
		g.nextState( g.state );
		if (g.inState(SM.S.IDLE)) m.targetSquares = [];
		// Promotion
		if (g.inState(SM.S.PROMOTION) && e.event(SM.E.MOUSEDOWN)) {
			m.becomesPiece = scBox[3][4]; // choose Queen if none selected
			for (var p=0; p<4; p++) {
				if (e.mx>scBox[p][0] && e.mx<scBox[p][0]+scBox[p][2] && e.my>scBox[p][1] && e.my<scBox[p][1]+scBox[p][3]) {
					m.becomesPiece = scBox[p][4];
				}
		}
			g.nextState(SM.S.IDLE);
			g.setNextState();
			doMove( m, 'click' );
		}
		// Resize
		else if (g.inState(SM.S.IDLE) && e.event(SM.E.MOUSEDOWN) && b1.resizeControl.cursorIn(e.mx,e.my)) {
			g.nextState( SM.S.RESIZE );
			ui.clickedMy = e.my;
		}
		else if (g.inState(SM.S.RESIZE)) {
			if (e.event(SM.E.MOUSEMOVE)) {
				b1.h = b1.h - ui.clickedMy + e.my; ui.clickedMy = e.my;
				g.nextState( SM.S.RESIZE );
				doRedraw();
			}
			else if (e.event(SM.E.MOUSEUP)) {
				g.nextState( SM.S.IDLE );
				doRedraw();
			}
		}
		// Click withinBoard or Toolbar/PGN
		else if (g.inState(SM.S.IDLE) && e.event(SM.E.MOUSEDOWN)) {
			if (e.withinBoard) {
				m.movePiece = pos.b[e.f][e.r];
				// if color matches and that piece can move
				if ( m.movePiece[0]==pos.color && calcMoves(pos, e.f, e.r, 'moves', pos.b[e.f][e.r], 'normal').length>0) {
					m.moveF = e.f; m.moveR = e.r;
					drawSquare(e.f,e.r,'inMove');
					drawPiece(pos.b[e.f][e.r],e.f,e.r);
					var moves = calcMoves(pos, e.f, e.r, 'moves', pos.b[e.f][e.r], 'normal');
					for (var i=0; i<moves.length; i++) {
						// var x = moves[i][0]; var y = moves[i][1];
						// drawSquare( x, y, 'target');
						// drawPiece( pos.b[ x ][ y ], x, y);
						m.targetSquares.push(moves[i]);
					}
					drawTargets(m);
					g.nextState( SM.S.CLICKED );
				}
			}
			// Toolbars and PGN clicks
			else {
				if (pgn.cursorIn(e.mx,e.my)) pgn.clicked(e.mx,e.my);
				if (toolbar.cursorIn(e.mx,e.my)) toolbar.clicked(e.mx,e.my);
				if (toolbar2.cursorIn(e.mx,e.my)) toolbar2.clicked(e.mx,e.my);
				for (var i=0; i<ui.textboxes.length; i++) {
					if (ui.textboxes[i].enabled && ui.textboxes[i].cursorIn(e.mx,e.my))
						ui.textboxes[i].clicked(e.mx,e.my);
				}
			}
		}
		// MoveStart
		else if (g.inState(SM.S.CLICKED) && e.event(SM.E.MOUSEUP)) { 
			if (e.withinBoard && e.f==m.moveF && e.r==m.moveR) {
				g.nextState(SM.S.MOVESTART);
			}
			else {
				g.nextState(SM.S.IDLE);
				nextPos();
			}
		}
		// MoveEnd (second click)
		else if (g.inState(SM.S.MOVESTART) && e.event(SM.E.MOUSEDOWN)) { 
			if (e.withinBoard) {
				m.leftPiece = EMPTY; m.newF = e.f; m.newR = e.r; 
				m.becomesPiece = m.movePiece; m.takenPiece = pos.b[e.f][e.r];
				if ((e.f!=m.moveF || e.r!=m.moveR) && legalMove(pos,m)) {
					if (promotion()) {
						drawPromotion(m.newF,m.newR);
						g.nextState(SM.S.PROMOTION);
					}
					else {
						doMove( m, 'click' );
						g.nextState(SM.S.IDLE);
					}
				}
				else {
					nextPos();
					g.nextState(SM.S.IDLE);
				}
			}
		}
		// DragStart
		else if (g.inState(SM.S.CLICKED) && e.event(SM.E.MOUSEMOVE)) {
			b1.prevImageData = null;
			drawSquare(e.f,e.r,'inMove');
			g.nextState(SM.S.DRAG);
		}
		// Drag
		else if (g.inState(SM.S.DRAG) && e.event(SM.E.MOUSEMOVE) && e.withinBoard ) {
			adjustMouseXY(e);
			pos.b[m.moveF][m.moveR] = EMPTY;
			drawAbsPiece(null,0,0,0, 'prev');
			drawAbsPiece(m.movePiece, e.mx-b1.d/2, e.my-b1.d/2, 14*b1.dp/15, 'save');
		}
		// DragEnd
		else if (g.inState(SM.S.DRAG) && e.event(SM.E.MOUSEUP)) {
			adjustMouseXY(e);
			m.leftPiece = EMPTY; m.newF = e.f; m.newR = e.r; 
			m.becomesPiece = m.movePiece; m.takenPiece = pos.b[e.f][e.r];
			if (e.withinBoard && (e.f!=m.moveF || e.r!=m.moveR) && legalMove(pos,m)) {
				if (promotion()) {
					drawPromotion(m.newF,m.newR);
					g.nextState(SM.S.PROMOTION);
				}
				else {
					doMove( m, 'drag' );
					g.nextState(SM.S.IDLE);
				}
			}
			else {
				pos.b[m.moveF][m.moveR] = m.movePiece;
				nextPos();
				g.nextState(SM.S.IDLE);
			}
		}
		// Ctrl - click
		else if ( e.event(SM.E.RIGHTDOWN) ) {
			if (pos.inside(e.f,e.r)) {
				arrowF = e.f; arrowR = e.r; button = e.button;
				g.nextState(SM.S.RIGHTDOWN);
			}
		}
		// Arrow and Square (move and mouseup)
		else if ( g.inState(SM.S.RIGHTDOWN) ) {
			adjustMouseXY(e);
			var dash = e.evt.altKey?'D':'S'; // Dahsed Solid
			var color = 'G';
			if ( e.evt.ctrlKey && e.evt.shiftKey ) color = 'Y';
			else if ( e.evt.ctrlKey ) color = 'R';
			else if ( e.evt.shiftKey ) color = 'B';
			if (e.event(SM.E.MOUSEMOVE)) {
				nextPos();
				var aF = b1.flip?7-arrowF:arrowF;
				var aR = b1.flip?7-arrowR:arrowR;
				drawAbsArrow(color,b1.f2x(aF)+b1.d/2,b1.r2y(aR)+b1.d/2,e.mx,e.my,10,dash);
			}
			else if (e.event(SM.E.RIGHTUP)) {
				if (arrowF==e.f && arrowR==e.r) { // square
					var arr = color + F[e.f] + R[e.r] + dash;
					var ind = arrayIndexOf( g.ann[g.ply].squares, arr );
					if (ind == -1) g.ann[g.ply].squares.push( arr );
					else g.ann[g.ply].squares.splice( ind, 1 );
				}
				else { // arrow
					var arr = color + F[arrowF] + R[arrowR] + F[e.f] + R[e.r] + dash;
					var ind = arrayIndexOf( g.ann[g.ply].arrows, arr );
					if (ind == -1) g.ann[g.ply].arrows.push( arr );
					else g.ann[g.ply].arrows.splice( ind, 1 );
				}
				nextPos();
				g.nextState(SM.S.IDLE);
			}
		}
		// Key events
		else if (g.inState(SM.S.IDLE) && e.event(SM.E.KEYDOWN)) {
			if (e.evt.keyCode == 37) actionButtonTakeback();
			if (e.evt.keyCode == 39) actionButtonForward();
			if (e.evt.keyCode == 36) actionButtonHome();
			if (e.evt.keyCode == 35) actionButtonEnd();
		}
		// Mouse wheel events
		else if (g.inState(SM.S.IDLE) && e.event(SM.E.MOUSEWHEEL)) {
			if (e.evt.deltaY < 0) actionButtonTakeback();
			if (e.evt.deltaY > 0) actionButtonForward();
		}

		// Setup (setup toolbar button 'Exit' click exits to SM.S.IDLE)
		else if (g.inState(SM.S.SETUP.IDLE) && e.event(SM.E.MOUSEDOWN)) {
			// Toolbar click
			if (toolbarSetup.cursorIn(e.mx,e.my)) toolbarSetup.clicked(e.mx,e.my);
			// SetupSelector click
			else if (ss.cursorIn(e.mx,e.my)) {
				// which side piece is clicked
				for (var i=0; i<scBox.length; i++) {
					if (e.mx>scBox[i][0]&&e.mx<scBox[i][0]+scBox[i][2]&&e.my>scBox[i][1]&&e.my<scBox[i][1]+scBox[i][3]) {
						ss.piece = scBox[i][4] + pos.nextIndex(scBox[i][4]);
						if (EVENTLOG==1) console.log( ss.piece );
					}
				}
				g.nextState(SM.S.SETUP.SIDECLICK);
			}
			else if (pos.inside(e.f,e.r)) {
				ss.piece = pos.b[e.f][e.r];
				pos.b[e.f][e.r] = EMPTY;
				pos.calcFen();
				nextPos();
				if (EVENTLOG==1) console.log( ss.piece );
				g.nextState(SM.S.SETUP.BOARDCLICK);
			}
		}
		else if (g.inState(SM.S.SETUP.SIDECLICK) || g.inState(SM.S.SETUP.BOARDCLICK)) {
			// Setup CancelDrag
			if (e.event(SM.E.MOUSEUP)) {
				g.nextState(SM.S.SETUP.IDLE);
			}
			// Setup DragStart
			else if (e.event(SM.E.MOUSEMOVE)) {
				b1.prevImageData = null;
				g.nextState(SM.S.SETUP.DRAG);
			}
		}
		else if (g.inState(SM.S.SETUP.DRAG)) {
			// Setup Drag
			if (e.event(SM.E.MOUSEMOVE)) {
				if (e.mx<b1.f2x(0)+b1.d/2) e.mx=b1.f2x(0)+b1.d/2;
				if (e.mx>b1.f2x(7)+4*b1.d/3) e.mx=b1.f2x(7)+4*b1.d/3;
				if (e.my>b1.r2y(0)+b1.d/2) e.my=b1.r2y(0)+b1.d/2;
				if (e.my<b1.r2y(7)+b1.d/2) e.my=b1.r2y(7)+b1.d/2;
				drawAbsPiece(null,0,0,0,'prev');
				drawAbsPiece(ss.piece, e.mx-b1.d/2, e.my-b1.d/2, 14*b1.dp/15, 'save');
				g.nextState(SM.S.SETUP.DRAG);
			}
			// Setup DragEnd
			else if (e.event(SM.E.MOUSEUP)) {
				// Drop on Board
				if (pos.inside(e.f,e.r)) {
					setup.modified = true;
					pos.b[e.f][e.r] = ss.piece;
					pos.calcFen();
				}
				// Drop on SetupSelector
				else if (ss.cursorIn()) {
				}
				nextPos();
				g.nextState(SM.S.SETUP.IDLE);
			}
		}
		// Textbox
		else if (g.inState(SM.S.TEXTBOX)) {
			ui.focus.event(e);
		}
		g.setNextState();
	}
	ui.eventTimer = setTimeout( fsmTick, 7 );
}
