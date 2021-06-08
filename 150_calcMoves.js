// calc all moves (or attacks) for piece in [f][r] in pos b
function calcMoves(b,f,r,mode,pPiece,disamb) { // mode: 'moves' or 'attacks', disamb: 'normal' or 'disamb' (for disambiguation taking on own piece counts)
	var ret = [];
	var piece = b.b[f][r];
	if (pPiece!='---') piece=pPiece;
	if (piece==EMPTY) return ret;
	var x,y;
	var c = piece[0];
	var p = piece[1];
	var indexP = ui.pcs.indexOf(piece.substr(0,2));
	if (indexP<0 || indexP>=12) 
		console.log('piece is not legal: '+piece);
	var lines = allMoves[p];
	// pawn moves (one, two, take, enpassant, promotion)
	if (p=='P') {
		lines = [];
		if (c=='w') {
			var pawnMoves = [];
			// moves 1 or 2
			if (mode=='moves' && pos.b[f][r+1] == EMPTY) {
				if (r<6) pawnMoves.push( [0,1] );
				// N or Q for promotion
				else { pawnMoves.push( [0,1,'wN'] ); pawnMoves.push( [0,1,'wQ'] ); }
				if (r==1 && pos.b[f][r+2] == EMPTY) pawnMoves.push( [0,2] );
				if (pawnMoves != []) lines.push( pawnMoves ) ;
			}
			// takes left or right (or promotes as well)
			if ( pos.inside(f-1,r+1) && ((pos.b[f-1][r+1][0]=='b') || (mode=='attacks')) || 
				pos.enpassant=='abcdefgh'[f-1]+'6' && r==4 ) {
					if (r<6) lines.push( [[-1,1]] );
					else { lines.push( [[-1,1,'wN']] ); lines.push( [[-1,1,'wQ']] ); }
			}
			if ( pos.inside(f+1,r+1) && ((pos.b[f+1][r+1][0]=='b') || (mode=='attacks')) ||
				pos.enpassant=='abcdefgh'[f+1]+'6' && r==4 ) {
					if (r<6) lines.push( [[1,1]] );
					else { lines.push( [[1,1,'wN']] ); lines.push( [[1,1,'wQ']] ); }
			}
		}
		if (c=='b') {
			var pawnMoves = [];
			// moves 1 or 2
			if (mode=='moves' && pos.b[f][r-1] == EMPTY) {
				if (r>1) pawnMoves.push( [0,-1] );
				// N or Q for promotion
				else { pawnMoves.push( [0,-1,'bN'] ); pawnMoves.push( [0,-1,'bQ'] ); }
				if (r==6 && pos.b[f][r-2] == EMPTY) pawnMoves.push( [0,-2] );
				if (pawnMoves != []) lines.push( pawnMoves ) ;
			}
			// takes left or right (or promotes as well)
			if ( pos.inside(f-1,r-1) && ((pos.b[f-1][r-1][0]=='w') || (mode=='attacks')) ||
				pos.enpassant=='abcdefgh'[f-1]+'3' && r==3 ) {
					if (r>1) lines.push( [[-1,-1]] );
					else { lines.push( [[-1,-1,'bN']] ); lines.push( [[-1,-1,'bQ']] ); }
			}
			if ( pos.inside(f+1,r-1) && ((pos.b[f+1][r-1][0]=='w') || (mode=='attacks')) ||
				pos.enpassant=='abcdefgh'[f+1]+'3' && r==3 ) {
					if (r>1) lines.push( [[1,-1]] );
					else { lines.push( [[1,-1,'bN']] ); lines.push( [[1,-1,'bQ']] ); }
			}
		}
	}
	// castling possible?
	if (p=='K' && f==4 && (r==0 || r==7) && !inCheck(b,c,f,r)) {
		if (c=='w' && r==0 && pos.castle[0]=='K' 
			&& pos.b[5][r]==EMPTY && !squareInCheck(b,c,5,r) 
			&& pos.b[6][r]==EMPTY && !squareInCheck(b,c,6,r) 
			&& pos.b[7][r].substr(0,2)=='wR') ret.push([6,r]);
		if (c=='w' && r==0 && pos.castle[1]=='Q' 
			&& pos.b[3][r]==EMPTY && !squareInCheck(b,c,3,r) 
			&& pos.b[2][r]==EMPTY && !squareInCheck(b,c,2,r) 
			&& pos.b[1][r]==EMPTY 
			&& pos.b[0][r].substr(0,2)=='wR') ret.push([2,r]);
		if (c=='b' && r==7 && pos.castle[2]=='k' 
			&& pos.b[5][r]==EMPTY && !squareInCheck(b,c,5,r) 
			&& pos.b[6][r]==EMPTY && !squareInCheck(b,c,6,r) 
			&& pos.b[7][r].substr(0,2)=='bR') ret.push([6,r]);
		if (c=='b' && r==7 && pos.castle[3]=='q' 
			&& pos.b[3][r]==EMPTY && !squareInCheck(b,c,3,r) 
			&& pos.b[2][r]==EMPTY && !squareInCheck(b,c,2,r) 
			&& pos.b[1][r]==EMPTY 
			&& pos.b[0][r].substr(0,2)=='bR') ret.push([2,r]);
	}
	// are this moves legal (in terms of chess rules)
	for (var i=0; i<lines.length; i++) {
		var blocked = false;
		var moves = lines[i];
		for (var j=0; j<moves.length; j++) {
			// this piece tries next possible square in one direction (line)
			x = f + moves[j][0]; y = r + moves[j][1];
			if ( !blocked && pos.inside(x,y) && (pos.b[x][y][0]!=c || disamb=='disamb') && pos.b[x][y][1]!='K' ) {
				pos.b[f][r] = EMPTY;
				var takenPiece = pos.b[x][y];
				pos.b[x][y] = piece;
				// player cannot move into check (king or discovered check), but can move to block check
				if (!inCheck(b,c)) {
					// this is one possible legitimate move
					var move = []; move.push(x); move.push(y); 
					if (moves[j].length==3) move.push(moves[j][2]);
					ret.push( move );
				}
				pos.b[f][r] = piece;
				pos.b[x][y] = takenPiece;
				// square not empty, this direction is blocked from this square onward
				if (pos.b[x][y]!=EMPTY) blocked = true;
			} else blocked = true;
		}
	}
	return ret;
}
// calc all moves for c in pos b
function allPossMoves(b,c) {
	var possMoves = []; // piece, moveF, moveR, newF, newR, takenPiece, becomesPiece
	for (var f=0; f<8; f++) for (var r=0; r<8; r++) {
		var piece = pos.b[f][r];
		if (piece[0]==c) {
			var moves = calcMoves( b,f,r,'moves', b.b[f][r], 'normal' )
			for (var i=0; i<moves.length; i++) {
				var newF = moves[i][0];
				var newR = moves[i][1];
				var becomesPiece = (moves[i].length<3?piece:moves[i][2]);
				possMoves.push( [ piece, f, r, newF, newR, pos.b[newF][newR], becomesPiece ] );
			}
		}
	}
	// if there is mate return only that move (is this ok for all move calc purposes?)
	var mateExists = false;
	for (var i=0; i<possMoves.length; i++) {
		var m = possMoves[i];
		var oc = oppColor( m[0][0] );
		pos.b[ m[1] ][ m[2] ] = EMPTY; // remove movePiece
		pos.b[ m[3] ][ m[4] ] = m[6]; // insert becomesPiece
		if ( inCheck(b,oc) && allPossMoves(b,oc).length==0 ) {
			mateExists = true;
			for (var j=0; j<7; j++) possMoves[0][j] = possMoves[i][j];
		}
		pos.b[ m[1] ][ m[2] ] = m[0]; // restore movePiece
		pos.b[ m[3] ][ m[4] ] = m[5]; // restore takenPiece
	}
	if (mateExists)
		return [ possMoves[0] ];
	else
	return possMoves;
}
