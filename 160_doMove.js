function doMove(m, mode) { // mode: 'click' needs animated move. 'drag' only the trembling is animated. 'pgn': nor timer neither anim
	m.special = ''; m.check = '';
	m.moveFeedback = '';
	if (!g.inState(SM.S.PROMOTION)) {
		// the actual move
		pos.b[m.moveF][m.moveR] = m.leftPiece; // this is a EMPTY, right?
		pos.calcFen();
		if (mode!='pgn') a.pos.initPos(pos); // position before move into anim
		pos.b[m.newF][m.newR] = m.becomesPiece;
		var oc = oppColor(pos.color);
		// moves counters increment
		g.ply++; if (pos.color=='b') { pos.fiftyMoves++; pos.fullMoves++; }
		// fifty moves rule counter
		if (m.movePiece[1]=='P' || m.takenPiece!=EMPTY)
			pos.fiftyMoves = 0;
		// promotion happpened
		if (g.inState(SM.S.PROMOTION)) {
			g.nextState(SM.S.IDLE);
			m.special = '='+m.becomesPiece[1];
		}
		processEnpassant(pos,m);
		processCastling(pos,m);
		processEndings(pos,m); // sets m.moveFeedback as well if end of game

		// finalize changes of b into fen
		pos.color = oppColor( pos.color );
		pos.calcFen();
		g.fens[ g.ply ] = pos.fen;
		var bCopy = new Position();
		bCopy.initPos( pos );
		g.bs[ g.ply ] = bCopy;

		processDisplayMove(pos,m);
		g.moves[g.ply] = m.getMoveData();

		processAnnotation(g,m);

		// cut game[] at this last move
		g.maxPly = g.ply;

		var d = m.getMoveData();
		if (mode!='pgn') {
			a.sound( d );
			a.anim( d, mode, true );
		}
		else callbackMove();
	}
}
function callbackMove() {
	if (m.moveFeedback != '') {
		b1.demo = false;
		nextPos();
		alert( m.moveFeedback );
		m.moveFeedback = '';
	}
	else if (b1.demo) demoTimer = setTimeout( function() { doAiMove(pos);}, 50);
}
function processEnpassant(pos,m) {
	// enpassantTarget is born
	if ( m.movePiece[1]=='P' && Math.abs(m.moveR-m.newR)==2 )
		pos.enpassant = 'abcdefgh'[m.moveF]+((m.moveR+m.newR)/2+1);
	else 
		pos.enpassant = '-';
	// enpassant happened
	if (m.movePiece[1]=='P' && m.moveF!=m.newF && 
		Math.abs(m.moveR-m.newR)==1 && m.takenPiece==EMPTY) {
		m.takenPiece = 'P'; pos.b[m.newF][m.moveR] = EMPTY; m.special = ' e.p.';
	}
}
function processCastling(pos,m) {
	// castling happened
	if (m.movePiece[1]=='K' && Math.abs(m.newF-m.moveF)==2) {
		if (m.movePiece[0]=='w') {
			if (m.newF==6) { pos.b[7][0] = EMPTY; pos.b[5][0] = 'wR2'; 
				pos.castle = pos.castle.replace('K', '-'); m.special = '0-0'; }
			if (m.newF==2) { pos.b[0][0] = EMPTY; pos.b[3][0] = 'wR1'; 
				pos.castle = pos.castle.replace('Q', '-'); m.special = '0-0-0'; }
		}
		if (m.movePiece[0]=='b') {
			if (m.newF==6) { pos.b[7][7] = EMPTY; pos.b[5][7] = 'bR2'; 
				pos.castle = pos.castle.replace('k', '-');  m.special = '0-0'; }
			if (m.newF==2) { pos.b[0][7] = EMPTY; pos.b[3][7] = 'bR1'; 
				pos.castle = pos.castle.replace('q', '-'); m.special = '0-0-0'; }
		}
	}
	// castling disable
	if (m.movePiece[1]=='K' && (m.moveF!=m.newF || m.moveR!=m.newR)) {
		if (m.movePiece[0]=='w') pos.castle = pos.castle.replace('K', '-').replace('Q', '-');
		if (m.movePiece[0]=='b') pos.castle = pos.castle.replace('k', '-').replace('q', '-');
	}
	if (m.movePiece[1]=='R') {
		if (m.movePiece[0]=='w' && m.moveR==0) {
			if (m.moveF==7) pos.castle = pos.castle.replace('K', '-');
			if (m.moveF==0) pos.castle = pos.castle.replace('Q', '-');
		}
		if (m.movePiece[0]=='b' && m.moveR==7) {
			if (m.moveF==7) pos.castle = pos.castle.replace('k', '-');
			if (m.moveF==0) pos.castle = pos.castle.replace('q', '-');
		}
	}
}
function processEndings(pos,m) {
	// check / checkmate / stalemate happened
	var oc = oppColor(pos.color);
	var inCh = inCheck(pos, oc);
	var noPossMoves = allPossMoves(pos, oc).length==0;
	if (inCh && !noPossMoves) {
		m.check = '+';
	}
	// checkmate win
	if (inCh && noPossMoves) {
		m.moveFeedback = 'Checkmate, ' + pos.color + ' wins!';
		m.check = '# ' + (pos.color=='w'?'1-0':'0-1');
	}
	// stalemate draw
	else if (!inCh && noPossMoves) {
		m.moveFeedback = 'Stalemate for ' + oc + ' its a draw!'; m.check = ' ½-½ (Stalemate)';
	}
	// fifty move rule draw
	else if (g.fiftyMoves>50) {
		m.moveFeedback = 'No pawn move or capture in 50 moves, its a draw!'; m.check = ' ½-½ (Fifty moves)';
	}
	// insufficient material
	else if (insufficientMaterial(pos)) {
		m.moveFeedback = 'Insufficient material, its a draw!'; m.check = ' ½-½ (Insufficient material)';
	}
	// repetition
	else if ( repetition( g, pos ) ) {
		m.moveFeedback = 'Repetition x3, its a draw!'; m.check = ' ½-½ (Repetition)';
	}
}
function processDisplayMove(pos,m) { // still unambiguation files/ranks missing from pgn notation
	m.display = '';
	// for Pawn: P never shown, but moveF shown for take
	if (m.movePiece[1]=='P') {
		if (m.takenPiece!=EMPTY) m.display = 'abcdefgh'[m.moveF];
	} else {
		m.display = m.movePiece[1];
	}
	// unambiguation
	pos.b[m.moveF][m.moveR] = m.movePiece; // forget the last move for a second
	pos.b[m.newF][m.newR] = EMPTY;
	var collFile = false, collRank = false, pre='', count=0;
	for (var f=0; f<8; f++) for (var r=0; r<8; r++) {
		// for all pieces that are the same
		if ( pos.b[f][r].substr(0,2) == m.movePiece.substr(0,2) && pos.b[f][r] != m.movePiece ) {
			var moves = (m.movePiece[1]=='P')?[]:calcMoves(pos,f,r,'moves',pos.b[f][r],'disamb');
			// for all its legal moves
			for (var i=0; i<moves.length; i++) {
				var mi = moves[i];
				// if it can move to the same square
				if ( mi[0]==m.newF && mi[1]==m.newR ) {
					count++;
					if (f==m.moveF) collFile = true;
					if (r==m.moveR) collRank = true;
				}
			}
		}
	}
	if (count > 0) {
		if (!collFile || collRank) pre=F[m.moveF];
		if (collFile && !collRank) pre=R[m.moveR];
		if (collFile && collRank) pre += R[m.moveR];
	}
	m.display += pre;
	pos.b[m.moveF][m.moveR] = EMPTY; // put the piece back
	pos.b[m.newF][m.newR] = m.becomesPiece; // put the piece back
	// takes
	m.display += (m.takenPiece==EMPTY?'':'x');
	m.display += F[m.newF] + R[m.newR];
	// promotion
	if (m.movePiece != m.becomesPiece) m.display += '=' + m.becomesPiece[1];
	// castling
	if (m.special[0] == '0') m.display = m.special; else m.display += m.special;
	// ending
	if (m.check != '') m.display += m.check;
}
function processAnnotation(g,m) {
	// annotations [notes, lastMove arrow, nextMove arrow]
	// later: times, colored squares, colored/numbered arrows
	g.ann[g.ply] = new Annotation();
	g.ann[g.ply].last = [m.moveF, m.moveR, m.newF, m.newR];
	if (typeof g.ann[g.ply-1] === 'undefined') {
		g.ann[g.ply-1] = new Annotation();
	}
	g.ann[g.ply-1].next = [m.moveF, m.moveR, m.newF, m.newR];
}
