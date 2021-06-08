function dds(i) {
	return 600+i*ui.ds;
}
class Status extends Rect {
	constructor() {
		super(panel, 0,dds(0),25*ui.ds,ui.ds, 'frame', layout.All);
	}
	render() {
		var ev = eval(pos); 
		for (var i=0; i<8; i++) {
			var ddm = this.ax;
			ui.ctx.beginPath();
			ui.ctx.fillStyle = COLOR.STATUS.BACKGROUND;
			ui.ctx.fillRect(ddm, dds(i), this.w, this.h);
			ui.ctx.strokeStyle = COLOR.STATUS.FRAME;
			ui.ctx.lineWidth = 0.5;
			ui.ctx.rect(ddm, dds(i), this.w, this.h);
			ui.ctx.stroke();
		}
		var i = 0;
		drawText(3,'','left','middle',pos.fen, ddm+15, dds(i)+ui.ds/2);
		i++;
		drawText(3,'','left','middle','Game PTR: '+g.ply+'/'+g.maxPly, ddm+15, dds(i)+ui.ds/2);
		i++;
		drawText(3,'','left','middle',ev[0]['name']+': '+(ev[0]['w']-ev[0]['b'])+' ('+ev[0]['w']+', '+ev[0]['b']+')', ddm+15, dds(i)+ui.ds/2);
		i++;
		drawText(3,'','left','middle',ev[1]['name']+': ('+ev[1]['w']+', '+ev[1]['b']+')', ddm+15, dds(i)+ui.ds/2);
		i++;
		drawText(3,'','left','middle',ev[2]['name']+': ('+ev[2]['w']+', '+ev[2]['b']+')', ddm+15, dds(i)+ui.ds/2);
		i++;
		drawText(3,'','left','middle',ev[3]['name']+': ('+ev[3]['w']+', '+ev[3]['b']+')', ddm+15, dds(i)+ui.ds/2);
		i++;
		var eventName = ui.lastEvent; if (eventName!=null) eventName=eventName.eventName;
		drawText(3,'','left','middle',g.state+' : '+eventName, ddm+15, dds(i)+ui.ds/2);
		i++;
		var s = ''; for (var j=0; j<ui.events.length; j++) s += ui.events[j].eventName+' ';
		drawText(3,'','left','middle',s, ddm+15, dds(i)+ui.ds/2);
	}
}
var status = new Status();
