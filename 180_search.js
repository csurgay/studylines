function searchMove( b ) {
	track = [];
	var bb = pos.b;
	var c = pos.color; var oc = oppColor( c );
	var possMoves = allPossMoves(b, c); var len = possMoves.length;
	if (len>0) {
		var moveIndex = Math.floor( len * Math.random() );
		if (b1.depth==1) {
			// value of minimax, index of minimax move
			var vmm, imm = -1;
			for (var i=0; i<len; i++) {
				var m = possMoves[i];
				// moves in current position, but misses castle/enpassant/rep.. calc
				bb[ m[1] ][ m[2] ] = EMPTY; bb[ m[3] ][ m[4] ] = m[6];
				var e = eval(b);
				var val = e[0]['w'] - e[0]['b'];
				if (imm==-1 || c=='w' && val>vmm || c=='b' && val<vmm) { vmm = val; imm = i; }
				bb[ m[1] ][ m[2] ] = m[0]; bb[ m[3] ][ m[4] ] = m[5];
			}
			moveIndex = imm;
		}
		else if (b1.depth==2) {
			// value of minimax, index of minimax move
			var vmm, imm = -1;
			for (var i=0; i<len; i++) {
				var m = possMoves[i];
				bb[ m[1] ][ m[2] ] = EMPTY; bb[ m[3] ][ m[4] ] = m[6];
				var opossMoves = allPossMoves(b, oc); var olen = opossMoves.length;
				var ovmm, oimm = -1, omove = [];
				for (var j=0; j<olen; j++) {
					var om = opossMoves[j];
					bb[ om[1] ][ om[2] ] = EMPTY; bb[ om[3] ][ om[4] ] = om[6];
					var oe = eval(b);
					var oval = oe[0]['w'] - oe[0]['b'];
					if (oimm==-1 || c=='w' && oval<ovmm || c=='b' && oval>ovmm) { 
						ovmm = oval; oimm = j; omove = om;
					}
					bb[ om[1] ][ om[2] ] = om[0]; bb[ om[3] ][ om[4] ] = om[5];
				}
				if (imm==-1 || c=='w' && ovmm>vmm || c=='b' && ovmm<vmm) { 
					vmm = ovmm; imm = i;
				}
				track.push( [ pos.fen, m, ovmm, omove ] );
				bb[ m[1] ][ m[2] ] = m[0]; bb[ m[3] ][ m[4] ] = m[5];
			}
			moveIndex = imm;
		}
		else if (b1.depth==3) {
			// value of minimax, index of minimax move
			var vmm, imm = -1;
			for (var i=0; i<len; i++) {
				var m = possMoves[i];
				bb[ m[1] ][ m[2] ] = EMPTY; bb[ m[3] ][ m[4] ] = m[6];
				var opossMoves = allPossMoves(b,oc); var olen = opossMoves.length;
				var ovmm, oimm = -1, omove = [];
				for (var j=0; j<olen; j++) {
					var om = opossMoves[j];
					bb[ om[1] ][ om[2] ] = EMPTY; bb[ om[3] ][ om[4] ] = om[6];
					
					var o2possMoves = allPossMoves(b,c); var o2len = o2possMoves.length;
					var o2vmm, o2imm = -1, o2move = [];
					for (var k=0; k<o2len; k++) {
						var o2m = o2possMoves[k];
						bb[ o2m[1] ][ o2m[2] ] = EMPTY; bb[ o2m[3] ][ o2m[4] ] = o2m[6];
						pos.color = oc;	var o2e = eval(b); pos.color = c;
						var o2val = o2e[0]['w'] - o2e[0]['b'];
						if (o2imm==-1 || c=='w' && o2val>o2vmm || c=='b' && o2val<o2vmm) { 
							o2vmm = o2val; o2imm = k; o2move = o2m;
						}
						bb[ o2m[1] ][ o2m[2] ] = o2m[0]; bb[ o2m[3] ][ o2m[4] ] = o2m[5];
					}
					
					if (oimm==-1 || c=='w' && o2vmm<ovmm || c=='b' && o2vmm>ovmm) { 
						ovmm = o2vmm; oimm = j; omove = om;
					}
					bb[ om[1] ][ om[2] ] = om[0]; bb[ om[3] ][ om[4] ] = om[5];
				}
				if (imm==-1 || c=='w' && ovmm>vmm || c=='b' && ovmm<vmm) { 
					vmm = ovmm; imm = i;
				}
				track.push( [ pos.fen, m, o2vmm, omove, o2move ] );
				bb[ m[1] ][ m[2] ] = m[0]; bb[ m[3] ][ m[4] ] = m[5];
			}
			moveIndex = imm;
		}
		return possMoves[moveIndex];
	}
	else {
		return null;
	}
}
