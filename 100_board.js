class ResizeControl extends Rect {
	constructor(parent) {
		super(parent, 0,0,0,0, 'noframe', layout.All);
		this.drc = 20; // resizeControl width
	}
	render() {
		ui.ctx.beginPath();
		ui.ctx.lineWidth = 1;
		ui.ctx.strokeStyle = '#000000';
		for (var i=0; i<2; i++) {
			ui.ctx.moveTo(this.ax + this.w, this.ay + i*this.drc/2);
			ui.ctx.lineTo(this.ax + i*this.drc/2, this.ay + this.h);
		}
		ui.ctx.stroke();
	}
	init(x,y,drc) {
		this.ax = x - 1.2*drc; 
		this.ay = y - 1.2*drc; 
		this.w = drc; 
		this.h = drc; 
		this.drc = drc;
	}
}
class Board extends Rect {
	constructor() {
		super(null, 0,0,window.innerHeight,window.innerHeight, 'noframe', layout.All);
		this.title;
		this.eval;
		this.x = 0; this.y = 0; // position
		this.dx = 50; this.dy = 50; // padding
		this.d = 100; this.dp = 100; // square size and piece size
		this.offset = 0; // for panel x
		this.daw = 20; // arrow width (head length=2x)
		this.prevImageData = null; // saved area image behind dragged pieces
		this.depth = 0; // search depth for best move calculation
		this.demo = false; // continuous play both sides
		this.squareNames = true; // numbering squares on the board
		this.trail = false; // draw all prev moves gray arrows
		this.attackSpots = false; // mark all attacked squares
		this.flip = false; // board upside down, black at the bottom
		this.resizeControl = new ResizeControl(this);
		this.h = window.innerHeight;
		this.init();
	}
	init() {
		if (SMALLBOARD==1) this.h = 550;
		this.w = this.h;
		this.daw = 20 / 900 * this.h;
		this.offset = this.w + 25;
		if (this.squareNames) { 
			this.d = this.h / 9;
			this.dp = this.d;
			this.dx = this.d / 2;
			this.dy = this.d / 2;
		}
		else {
			this.d = this.h / 8;
			this.dp = 1.07*this.d;
			this.dx = 0;
			this.dy = 0;
		}
		this.resizeControl.init(8*this.d+2*this.dx, 8*this.d+2*this.dy, 20 / 100 * this.d);
	}
	f2x(f) {
		return this.x + this.dx + this.d * f;
	}
	r2y(r) {
		return this.y + this.dy + this.d * (7-r);
	}
	render() {
		ui.ctx.fillStyle = COLOR.BACKGROUND;
		ui.ctx.fillRect(this.x,this.y,this.offset-1,this.offset-1);
		ui.ctx.fillStyle = COLOR.BOARD.FRAME;
		ui.ctx.fillRect(this.x,this.y,this.w,this.h);
		for (var i=0; i<8; i++) {
			for (var j=0; j<8; j++) {
				drawSquare(i,j);
			}
		}
		var bsize = b1.d / 12.0;
		if (b1.squareNames) {
			ui.textColor = COLOR.TEXT.LIGHT;
			for (var j=0; j<8; j++) {
				var i = b1.flip?7-j:j;
				drawText(bsize,'','center','middle','abcdefgh'[j],this.dy+i*this.d+this.d/2,this.dx/2);
				drawText(bsize,'','center','middle','abcdefgh'[j],this.dy+i*this.d+this.d/2,8*this.d+this.dx+this.dx/2);
				drawText(bsize,'','center','middle','87654321'[j],this.dx/2,this.dy+i*this.d+this.d/2);
				drawText(bsize,'','center','middle','87654321'[j],8*this.d+this.dx+this.dx/2,this.dy+i*this.d+this.d/2);
			}
			ui.textColor = COLOR.TEXT.DARK;
			ui.ctx.textAlign = "left"; ui.ctx.textBaseline = 'top';
			for (var ii=0; ii<8; ii++) {
				for (var jj=0; jj<8; jj++) {
					var i = this.flip?7-ii:ii;
					var j = this.flip?7-jj:jj;
					drawText(bsize/2,'','left','top',"abcdefgh"[ii]+"87654321"[jj],this.dy+i*this.d,this.dx+j*this.d);
				}
			}
		}
		this.resizeControl.render();
	}
}
