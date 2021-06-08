class Setup {
	constructor() {
		this.savedFen = []; // saved boards for load/save in setup
		this.nSavedFen = 0;
		this.pSavedFen = 0;
		this.savedSetupFen = []; // save position for the cancelling of setup
		this.modified = false;
	}
}

// globals for all functions for faster processing
var ui = new UI(); // for loading images
var a = new Anim();
var g = new Game();
var pos = new Position(); // actual position
var m = new Move();
var setup = new Setup();
var b1 = new Board();
var panel = new Rect( null, b1.offset, 0, 700, b1.h, 'noframe', layout.All );
b1.title = new Title(panel,0,10,'StudyLines Version 0.0.7 Copyright 2020-2021');
b1.tags = new Title(panel,0,40,'Tags: ');
b1.comments = new Title(panel,0,70,'Comments: ');
var pgn = new Pgn();
var text_pgnmove = new Textbox('pgnmove', panel, 0,800,100,24, 'frame', layout.Main, 'PGN move...');
var text_fen = new Textbox('fenstring', panel, 0,830,500,24, 'frame', layout.Main, 'input FEN string...');

function initializeSavedFens(setup) {
	setup.nSavedFen = 0;
	for (var i=0; i<constFens.length; i++) {
		setup.savedFen[ setup.nSavedFen ] = [];
		setup.savedFen[ setup.nSavedFen ][0] = constFens[i][0];
		setup.savedFen[ setup.nSavedFen++ ][1] = constFens[i][1];
	}
}
function initGame(pFen) {
	g.initFen(pFen);
	pos.initFen(pFen);
	m.init();
	text_fen.text = pos.fen;
}
