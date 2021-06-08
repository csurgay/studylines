class Rect {
	constructor(parent, x,y,w,h, frame, enabled) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.parent = parent;
		if (this.parent != null ) parent.os.push(this);
		this.enabled = enabled;
		this.ax = 0; this.ay = 0;
		this.os = []; // offsprings
		this.frame = frame;
		this.ax = this.x; // absolute x
		this.ay = this.y; // absolute y
		this.color_background = COLOR.BACKGROUND;
		this.color_frame = COLOR.TOOLBAR.FRAME;
		this.color = COLOR.TOOLBAR.COLOR;
	}
	absolute() {
		this.os.forEach( o => { o.ax = this.ax+o.x; o.ay = this.ay+o.y; o.absolute(); } );
	}
	setXY(x,y) {
		this.x = x; this.y = y;
		this.absolute();
	}
	setWH(w,h) {
		this.w = w; this.h = h;
	}
	addOffspring(pos) {
		this.os.push(pos);
	}
	cursorIn(mx,my) {
		return mx>this.ax && mx<this.ax+this.w && my>this.ay && my<this.ay+this.h;
	}
	render() {
		ui.ctx.beginPath();
		ui.ctx.fillStyle = this.color_background;
		ui.ctx.fillRect(this.ax,this.ay+0.5,this.w,this.h);
		ui.ctx.strokeStyle = this.color_frame;
		ui.ctx.lineWidth = 1;
		if (this.frame=='frame') drawRect(this.ax,this.ay,this.w,this.h);
		ui.ctx.stroke();
		ui.ctx.strokeStyle = this.color;
		ui.ctx.lineWidth = 1;
		this.os.forEach( o => { if (o.enabled()) o.render(); } );
	}
}
class Textbox extends Rect {
	constructor(name, parent, x,y,w,h, frame, enabled, defaultText) {
		super(parent, x,y,w,h, frame, enabled);
		this.name = name;
		ui.textboxes.push(this);
		this.defaultText = defaultText;
		this.text = defaultText;
		this.ptrCursor = 0;
		this.ptrStart = 0; // longer texts start somewhere
		this.selectOn = false;
		this.selectStart = 0; // selected region inside text
		this.selectEnd = 0;
		this.posChars = []; // position of chars to know which one was clicked
		this.cursorBlink = false; // true visible, false not visible
		this.px = 7; this.py = 7; // padding
		this.color_background = COLOR.TEXTBOX.BACKGROUND;
		this.color_frame = COLOR.TEXTBOX.FRAME;
		this.color = COLOR.TEXTBOX.COLOR;
	}
	clear() {
		this.text = '';
		this.ptrCursor = 0;
		this.ptrStart = 0;
		this.selectOn = false;
	}
	render() {
		super.render();
		var ptr = this.ptrStart;
		var fits = true;
		var x = this.ax+this.px; var y = this.y+this.py; var w;
		this.posChars = [];
		while (fits && ptr<=this.text.length) {
			if (this.ptrCursor==ptr && this.cursorBlink) {
				ui.ctx.beginPath();
				var curbias = TEXTBOX==1?10:4;
				ui.ctx.moveTo(x,y-curbias);
				ui.ctx.lineTo(x,y+this.h-2*this.py+curbias);
				ui.ctx.stroke();
			}
			if (ptr<this.text.length) {
				w = drawText(3,'','left','top',this.text[ptr],x,y,'measure');
				this.posChars[ptr] = [x,y-3,w,this.h-2*this.py+6];
				if (this.selectOn && ptr >= this.selectStart && ptr <this.selectEnd) {
					ui.ctx.beginPath();
					ui.ctx.fillStyle = COLOR.TEXT.HIGHLIGHT;
					ui.ctx.fillRect(x,y-3,w,this.h-2*this.py+6);
					ui.ctx.stroke();
				}
				drawText(3,'','left','top',this.text[ptr],x,y,'');
			}
			x += w;
			ptr++;
			if (ptr<this.text.length) if (x+drawText(3,'','left','top',this.text[ptr],x,y,'measure') > this.ax+this.w-this.px)
				fits = false;
		}
		this.posChars.push( [x-w, y-3, this.ax+this.w-x, this.h-2*this.py+6] );

		if (TEXTBOX==1) { // draw all chars rect
			ui.ctx.beginPath();
			for (var i=0; i<this.posChars.length; i++) {
				var p=this.posChars[i];
				ui.ctx.rect(p[0],p[1],p[2],p[3]);
			}
			ui.ctx.stroke();
		}
	}
	clicked(mx,my) {
		ui.focus = this;
		this.selectOn =false;
		if (this.text == this.defaultText) {
			this.clear();
		}
		else for(var i=0; i<this.posChars.length; i++) {
			var p = this.posChars[i];
			if (mx>=p[0] && mx<=p[0]+p[2] && my>=p[1] && my<=p[1]+p[3]) {
				this.ptrCursor = i;
				i = this.posChars.length;
			}
		}
		g.nextState(SM.S.TEXTBOX);
		doRedraw();
	}
	event(e) {
		if (g.inState(SM.S.TEXTBOX)) {
			// any textbox event resets blinking
			if (e.event(SM.E.MOUSEDOWN) || e.event(SM.E.MOUSEUP) || e.event(SM.E.KEYDOWN)) {
				ui.cursorBlinkTimer = 50;
				this.cursorBlink = true;
				this.render();
			}
			if (e.event(SM.E.MOUSEDOWN)) {
				// click inside focus textbox
				if (this.cursorIn(e.mx,e.my)) {
					g.nextState(SM.S.TEXTBOX);
					this.clicked(e.mx,e.my);
				}
				// click outside focus textbox
				else {
					g.nextState(SM.S.IDLE);
					this.cursorBlink = false;
					this.render();
					ui.focus = null;
					ui.events.push(ui.lastEvent);
				}
			}
			// Cursor arrows, keys and paste
			else if (e.event(SM.E.KEYDOWN)) {
				// console.log(e.evt.keyCode + ' ' + e.evt.key);
				// left, right, home, end
				if (e.evt.keyCode == 37) {
					// select
					this.ptrCursor = this.ptrCursor<=0?0:this.ptrCursor-1;
					if (e.evt.shiftKey) {
						if (this.selectOn) {
							if (this.ptrCursor > this.selectStart) {
								this.selectEnd = this.ptrCursor;
							}
							else {
								this.selectStart = this.ptrCursor;
							}
						}
						else {
							this.selectEnd = this.ptrCursor+1;
							this.selectStart = this.ptrCursor;
							this.selectOn = true;
						}
					}
					else {
						// if (this.selectOn) this.ptrCursor += 1;
						this.selectOn = false;
					}					
				}
				else if (e.evt.keyCode == 39) { 
					this.ptrCursor = this.ptrCursor>=this.text.length?this.text.length:this.ptrCursor+1;
					if (e.evt.shiftKey) {
						if (this.selectOn) {
							if (this.ptrCursor < this.selectEnd) {
								this.selectStart = this.ptrCursor;
							}
							else {
								this.selectEnd = this.ptrCursor;
 							}
						}
						else {
							this.selectStart = this.ptrCursor-1;
							this.selectEnd = this.ptrCursor;
							this.selectOn = true;
						}
					}
					else {
						this.selectOn = false;
					}
				}
				else if (e.evt.keyCode == 65 && e.evt.ctrlKey) { // select all
					this.selectOn = true;
					this.selectStart = 0;
					this.selectEnd = this.text.length;
				}
				else if (e.evt.keyCode == 36) this.ptrCursor = 0;
				else if (e.evt.keyCode == 35) this.ptrCursor = this.text.length;
				// enter
				else if (e.evt.keyCode == 13) {
					if (this.name=='fenstring') {
						pos.initFen(this.text);
					}
					if (this.name=='pgnmove') {
						doPgnMove( g,pos,this.text );
						this.clear();
					}
				}
				else if (e.evt.keyCode == 67 && e.evt.ctrlKey) { // copy
					if (this.selectOn) 
						copy( this.text.substr(this.selectStart, this.selectEnd-this.selectStart) );
				}
				// clear selection
				else if (this.selectOn) {
					this.selectionCleared = true;
					this.text = this.text.substr(0,this.selectStart) + this.text.substr(this.selectEnd,this.text.length-this.selectEnd);
					this.ptrCursor = this.selectStart;
					this.selectOn = false;
				}
				if (e.evt.keyCode == 86 && e.evt.ctrlKey) { // paste
					paste( ui.focus, this.text.substr(0,this.ptrCursor), this.text.substr(this.ptrCursor,this.text.length-this.ptrCursor) );
				}
				else if ( (e.evt.keyCode >= 48 && e.evt.keyCode <= 57)   || // number keys
				(e.evt.keyCode == 32)   || // space
				(e.evt.keyCode >= 65 && e.evt.keyCode <= 90)   || // letter keys
				(e.evt.keyCode > 95 && e.evt.keyCode < 112)  || // numpad keys
				(e.evt.keyCode > 185 && e.evt.keyCode < 193) || // ;=,-./` (in order)
				(e.evt.keyCode > 218 && e.evt.keyCode < 223) ) {   // [\]' (in order)
					this.text = this.text.substr(0,this.ptrCursor)+e.evt.key+this.text.substr(this.ptrCursor,this.text.length-this.ptrCursor);
					this.ptrCursor++;
				}
				else if (e.evt.keyCode == 8 && this.ptrCursor > 0) { // backspace
					this.text = this.text.substr(0,this.ptrCursor-1)+this.text.substr(this.ptrCursor,this.text.length-this.ptrCursor);
					this.ptrCursor--;
				}
				else if (e.evt.keyCode == 46) { // delete
					this.text = this.text.substr(0,this.ptrCursor)+this.text.substr(this.ptrCursor+1,this.text.length-this.ptrCursor);
				}
				doRedraw();
			}
		}
	}
}
function textCursorTick(value) {
	return !value;
}
