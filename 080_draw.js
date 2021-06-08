function drawRect(x,y,w,h) {
	ui.ctx.moveTo(x+0.5,y+0.5);
	ui.ctx.lineTo(x+0.5+w,y+0.5);
	ui.ctx.lineTo(x+0.5+w,y+0.5+h);
	ui.ctx.lineTo(x+0.5,y+0.5+h);
	ui.ctx.lineTo(x+0.5,y+0.5);
}
function moveTo(x,y) {
	x = Math.floor(x)+0.5;
	y = Math.floor(y)+0.5;
	ui.ctx.moveTo(x,y);
}
function lineTo(x,y) {
	x = Math.floor(x)+0.5;
	y = Math.floor(y)+0.5;
	ui.ctx.lineTo(x,y);
}
function drawAbsArrow(color, fromx, fromy, tox, toy, w, dash) {
	w = w==10?b1.daw/2:b1.daw;
	var headlen = 2*w;
	var angle = Math.atan2(toy-fromy,tox-fromx);
	tox -= Math.cos(angle) * ((w*1.15));
	toy -= Math.sin(angle) * ((w*1.15));
	ui.ctx.beginPath();
	var rgba = COLOR.ARROW[color];
	ui.ctx.strokeStyle = 'rgba('+rgba[0]+','+rgba[1]+','+rgba[2]+','+rgba[3]+')';
	ui.ctx.lineWidth = w;
	if (dash == 'D') ui.ctx.setLineDash([20,7]);
	ui.ctx.moveTo(fromx, fromy);
	ui.ctx.lineTo(tox, toy);
	if (dash == 'D') {
		ui.ctx.stroke();
		ui.ctx.closePath();
		ui.ctx.beginPath();
		ui.ctx.setLineDash([0]);
	}
	ui.ctx.moveTo(tox, toy);
	ui.ctx.lineTo(tox-headlen*Math.cos(angle-Math.PI/7),toy-headlen*Math.sin(angle-Math.PI/7));
	ui.ctx.lineTo(tox-headlen*Math.cos(angle+Math.PI/7),toy-headlen*Math.sin(angle+Math.PI/7));
	ui.ctx.lineTo(tox, toy);
	ui.ctx.lineTo(tox-headlen*Math.cos(angle-Math.PI/7),toy-headlen*Math.sin(angle-Math.PI/7));
	ui.ctx.stroke();
	ui.ctx.setLineDash([0]);
	ui.ctx.closePath();
}

function drawArrow(color, fromF, fromR, toF, toR, w, dash) { // color: (G)reen(R)ed(B)lue(Y)ellow(L)ast(N)ext, dash: D-ashed,S-olid  !!! dash 20/7 not resized
	if (b1.flip) {
		fromF = 7-fromF; fromR = 7-fromR; toF = 7-toF; toR = 7-toR;
	}
	var fromx = b1.f2x(fromF) + b1.d/2; 
	var fromy = b1.r2y(fromR) + b1.d/2;
	var tox = b1.dx+b1.d*toF+b1.d/2; 
	var toy = b1.dy+b1.d*(7-toR)+b1.d/2;
	drawAbsArrow(color, fromx, fromy, tox, toy, w, dash);
}

function drawCircle(color, fromF, fromR, dash) {
	if (b1.flip) {
		fromF = 7-fromF; fromR = 7-fromR;
	}
	var fromx = b1.f2x(fromF) + b1.d/2; 
	var fromy = b1.r2y(fromR) + b1.d/2;
	ui.ctx.beginPath();
	if (dash == 'D') ui.ctx.setLineDash([20,7]);
	ui.ctx.lineWidth = 4 / 900 * b1.h;
	ui.ctx.arc(fromx, fromy, b1.d*4/10, 0, 2 * Math.PI);
	var rgba = COLOR.ARROW[color];
	ui.ctx.strokeStyle = 'rgba('+rgba[0]+','+rgba[1]+','+rgba[2]+','+rgba[3]+')';
	ui.ctx.stroke();
	ui.ctx.setLineDash([0]);
	ui.ctx.closePath();
}

