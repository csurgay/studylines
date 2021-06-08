// returns fenString
function pos2fen(pos) {
	ret = "";
	for (var r=7; r>=0; r--) {
		var spaces = 0;
		for (var f=0; f<8; f++) {
			if (pos.b[f][r].length<3)
				console.log('pos2fen: piece not legal: '+pos.b[f][r]);
			var c = pos.b[f][r][0]; var p = pos.b[f][r][1];
			if (p==' ') { spaces++; }
			else {
				if (spaces>0) ret += '' + spaces; 
				spaces = 0; 
				if (c=='b') p = p.toLowerCase();
				ret += p;
			}
		}
		if (spaces>0) ret += '' + spaces;
		if (r>0) ret += '/';
	}
	ret += ' ' + pos.color + ' ' + pos.castle + ' ' + pos.enpassant 
		+ ' ' + pos.fifty + ' ' + pos.counter ;
	return ret;
}
// returns complete position
function fen2pos(fenString) {
	var pos = new Position();
	pos.fen = fenString;
	var n = {
		'w': { 'P':0, 'N':0, 'B':0, 'R':0, 'Q':0, 'K':0 },
		'b': { 'P':0, 'N':0, 'B':0, 'R':0, 'Q':0, 'K':0 }
	};
	var sF = fenString.split(' ');
	pos.color = sF[1];
	pos.castle = sF[2];
	pos.enpassant = sF[3];
	pos.fifty = sF[4];
	pos.counter = sF[5];
	sF[0] += '/';
	pos.b = emptyBoard();
	var ptr = 0;
	for (var r=7; r>=0; r--) {
		var p = sF[0][ptr++];
		var c;
		var f = 0;
		while (p!='/' && p!=' ') {
			if (p>='1' && p<='8') {
				f+=parseInt(p);
			} else {
				if (p>='a' && p<='z') { c = 'b'; p = p.toUpperCase(); }
				else if (p>='A' && p<='Z') { c = 'w' }
				else logerror('fen2pos','invalid fen',p);
				if (f<8) { pos.b[f][r] = c+p+ ++n[c][p]; f++; }
			}
			p = sF[0][ptr++];
		}
	}
	return pos;
}
function isFile(pm,ptr) { if (ptr<pm.length) return F.indexOf(pm[ptr]); else return -1; }
function isRank(pm,ptr) { if (ptr<pm.length) return R.indexOf(pm[ptr]); else return -1; }
function isTakes(pm,ptr) { return pm[ptr]=='x'; }

function calcMoveSquare( pos, m, mode ) { // moves or attacks
	var mF = -1; var mR = -1;
	for (var f=0; f<8; f++) for (var r=0; r<8; r++) {
		if (pos.b[f][r].substr(0,2)==m.movePiece) {
			var moves = calcMoves( pos, f, r, mode, pos.b[f][r], 'normal');
			for (var i=0; i<moves.length; i++) {
				if (moves[i][0]==m.newF && moves[i][1]==m.newR) {
					if ( (m.moveF==-1 || m.moveF==f) && (m.moveR==-1 || m.moveR==r) ) {
						m.moveF = f; m.moveR = r; m.movePiece = pos.b[f][r];
						i = moves.length-1; f = 7; r = 7;
					}
				}
			}
		}
	}
	if (m.moveF==-1 || m.moveR==-1) { console.log(m); alert('Pgn move fail, see console.log!'); }
}
function doPgnMove(g,pos,pm) { // game, position, pgnMove
	var m = new MoveData();
	m.display = pm;
	if (pm == 'a8=Q') {
		var breakpoint = 'fake'; // fake line that can be a breakpoint in F12
	}
	var c = pos.color;
	var l = pm.length;
	var p = pm[0];
	// castling
	m.leftPiece = EMPTY; m.takenPiece = EMPTY;
	if (p == '0' || p == 'O') {
		m.moveF = 4;
		var r = (c=='w'?0:7); m.moveR = r; m.newR = r;
		m.movePiece = pos.b[m.moveF][m.moveR]; m.becomesPiece = m.movePiece; 
		if (pm.length>4 && (pm[4]=='0' || pm[4]=='O') ) { m.newF = 2; }
		else { m.newF = 6; }
	}
	else {
		var ptr = 1;
		// pawn move
		if (p!='N' && p!='B' && p!='R' && p!='Q' && p!='K') { p = 'P'; ptr = 0; }
		m.movePiece = c + p;
		var takes = false; m.moveF = -1; m.moveR = -1;
		// disambiguation rank
		if ( isRank( pm,ptr ) != -1 ) {
			m.moveR = isRank( pm,ptr ) ;
			ptr++;
		}
		// disambiguation file or newF
		else if ( isFile( pm,ptr ) != -1 ) {
			// only disambiguation file
			if ( isFile( pm,ptr+1 ) != -1 || isTakes( pm,ptr+1 ) ) { 
				m.moveF = isFile( pm,ptr ); ptr++; 
			}
			// disambiguation file and rank
			else if ( isRank( pm,ptr+1 ) != -1 && ( isTakes( pm,ptr+2) || isFile( pm,ptr+2) != -1 ) ) {
				m.moveF = isFile( pm,ptr ); ptr++; 
				m.moveR = isRank( pm,ptr ); ptr++;
			}
			// normal newF newR coming
		}
		// takes
		if ( isTakes( pm,ptr ) ) {
			takes = true; ptr++;
		}
		// which piece from where
		m.newF = isFile( pm,ptr ); m.newR = isRank( pm,ptr+1 );
		m.takenPiece = (takes ? pos.b[ m.newF ][ m.newR ] : EMPTY);
		calcMoveSquare( pos, m, (takes?'attack':'moves') );
		ptr += 2;
		// promotion
		m.becomesPiece = m.movePiece;
		if (ptr < l) if ( pm[ptr] == '=') m.becomesPiece = c + pm[ptr+1] + pos.nextIndex(c + pm[ptr+1]);
	}
	var move = new Move();
	move.setMoveData(m);
	doMove(move, 'pgn');
	if (PGNLOG) console.log(m);
	if (pos.b[m.newF][m.newR] != m.becomesPiece || pos.b[m.moveF][m.moveR] != EMPTY) {
		console.log(m); alert('Pgn move: doMove fail, see console.log!');
	}
}
