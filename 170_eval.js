function eval(b) {
	var ret = [];
	// Material
	ret[1] = { 'name':'Material', 'w':0.0, 'b':0.0 };
	for (var f=0; f<8; f++) for (var r=0; r<8; r++) {
		var p = pos.b[f][r];
		if (p!=EMPTY) {
			ret[1][ p[0] ] += material[ p[1] ] * 1000;
		}
	}
	// Mobility
	ret[2] = { 'name':'Mobility', 'w':0.0, 'b':0.0 };
	for (var f=0; f<8; f++) for (var r=0; r<8; r++) {
		var p = pos.b[f][r];
		if (p!=EMPTY) {
			var m = calcMoves( b,f,r,'moves', b.b[f][r], 'normal' );
			var delta = m.length / 200;
			ret[2][ p[0] ] += Math.round(delta*1000);
		}
	}
	// Attacks
	ret[3] = { 'name':'Attacks', 'w':0.0, 'b':0.0 };
	for (var f=0; f<8; f++) for (var r=0; r<8; r++) {
		var p = pos.b[f][r];
		if (p!=EMPTY) {
			var m = calcMoves( b,f,r,'attacks', b.b[f][r], 'normal' );
			var delta = 0;
			for (var i=0; i<m.length; i++) {
				delta += squareValues[ m[i][0] ][ m[i][1] ] / 200;
			}
			ret[3][ p[0] ] += Math.round(delta*1000);
		}
	}
	// Checkmate
	var inCh = inCheck(b, pos.color);
	var noPossMoves = allPossMoves(b, pos.color).length==0;
	ret[4] = { 'name':'Checkmate', 'w':0.0, 'b':0.0 };
	if (inCh && noPossMoves) ret[4][pos.color] = -1000000.0;
	else if (noPossMoves) { ret[4]['w'] = 1000000.0; ret[4]['b'] = 1000000.0; }
	// Sum up in ret[0] Eval
	ret[0] = { 'name':'Eval', 'w':0, 'b':0 };	
	for (var i=0; i<2; i++) for (var j=1; j<=4; j++)
		ret[0][ ['w','b'][i] ] += ret[j][ ['w','b'][i] ];
	return ret;
}