function drawSpot(rgb, x, y, radius) {
	ui.ctx.beginPath();
	ui.ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
	ui.ctx.lineWidth = 0;
	ui.ctx.fillStyle = 'rgba('+rgb[0]+','+rgb[1]+','+rgb[2]+',0.5)';
	ui.ctx.fill();
	ui.ctx.closePath();
}

// Position and Pieces
function drawSquare(f, r, c='normal') {
	var ff = b1.flip?7-f:f;
	var rr = b1.flip?7-r:r;
	ui.ctx.beginPath();
	if (c=='normal') {
		if ((ff+rr)%2==0) ui.ctx.fillStyle = COLOR.BOARD.BLACK; else ui.ctx.fillStyle = COLOR.BOARD.WHITE;
		ui.ctx.fillRect( b1.f2x(ff), b1.r2y(rr), b1.d, b1.d );
		ui.ctx.fill();
	} else if (c=='inMove') {
		ui.ctx.fillStyle = COLOR.BOARD.INMOVEFRAME;
		ui.ctx.fillRect( b1.f2x(ff), b1.r2y(rr), b1.d, b1.d );
		ui.ctx.fillStyle = COLOR.BOARD.INMOVE;
		ui.ctx.fillRect( b1.f2x(ff)+b1.d/12, b1.r2y(rr)+b1.d/12, b1.d-b1.d/6, b1.d-b1.d/6 );
	}
	if (c=='target') {
		ui.ctx.fillStyle = 'rgba(120, 120, 120, 0.5)';
		ui.ctx.moveTo(b1.f2x(ff) + b1.d/2, b1.r2y(rr) + b1.d/2);
		if ( pos.b[f][r] == EMPTY ) {
			ui.ctx.arc(b1.f2x(ff) + b1.d/2, b1.r2y(rr) + b1.d/2, b1.d/7, 0, 2*Math.PI);
		}
		else {
			ui.ctx.arc(b1.f2x(ff) + b1.d/2, b1.r2y(rr) + b1.d/2, 5*b1.d/11, 0, 2*Math.PI, false);
			ui.ctx.arc(b1.f2x(ff) + b1.d/2, b1.r2y(rr) + b1.d/2, 4*b1.d/11, 0, 2*Math.PI, true);
		}
	}
	ui.ctx.closePath();
	ui.ctx.fill();
}
function drawAbsPiece(piece, x, y, d, save='none') { // save: none, save, prev
	if (save=='prev') if (b1.prevImageData!=null) 
		ui.ctx.putImageData(b1.prevImageData[0],b1.prevImageData[1],b1.prevImageData[2]);
	if (save!='prev' && piece != EMPTY) {
		var indexP = ui.pcs.indexOf(piece.substr(0,2));
		if (indexP>=0 && indexP<12) {
			ui.ctx.beginPath();
			if (save=='save') {
				if (!NOIMAGEDATA) b1.prevImageData = [ ui.ctx.getImageData(x,y,14*b1.dp/15, 14*b1.dp/15), x, y ];
			}
			if (NOSVG) drawText(10, '', 'center', 'middle', piece, x+b1.d/2, y+b1.d/2);
			else ui.ctx.drawImage(ui.imgs[indexP], x, y, d, d);
			ui.ctx.stroke();
		}
		else console.log('indexP out of range: ' + piece);
	}
}
function drawPiece(piece, f, r) {
	if (b1.flip) {
		f = 7-f; r = 7-r;
	}
	drawAbsPiece(piece, b1.f2x(f) + b1.d/2-14*b1.dp/30, b1.r2y(r) + b1.d/2-14*b1.dp/30, 14*b1.dp/15);
}
function f(x,y) {
	ui.ctx.fillRect(x+0.5,y+0.5,1,1);
}
function drawText(size,variant,align,vert,t,x,y,measure='') {
	var fontString = variant+' '+Math.floor(size*ui.dm/10)+'px Helvetica';
	ui.ctx.font = fontString;
	ui.ctx.textAlign = align; ui.ctx.textBaseline = vert;
	var ret = 0;
	if (measure=='measure') ret = ui.ctx.measureText(t).width;
	else {
		ui.ctx.fillStyle = ui.textColor;
		ui.ctx.fillText(t, x, y);
	}
	return ret;
}
