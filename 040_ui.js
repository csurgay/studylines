class UI {
	constructor() {
		this.ticktimer;
		this.allLoaded = 12;
		this.imgs = [];
		this.pcs = ['bP', 'bN', 'bB', 'bR', 'bQ', 'bK', 'wP', 'wN', 'wB', 'wR', 'wQ', 'wK'];
		this.events = [];
		this.lastEvent = null;
		this.eventTimer;
		this.textColor = COLOR.TEXT.DARK;
		this.dm=40; // menu, board writings diameter
		this.ds=20; // status diameter !!! will be changed
		this.clickedMy = 0; // for board resize
		this.focus = null; // textbox in focus
		this.textboxes = [];
		this.cursorBlinkTimer = 0;
	}
	loadPieces() {
		for (var i=0; i<this.pcs.length; i++) {
			var img = new Image();
			img.onload = onloadImage;
			img.src = './svg/'+this.pcs[i]+'.svg';
			if (!NOSVG && !NOIMAGEDATA) img.crossOrigin = 'Anonymous';
			this.imgs.push(img);		
		}
	}
	push( eventName, evt ) {
		if ( typeof eventName !== 'undefined' ) {
			// console.log(g.state+' : '+event);
		}
		else {
			alert('undefined event in UI.push()');
			console.log( new Error().stack );
		}
		if (eventName==SM.E.MOUSEMOVE && this.events.length>0 && this.lastEvent.eventName==SM.E.MOUSEMOVE)
			this.events.splice(-1,1);
		if (eventName==SM.E.KEYDOWN && this.events.length>0 && this.lastEvent.eventName==SM.E.KEYDOWN)
			return;
		var e = new Event();
		e.setEventName(eventName);
		e.evt = evt;
		e.now = Date.now();
		e.button = evt.button;
		var rect = ui.canvas.getBoundingClientRect();
		e.mx = evt.clientX - rect.left; e.my = evt.clientY - rect.top;
		e.f = Math.floor((e.mx-b1.dx)/b1.d); e.r = 7 - Math.floor((e.my-b1.dy)/b1.d);
		e.withinBoard = pos.inside(e.f,e.r);
		if (b1.flip) { e.f = 7-e.f; e.r = 7-e.r; }
		this.events.push( e );
		this.lastEvent = e;
	}
}
function onloadImage() {
	ui.allLoaded--;
}
function tick() {
	if (ui.allLoaded==0) {
		clearInterval(ui.ticktimer);
		onloadCallback();
	}
}
