function doResize() {
	ui.canvas.width = window.innerWidth; 
	ui.canvas.height = window.innerHeight;
	b1.h = window.innerHeight;
	doRedraw();
}
function doRedraw() {
	ui.ctx.fillStyle = COLOR.BACKGROUND;
	ui.ctx.clearRect(0, 0, ui.canvas.width, ui.canvas.height);
	b1.init();
	b1.render();
	drawPieces(pos.b);
	// drawAttackSpots
	if (b1.attackSpots) for (var f=0; f<8; f++) for (var r=0; r<8; r++) if (pos.b[f][r][0]==pos.color) {
		var spots = calcMoves( pos, f, r, 'attacks', pos.b[f][r], 'normal' );
		drawAttackSpots( spots );
	}
	panel.x = b1.offset; panel.ax = b1.offset;
	panel.absolute();
	var s; var a = g.ann[g.ply];
	s = ''; for (var i=0; i<a.tags.length; i++) { s+=a.tags[i]+': '+a.values[i]+'  '; }
	b1.tags.text = s;
	s = ''; for (var i=0; i<a.comments.length; i++) { s+=a.comments[i]+'  '; }
	b1.comments.text = s;
	panel.render();
	if (layout.Main()) drawArrows(g.ply);
}
class Title extends Rect {
	constructor(parent,x,y,title) {
		super(parent, x, y, 700, 25, 'noframe', layout.All);
		this.text = title;
	}
	render() {
		drawText(6,'','left','top',this.text, this.ax, this.ay);
	}
}
function drawPieces(pos) {
	for (var i=0; i<8; i++) {
		for (var j=0; j<8; j++) {
			var p = pos[i][j];
			if (p!=EMPTY) {
				drawPiece(p, i, j);
			}
		}
	}
}
function drawTargets(m) {
	var t = m.targetSquares;
	for (var i=0; i<t.length; i++)
		drawSquare(t[i][0],t[i][1],'target');
}
function drawArrows(index) {
	var ann = g.ann[index]; var a;
	a = ann.last; if (a.length==4) drawArrow('L',a[0],a[1],a[2],a[3], b1.daw);
	a = ann.next; if (a.length==4) drawArrow('N',a[0],a[1],a[2],a[3], b1.daw);
	a = ann.arrows; for (var i=0; i<a.length; i++)
		drawArrow(a[i][0], F.indexOf(a[i][1]), R.indexOf(a[i][2]), F.indexOf(a[i][3]), R.indexOf(a[i][4]), 10, a[i][5]);
	a = ann.squares; for (var i=0; i<a.length; i++)
		drawCircle(a[i][0], F.indexOf(a[i][1]), R.indexOf(a[i][2]), a[i][3]);

	// leave trail of arrows
	if (b1.trail) for (var i=0; i<=index; i++) {
		a = g.ann[i].last;
		if (a.length==4) drawArrow('L',a[0],a[1],a[2],a[3], b1.daw, 1);
	}
}
function drawAttackSpots(s) {
	for (var i=0; i<s.length; i++) {
		drawSpot( [180,40,40], b1.f2x(s[i][0])+b1.d/2, b1.r2y(s[i][1])+b1.d/2, b1.d/3 );
	}
}
