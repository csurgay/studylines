// Setup context menu - P N B R Q K move del
const scPos = [ [-2,-1],[-2,-2],[-1,-2],[0,-2],[1,-2],[1,-1], [-2,0],[-2,1],[-1,1],[0,1],[1,1],[1,0] ];
var scBox = [];
const prPos = [ [-1,-1],[0,-1],[-1,0],[0,0] ];
function drawPromotion(f,r) {
	var c = ( r==7?'w':'b' );
	if (b1.flip) {
		f = 7-f; r = 7-r;
	}
	var dc = b1.d / 2, dh = b1.d / 2, x, y, w, h;
	drawSquare(f,r);
	ui.ctx.beginPath();
	for (var p=0; p<4; p++) {
		var pp = p; pp += (c=='w'?7:1);
		scBox[p] = [ b1.f2x(f) + b1.d/2 + dc*prPos[p][0], b1.r2y(r) + b1.d/2 + dc*prPos[p][1], dh, dh, ui.pcs[pp]+'0' ];
		if (NOSVG) drawText(7,'','left','top',ui.pcs[pp],scBox[p][0],scBox[p][1]);
		else ui.ctx.drawImage(ui.imgs[pp], scBox[p][0], scBox[p][1], scBox[p][2], scBox[p][3] );
	}
	ui.ctx.stroke();
}

class SetupSideSelector extends Rect {
	constructor() {
		super(panel, -75, 0, 11*b1.dp/15, 8*b1.d+2*b1.dx-1, 'frame', layout.Setup);
		this.set = ['bK','bQ','bR','bB','bN','bP','wK','wQ','wR','wB','wN','wP'];
		this.piece = EMPTY;
	}
	render() {
		for (var i=0; i<this.set.length; i++) {
			var p = this.set[i];
			var d = 11*b1.dp/15;
			var dx = 11*b1.dp/15;
			drawAbsPiece( p, this.ax, i*dx+10, d );
			scBox[i] = [ this.ax, i*dx+10, d, d, p ];
		}
	}
}
var ss = new SetupSideSelector();
