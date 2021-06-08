class Toolbar extends Rect {
	constructor(parent,px,py, enabled) {
		super(parent, px,py,0,0, 'noframe', enabled);
		this.bw = 55; // button width
		this.bh = 37; // button height
		this.bd = 8; // button padding
		super.setWH(4*this.bd,2*this.bd);
		this.color_background = COLOR.TOOLBAR.BACKGROUND;
		this.color_frame = COLOR.TOOLBAR.FRAME;
		this.color = COLOR.TOOLBAR.COLOR;
	}
	addButton(o) {
		o.parent = this;
		o.setWH(this.bw,this.bh);
		this.addOffspring(o);
		var l = this.os.length;
		o.setXY( 2*this.bd + (l-1)*(this.bw+this.bd), this.bd );
		this.setWH( 4*this.bd + l*this.bw + (l-1)*this.bd, this.bh + 2*this.bd );
	}
	clicked(mx,my) {
		if (this.enabled()) {
			for (var i=0; i<this.os.length; i++) 
				if (this.os[i].cursorIn(mx,my)) this.os[i].clicked(mx,my);
		}
	}
}
var toolbar = new Toolbar( panel, 0, 100, layout.Main );
toolbar.addButton( new ButtonColor() );
toolbar.addButton( new ButtonHome() );
toolbar.addButton( new ButtonTakeback() );
toolbar.addButton( new ButtonForward() );
toolbar.addButton( new ButtonEnd() );
toolbar.addButton( new ButtonDepth() );
toolbar.addButton( new ButtonAIMove() );
var toolbar2 = new Toolbar( panel, 0, 150, layout.Main );
toolbar2.addButton( new ButtonDemo() );
toolbar2.addButton( new ButtonSquareNames() );
toolbar2.addButton( new ButtonFlip() );
toolbar2.addButton( new ButtonAttackSpots() );
toolbar2.addButton( new ButtonTrail() );
toolbar2.addButton( new ButtonSetupPos() );
toolbar2.addButton( new ButtonPgn() );
toolbarSetup = new Toolbar( panel, 0, 100, layout.Setup );
toolbarSetup.addButton( new ButtonColor() );
toolbarSetup.addButton( new ButtonSetupNew() );
toolbarSetup.addButton( new ButtonSetupEmpty() );
toolbarSetup.addButton( new ButtonSetupLoad() );
toolbarSetup.addButton( new ButtonSetupSave() );
toolbarSetup.addButton( new ButtonSetupRevert() );
toolbarSetup.addButton( new ButtonSetupExit() );
