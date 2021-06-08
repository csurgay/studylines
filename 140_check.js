// opponents color
function oppColor(c) {
	if (c=='w') return 'b';
	else if (c=='b') return 'w';
	else alert('Wrong color: ' + c);
}
// is a square in check for color c in pos bb
function squareInCheck(b,c,fK,rK) {
	var oc = oppColor(c);
	if (c=='w' && pos.inside(fK-1,rK+1) && pos.b[fK-1][rK+1].substr(0,2)=='bP') return true;
	if (c=='w' && pos.inside(fK+1,rK+1) && pos.b[fK+1][rK+1].substr(0,2)=='bP') return true;
	if (c=='b' && pos.inside(fK-1,rK-1) && pos.b[fK-1][rK-1].substr(0,2)=='wP') return true;
	if (c=='b' && pos.inside(fK+1,rK-1) && pos.b[fK+1][rK-1].substr(0,2)=='wP') return true;
	var blocked = false;
	for (var f=fK+1; f<8; f++) {
		var p=pos.b[f][rK];
		if (!blocked && p[0]==oc && (p[1]=="R" || p[1]=="Q")) return true;
		if (p!=EMPTY) blocked = true;
	}
	blocked = false;
	for (var f=fK-1; f>=0; f--) {
		var p=pos.b[f][rK];
		if (!blocked && p[0]==oc && (p[1]=="R" || p[1]=="Q")) return true;
		if (p!=EMPTY) blocked = true;
	}
	blocked = false;
	for (var r=rK+1; r<8; r++) {
		var p=pos.b[fK][r];
		if (!blocked && p[0]==oc && (p[1]=="R" || p[1]=="Q")) return true;
		if (p!=EMPTY) blocked = true;
	}
	blocked = false;
	for (var r=rK-1; r>=0; r--) {
		var p=pos.b[fK][r];
		if (!blocked && p[0]==oc && (p[1]=="R" || p[1]=="Q")) return true;
		if (p!=EMPTY) blocked = true;
	}
	blocked = false;
	for (var i=1; i<8; i++) {
		var f = fK+i; var r = rK+i;
		if (pos.inside(f,r)) {
			var p=pos.b[f][r];
			if (!blocked && p[0]==oc && (p[1]=="B" || p[1]=="Q")) return true;
			if (p!=EMPTY) blocked = true;
		}
	}
	blocked = false;
	for (var i=1; i<8; i++) {
		var f = fK+i; var r = rK-i;
		if (pos.inside(f,r)) {
			var p=pos.b[f][r];
			if (!blocked && p[0]==oc && (p[1]=="B" || p[1]=="Q")) return true;
			if (p!=EMPTY) blocked = true;
		}
	}
	blocked = false;
	for (var i=1; i<8; i++) {
		var f = fK-i; var r = rK+i;
		if (pos.inside(f,r)) {
			var p=pos.b[f][r];
			if (!blocked && p[0]==oc && (p[1]=="B" || p[1]=="Q")) return true;
			if (p!=EMPTY) blocked = true;
		}
	}
	blocked = false;
	for (var i=1; i<8; i++) {
		var f = fK-i; var r = rK-i;
		if (pos.inside(f,r)) {
			var p=pos.b[f][r];
			if (!blocked && p[0]==oc && (p[1]=="B" || p[1]=="Q")) return true;
			if (p!=EMPTY) blocked = true;
		}
	}
	for (var i=0; i<8; i++) {
		var f = fK + allMoves['N'][i][0][0]; var r = rK + allMoves['N'][i][0][1];
		if (pos.inside(f,r)) {
			var p=pos.b[f][r];
			if (p[0]==oc && p[1]=="N") return true;
		}
	}
	for (var i=0; i<8; i++) {
		var f = fK + allMoves['K'][i][0][0]; var r = rK + allMoves['K'][i][0][1];
		if (pos.inside(f,r)) {
			var p=pos.b[f][r];
			if (p[0]==oc && p[1]=="K") return true;
		}
	}
}
// is color c in check in pos bb
function inCheck(b,c) {
	var kingPos = pos.findKing(c);
	if (kingPos!=null) {
		var fK = kingPos[0]; var rK = kingPos[1];
		return squareInCheck(b,c,fK,rK);
	}
	else return false;
}
// insufficient material draw in pos
function insufficientMaterial(pos) {
	var wPs='', wNs='', wBs='', wRQs=''; 
	var bPs='', bNs='', bBs='', bRQs=''; 
	for (var f=0; f<8; f++) for (var r=0; r<8; r++) {
		if (pos.b[f][r][0]=='w') {
			if (pos.b[f][r][1]=='P') wPs += 'P';
			if (pos.b[f][r][1]=='N') wNs += 'N';
			if (pos.b[f][r][1]=='B') wBs += 'B';
			if (pos.b[f][r][1]=='R') wRQs += 'R';
			if (pos.b[f][r][1]=='Q') wRQs += 'Q';
		}
		if (pos.b[f][r][0]=='b') {
			if (pos.b[f][r][1]=='P') bPs += 'P';
			if (pos.b[f][r][1]=='N') bNs += 'N';
			if (pos.b[f][r][1]=='B') bBs += 'B';
			if (pos.b[f][r][1]=='R') bRQs += 'R';
			if (pos.b[f][r][1]=='Q') bRQs += 'Q';
		}
	}
	var ws = 'K'+wPs+wNs+wBs+wRQs; var bs = 'K'+bPs+bNs+bBs+bRQs;
	if ( (ws=='K' || ws=='KN' || ws=='KB' || ws=='KNN') && (bs=='K' || bs=='KN' || bs=='KB' || bs=='KNN') ) {
		return true;
	}
	else
		return false;
}
// repetition draw
function repetition(g,b) {
	var rep = 0;
	pos.calcFen();
	lastFen = pos.fen.split(' ');
	for (var i=0; i<=g.maxPly; i++) {
		var sF = g.fens[i].split(' ');
		if ( sF[0] == lastFen[0] ) 
			rep++;
	}
	return rep>=2; // this fen was there twice already
}
// checks if m(nf,nr) is a legal move for piece on b
function legalMove(b,m) {
	ret = false;
	var am = calcMoves(b,m.moveF,m.moveR,'moves',m.movePiece, 'normal');
	for (var i=0; i<am.length; i++)
		if (m.newF==am[i][0] && m.newR==am[i][1])
			ret = true;
	return ret;
}
