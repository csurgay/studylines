// server config
var NOSVG = 0; // uses letters instead of svg chess figures
var NOIMAGEDATA = 0; // works only on server because of 'cross site origin'
var PGNLOG = 0; // logs when reading pgn data
var EVENTLOG = 0; // logs mouse events and states
var SILENT = 0; // Turn off move sounds
var SMALLBOARD = 0; // Turn off move sounds
var TEXTBOX = 0; // textbox debug charboxes and large cursor

// log
function logerror(who, what, why='') {
	console.log('Runtime error:');
	console.log('---who: '+who);
	console.log('---what: '+what);
	if (why!='') console.log('---why: '+why);
	console.log(' ');
	alert('Runtime error, see console...');
	throw 'Runtime error';
}

// empty square
const EMPTY = '   ';
const F = 'abcdefgh'; // files
const R = '12345678'; // ranks
const initialPosition = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
function emptyBoard() {
	var ret = [ 
		[EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY],
		[EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY],
		[EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY],
		[EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY],
		[EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY],
		[EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY],
		[EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY],
		[EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY]
	];
	return ret;
}

const COLOR = {
	BACKGROUND: '#edebe9',
	PGN : { BACKGROUND: '#ffffff', FRAME: '#d9d9d9', COLOR: '#4d4d4d' },
	TEXTBOX : { BACKGROUND: '#ffffff', FRAME: '#d9d9d9', COLOR: '#4d4d4d' },
	TOOLBAR : { BACKGROUND: '#ffffff', FRAME: '#d9d9d9', COLOR: '#4d4d4d' },
	BUTTON : { BACKGROUND: '#ffffff', FRAME: '#d9d9d9', COLOR: '#4d4d4d' },
	TEXT: { LIGHT: '#cccccc', DARK: '#555555', HIGHLIGHT: "#aecbfa" },
	BOARD: { FRAME: '#666666', BLACK: '#ababab', WHITE: '#dcdcdc', INMOVEFRAME: '#e8e8e8', INMOVE: '#aab3bf' },
	// BOARD: { FRAME: '#ffffff', BLACK: '#ababab', WHITE: '#dcdcdc', INMOVEFRAME: '#e8e8e8', INMOVE: '#aab3bf' },
	STATUS: { BACKGROUND: '#ffffff', FRAME: '#d9d9d9' },
	ARROW: { 'G': [0,180,0,0.75], 'R': [180,0,0,0.75], 'B': [0,180,180,0.75], 'Y': [250,200,0,0.75], 'L': [100,100,100,0.35], 'N': [60,180,20,0.35] }
}

// State Machine
const SM = {
	// Layouts
	L: {
		PLAY: 'PLAY',
		SETUP: 'SETUP'
	},
	// Events
	E: {
		MOUSEDOWN: 'MOUSEDOWN',
		MOUSEUP: 'MOUSEUP',
		MOUSEMOVE: 'MOUSEMOVE',
		RIGHTDOWN: 'RIGHTDOWN',
		RIGHTUP: 'RIGHTUP',
		MOUSEWHEEL: 'MOUSEWHEEL',
		KEYDOWN: 'KEYDOWN',
		KEYUP: 'KEYUP',
		RIGHTCLICK: 'RIGHTCLICK'
	},
	// States
	S: {
		TEXTBOX: 'TEXTBOX',
		IDLE: 'IDLE',
		CLICKED: 'CLICKED',
		DRAG: 'DRAG',
		MOVESTART: 'MOVESTART',
		PROMOTION: 'PROMOTION',
		SETUP: {
			IDLE: 'SETUP.IDLE',
			SIDECLICK: 'SETUP.SIDECLICK',
			BOARDCLICK: 'SETUP.BOARDCLICK',
			DRAG: 'SETUP.DRAG'
		},
		RESIZE: 'RESIZE',
		RIGHTDOWN: 'RIGHTDOWN'
	}
}

class Layout {
	constructor() {}
	All() { return true; }
	Setup() { return g.state.substr(0,5) == 'SETUP'; }
	Main() { return g.state.substr(0,5) != 'SETUP'; }
}
var layout = new Layout();

// sounds
var soundMove = new Audio('mp3/Move.mp3'); soundMove.load();
var soundCapture = new Audio('mp3/Capture.mp3'); soundCapture.load();
var soundCastle2 = new Audio('mp3/Castle2.mp3'); soundCastle2.load();

// saved game data
const constPgns = [ // →  
	
	["1. d4 Nf6 { Indian game } 2. c4 e6 3. Nc3 Bb4 { Nimzo-Indian defense } 4. Nf3 { Three nights variation } 4... 0-0 5. Bg5 c5 6. e3 cxd4 { [%ar Be3d4D] } 7. Qxd4 { 0 → -0.5 exd4 was best } { [%ar Rd1d4D] [%ar Be3d4D] } 7... Nc6 8. Qd3 h6 9. Bh4 d5 10. Rd1 g5 11. Bg3 Ne4 12. Nd2 Nc5 13. Qc2 d4 14. Nf3 e5 15. Nxe5 dxc3 { Q sac is best move! } { [%ar Rc3b2S] [%ar Rb4e1S] [%sq Re1S] } 16. Rxd8 cxb2+ { [%ar Rb4e1S] [%ar Be1e2D] [%ar Bd8d2D] [%sq Re1S] } 17. Ke2 { Blunder 0 → -3, 17. Rd2 Rd8 18. Nf3 Bg4 19. Qxb2 is equal game } { [%ar Bd8d2D] [%ar Bf8d8D] [%ar Be5f3D] [%ar Bc8g4D] [%ar Bc2b2D] } 17... Rxd8 18. Qxb2 Na4 { [%ar Ra4c3D] [%ar Rc3e2D] } 19. Qc2 Nc3+ 20. Kf3 { [%sq Re2D] [%sq Re4D] [%sq Rf4D] [%sq Rg4D] } 20... Rd4 { [%ar Ge3d4D] [%ar Rc6d4D] [%ar Rd4c2D] [%ar Rd4f3D] } 21. h3 h5 { [%ar Yg5g4D] [%ar Yg4f3D] [%sq Yf3D] } 22. Bh2 { [%ar Bf3g3D] [%ar Bg3h4D] } 22... g4+ 23. Kg3 { [%ar Rd4d2D] [%ar Rd2f2D] } 23... Rd2 { [%ar Gc2d2D] [%ar Rc3e4D] [%ar Re4c2D] [%ar Re4g3D] } 24. Qb3 Ne4+ 25. Kh4 Be7+ 26. Kxh5 Kg7 27. Bf4 Bf5 { [%ar Ya8h8D] [%ar Yh8h5D] [%sq Yh5D] } 28. Bh6+ Kh7 29. Qxb7 Rxf2 30. Bg5 { #-7 } 30... Rh8 31. Nxf7 Bg6+ 32. Kxg4 Ne5+ { White resigned here } 33. Nxe5 Bf5+ 34. Kh5 Kg7+ 35. Bh6+ Rxh6# 0-1","Jinshi Bai vs. Ding Liren (2017) King hunt"],
	
	["{mating threat at the end} {[%ar Yg6e8D]} 1. e4 b6 { [%ar Rc8b7] [%ar Rb7h1] } 2. d4 Bb7 { [%ar Rb7e4] } 3. Bd3 { [%ar Gd3e4] [%ar Rb7e4] } 3... f5 { [%ar Rb7e4] [%ar Gd3e4] [%ar Rf5e4] } 4. exf5 Bxg2 { [%ar Rg2h1] } 5. Qh5+ { [%ar Rh5e8] } 5... g6 6. fxg6 Nf6 { [%ar Rf6h5] } 7. gxh7+ { [%ar Rh5e8] } 7... Nxh5 8. Bg6# { [%ar Yg6e8D] [%sq Ye8D] [%sq Yf7D] } 1-0","Fool's mate - Greco vs. NN 1625"],
	
	['1. e4 e5 2. Bc4 d6 3. Qh5 Nf6 4. Qxf7# 1-0', "Sholar's mate - Francis Beale 1656"],
	
	['1. d4 f5 {Dutch defence} 2. Bg5 {Hopton attack} 2... h6 3. Bh4 g5 4. Bg3 f4 5. e3 { [%ar Rd1h5] [%ar Rh5e8] [%sq Re8] [%sq Rf7] } 5... h5 { [%ar Gh8h5] [%sq Gh5] } 6. Bd3 { [%ar Rd3g6] [%ar Rg6e8] [%sq Re8] } 6... Rh6 { [%ar Gh6h5] [%ar Gh6g6] [%sq Gh5] [%sq Gg6] } 7. Qxh5+ { [%ar Rh5e8] [%ar Bh5g6] [%sq Bg6] [%sq Rf7] [%sq Re8] } 7... Rxh5 { [%ar Yd3g6] [%sq Yg6] } 8. Bg6# { [%ar Rg6e8] [%sq Rf7] [%sq Re8] } 1-0',"Fool's mate - Teed vs. Delmar, 1896"],
	
	['1. e4 e5 2. Nf3 Nf6 {Russian game} 3. Nxe5 Nc6 {Stafford gambit} 4. Nxc6 {Stafford gambit accepted} 4... dxc6 5. d3 Bc5 6. Bg5 {Blunder, h3 was best} {[%eval -4.5]} 6... Nxe4 7. Bxd8 Bxf2+ 8. Ke2 Bg4# 0-1','Russian game Stafford gambit'],
	
	['1. e4 e5 2. Nf3 f6 3. Nxe5 fxe5 4. Qh5+ Ke7 5. Qxe5+ Kf7 6. Bc4+ Kg6 7. Qf5+ Kh6 8. d3+ g5 9. h4 Qe7 10. Bxg5+', 'Sholars mate e5 Nf3 Nc6'],
	
	['1. e4 e5 2. Nf3 Nc6 3. Bc4 d6 4. Nc3 Bg4 5. Nxe5 Bxd1 6. Bxf7+ Ke7 7. Nd5#', 'Scholars mate c5 Nf3'],
	
	["1. e4 e5 2. f4 {King's gambit} 2... exf4 3. Bc4 { [%ar Yg1f3] } 3... Qh4+ 4. Kf1 b5 {Bryan Countergambit} 5. Bxb5 Nf6 6. Nf3 Qh6 7. d3 { [%ar Yb1c3] } 7... Nh5 8. Nh4 Qg5 { [%ar Yg7g6] } 9. Nf5 c6 { [%ar Yg7g6] [%ar Rc6b5] } 10. g4 { [%ar Rc6b5] [%ar Rg4h5] } 10... Nf6 11. Rg1 { [%ar Rc6b5] } 11... cxb5 {Blunder} {[%eval +3]} { [%ar Yh7h5] } 12. h4 { [%ar Gf5h4] } 12... Qg6 13. h5 Qg5 14. Qf3 { [%ar Rc1f4] [%ar Re4e5] [%ar Be5f6] [%ar Bf3a8] } 14... Ng8 15. Bxf4 Qf6 16. Nc3 Bc5 { [%ar Rc5g1] } 17. Nd5 { [%ar Rd5f6] [%ar Rd5c7] [%ar Bc7e8] [%ar Bc7a8] } 17... Qxb2 { [%ar Rb2a1] [%ar Ra1g1] } 18. Bd6 { [%ar Yd3d4] [%ar Yf4e3] [%ar Ya1e1] } 18... Bxg1 { [%ar Yb2a1] } 19. e5 { [%ar Rf5g7] [%ar Ge8d8] [%ar Rd6c7] [%ar Rc7d8] [%sq Rd8] } 19... Qxa1+ 20. Ke2 Na6 21. Nxg7+ { [%ar Rg7e8] } 21... Kd8 22. Qf6+ { [%ar Rf6d8] } 22... Nxf6 23. Be7# { [%ar Re7d8] [%sq Rd8] } 0-1","Immortal game Kieseritzky va Anderssen 1851"],
	
	["1. d4 d5 2. c4 {Queen's gambit} e5 {Albin's countergambit} 3. dxe5 d4 4. e3 Bb4+ 5. Bd2 dxe3 6. Bxb4 {[%eval -8.8]} {Blunder, best move is fxe3 double pwns} exf2+ 7. Ke2 fxg1=N+ { [%ar Gh1g1] [%ar Rc8g4] [%ar Rg4d1] } 8. Ke1 Qh4+ { [%ar Gg2g3] [%ar Rh4e4] [%ar Re4e1] [%ar Re4h1] } 9. Kd2 Nc6 { [%ar Rc6e5] } 10. Bc3 { [%ar Rc6e5] [%ar Gc3e5] } 10... Bg4 { [%ar Rg4d1] [%ar Bd1e1] [%ar Bd1c1] [%ar Bd1c2] } 11. Qc2 0-0-0+ { [%ar Rd8d2] }","Lasker trap in Albin Countergambit - 1882"],
	
	['1. e4 c5 2. Nf3 Nc6 3. d4 cxd4 4. Nxd4 e5 5. Nb5 d6 6. N1c3 a6 7. Na3 Nf6 8. Bg5 Be7 9. Bxf6 gxf6 10. Qh5 Be6 11. Bc4 Bxc4 12. Nxc4 b5 13. Ne3 Qa5 14. O-O Nd4 15. Ncd5 Ra7 16. Rfd1 Rd7 17. c3 Ne6 18. Nxe7 Kxe7 19. Nd5+ Kd8 20. Nxf6 Nf4 21. Qf5 Qc7 22. Nxd7 Qxd7 23. Qf6+', '2010.09.02. Egyed(1950) - Domonkos(1697) 1-0'],
	
	['1. d4 g6 2. g3 Bg7 3. Bg2 d6 4. e4 Nf6 5. Ne2 O-O 6. O-O Nbd7 7. h3 e5 8. c3 Re8 9. Qd3 Qe7 10. Bg5 h6 11. Bxf6 Bxf6 12. f4 c5 13. d5 Nb6 14. Nd2 Bd7 15. Rab1 c4 16. Qe3 exf4 17. Qxf4 Bg5 18. Qf2 Bxd2 19. Nd4 Qg5 20. Nc2 Re7 21. h4 Qe5 22. Rbd1 Bxc3 23. bxc3 Qxc3 24. Nd4 Bg4 25. Rc1 Qd3 26. Nb5 Nd7 27. Rfe1 c3 28. Nxc3 Rc8 29. Bf1 Qf3 30. Bg2 Qd3 31. Bf1 Qf3 32. Qxf3 Bxf3 33. Re3 Ne5 34. Rb1 a6 35. Bh3 Rc4 36. Bf1 Rd4 37. Rb6 Rd7 38. Rb1 Re7 39. Bg2 Bxg2 40. Kxg2 Nc4 41. Re2 Rd3 42. Nd1 Nd2 43. Rb4 Rxd5 44. Nf2 a5 45. exd5 Rxe2 46. Rxb7 f5 47. Kg1 Re1+ 48. Kg2 Re2 49. Kg1 Nf3+ 50. Kg2 Ne5 51. Kf1 Rxa2 52. Rb6 Nc4 53. Rc6 Ra1+ 54. Kg2 Rc1 55. Nd3 Ne3+ 56. Kf3', '2010.09.03. Konya(2111) - Egyed(1950) 0-1'],
	
	['1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6 4. Ng5 d5 5. exd5 Nxd5 6. Nxf7 Kxf7 7. Qf3+ Ke6 8. Nc3 Ne7 9. 0-0','Two Knights Defense w/ Fried Liver'],
	
	['1. e4 d6 2. d4 e5 3. Nf3 Bg4 4. dxe5 Bxf3 5. Qxf3 dxe5 6. Bc4', 'Philidor '],
	
	['1. d4 d5 2. c4 dxc4 3. e4 Nf6 4. e5 Nd5 5. Bxc4 Nb6 6. Bd3 Nc6 7. Be3 Nb4 8. Be4 f5 9. a3 Nd5 10. Bxd5 Nxd5 11. Ne2 Be6 12. 0-0 c6 13. Nc3 g6 14. Qd2',"QGA Nf6 - Queen's Gambit Accepted"],
	
	['1. d4 d5 2. c4 dxc4 3. e4 e5 4. Nf3 exd4 5. Bxc4 Nc6 6. 0-0 Be6 7. Bxe6 fxe6 8. Qb3 Qd7 9. Qxb7 Rb8 10. Qa6 Nf6 11. Nd2 Be7 12. b3 0-0 13. Ba3','QGA e5'],
	
	["1. e4 e5 2. Nf3 d6 3. d4 Bg4 { [%ar Re5d4] [%ar Gf3d4] [%ar Rg4d1] } 4. dxe5 { [%ar Rd6e5] [%ar Rd1d8] [%ar Be8d8] } 4... Bxf3 5. Qxf3 dxe5 6. Bc4 { [%ar Rf3f7] [%ar Gc4f7] [%ar Rf7e8] [%sq Re8] } 6... Nf6 7. Qb3 { [%ar Rb3f7] [%ar Rb3b7] } 7... Qe7 { [%ar Ge7f7] [%ar Rb3b7] } 8. Nc3 c6 { [%ar Ge7b7] } 9. Bg5 b5 { [%ar Yc3b5] } 10. Nxb5 cxb5 11. Bxb5+ { [%ar Rb5e8] } 11... Nbd7 12. 0-0-0 { [%ar Rb5d7] [%ar Rd1d7] } 12... Rd8 { [%ar Yd1d7] } 13. Rxd7 Rxd7 14. Rd1 { [%ar Rd1d7] [%ar Rb5d7] } 14... Qe6 { [%ar Bg5e7] } 15. Bxd7+ Nxd7 { [%ar Yb3b8] } 16. Qb8+ Nxb8 17. Rd8# { [%ar Gg5d8] [%ar Rd8e8] [%ar Rd8d7] [%sq Re8] [%sq Rd7] [%sq Bh8] [%sq Bf8] [%sq Bb8] [%sq Be6] [%sq Yg5] [%sq Yd8] } 1-0",'Opera Game - Paul Morphy 1858'],
	
	['1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 6. Bg5 e6 7. f4 Be7 8. Qf3 Qc7 9. f5 Nc6 10. Nxc6 bxc6 11. g4 d5 12. 0-0-0 Rb8 13. Bf4 e5 14. Bg3 0-0 15. h4 dxe4 16. Nxe4 Qa5 17. Bc4 Nxe4 18. Qxe4 Rxb2 19. Kxb2 Ba3+ 20. Kb1 Qb4+','Najdorf Sicilian - GM Anish Giri'],
	
	["1. d4 f5 {Dutch Defense} 2. Nf3 e6 3. Nc3 Nf6 4. Bg5 Be7 5. Bxf6 Bxf6 6. e4 fxe4 7. Nxe4 b6 8. Bd3 Bb7 9. Ne5 0-0 10. Qh5 Qe7 {(0.0 → #7) Blunder, Bxe5 was best} {[%eval #7]} { [%ar Yh5h7] } 11. Qxh7+ { [%ar Bg8h7] } 11... Kxh7 { [%ar Bg8h7] } 12. Nxf6+ { [%ar Bh7h6] [%ar Bg8h7] [%ar Rd3h7] [%ar Ge5g6] [%ar Gg6h8] [%ar Gg6e7] [%sq Rg8] [%sq Rg6] [%sq Gh8] [%sq Rh7] } 12... Kh6 { [%ar Bg8h7] [%ar Bh7h6] } 13. Neg4+ { [%ar Bg8h7] [%ar Bh7h6] [%ar Bh6g5] [%sq Rh7] [%sq Rg6] [%sq Rh5] } 13... Kg5 { [%ar Bg8h7] [%ar Bh7h6] [%ar Bh6g5] } 14. h4+ { [%ar Bg8h7] [%ar Bh7h6] [%ar Bh6g5] [%ar Bg5f4] [%sq Rh5] [%sq Rh6] [%sq Rg6] [%sq Rf5] [%sq Rf6] [%sq Rg4] [%sq Rh4] } 14... Kf4 { [%ar Bg8h7] [%ar Bh7h6] [%ar Bh6g5] [%ar Bg5f4] } 15. g3+ { [%ar Bg8h7] [%ar Bh7h6] [%ar Bh6g5] [%ar Bg5f4] [%ar Bf4f3] [%sq Rf5] [%sq Re5] [%sq Rg5] [%sq Rg4] [%sq Re4] [%sq Re3] } 15... Kf3 { [%ar Bg8h7] [%ar Bh7h6] [%ar Bh6g5] [%ar Bg5f4] [%ar Bf4f3] } 16. Be2+ { [%ar Bg8h7] [%ar Bh7h6] [%ar Bh6g5] [%ar Bg5f4] [%ar Bf4f3] [%ar Bf3g2] [%sq Rf4] [%sq Re4] [%sq Re3] [%sq Rg4] [%sq Rg3] [%sq Rf2] [%sq Re2] } 16... Kg2 { [%ar Bg8h7] [%ar Bh7h6] [%ar Bh6g5] [%ar Bg5f4] [%ar Bf4f3] [%ar Bf3g2] } 17. Rh2+ { [%ar Bg8h7] [%ar Bh7h6] [%ar Bh6g5] [%ar Bg5f4] [%ar Bf4f3] [%ar Bf3g2] [%ar Bg2g1] [%sq Rf3] [%sq Rg3] [%sq Rh3] [%sq Rh2] [%sq Rf2] [%sq Rh1] [%sq Rf1] } 17... Kg1 { [%ar Ye1d2] [%ar Bg8h7] [%ar Bh7h6] [%ar Bh6g5] [%ar Bg5f4] [%ar Bf4f3] [%ar Bf3g2] [%ar Bg2g1] [%ar Ra1g1] [%ar Gg4h2] [%ar Gg4f2] [%sq Rh1] [%sq Rg2] } 18. 0-0-0# { [%ar Bg8h7] [%ar Bh7h6] [%ar Bh6g5] [%ar Bg5f4] [%ar Bf4f3] [%ar Bf3g2] [%ar Bg2g1] [%ar Gg4h2] [%ar Gg4f2] [%ar Rd1g1] [%sq Rg2] [%sq Rh1] } 1-0",'Edward Lasker - Sir George Thomas 1911'],
	
	['1. e4 { [%clk 0:05:00] } 1... b6 { [%clk 0:05:00] } { B00 Owen Defense } 2. d4 { [%clk 0:04:58] } 2... Bb7 { [%clk 0:04:59] } 3. Nc3 { [%clk 0:04:50] } 3... g6 { [%clk 0:04:57] } 4. Bd3 { [%clk 0:04:47] } 4... Bg7 { [%clk 0:04:56] } 5. Be3 { [%clk 0:04:46] } 5... e6 { [%clk 0:04:53] } 6. Nf3 { [%clk 0:04:45] } 6... Ne7 { [%clk 0:04:52] } 7. O-O { [%clk 0:04:44] } 7... O-O { [%clk 0:04:51] } 8. Ng5 { [%clk 0:04:34] } 8... h6 { [%clk 0:04:42] } 9. Nf3 { [%clk 0:04:32] } 9... d6 { [%clk 0:04:37] } 10. Qd2 { [%clk 0:04:31] } 10... g5 { [%clk 0:04:30] } 11. e5 { [%clk 0:04:15] } 11... Bxf3 { [%clk 0:04:26] } 12. gxf3 { [%clk 0:04:14] } 12... d5 { [%clk 0:04:20] } 13. Kh1 { [%clk 0:04:10] } 13... Nbc6 { [%clk 0:04:06] } 14. Rg1 { [%clk 0:04:08] } 14... Kh8 { [%clk 0:03:51] } 15. Bxg5 { [%clk 0:03:59] } 15... hxg5 { [%clk 0:03:47] } 16. Rxg5 { [%clk 0:03:57] } 16... Nxd4 { [%clk 0:03:23] } 17. Rh5+ { [%clk 0:03:51] } 17... Kg8 { [%clk 0:03:20] } 18. Bh7+ { [%clk 0:03:49] } 18... Kh8 { [%clk 0:03:16] } 19. Qxd4 { [%clk 0:03:36] } 19... f6 { [%clk 0:02:54] } 20. Rg1 { [%clk 0:03:32] } 20... fxe5 { [%clk 0:02:45] } 21. Bf5+ { [%clk 0:03:21] } 21... Kg8 { [%clk 0:02:35] } 22. Bxe6+ { [%clk 0:03:20] } 22... Rf7 { [%clk 0:02:26] } 23. Rxg7+ { [%clk 0:03:14] } 23... Kxg7 { [%clk 0:02:20] } 24. Qxe5+ { [%clk 0:03:12] } 24... Rf6 { [%clk 0:02:11] } 25. Qg5+ { [%clk 0:03:07] } 25... Ng6 { [%clk 0:02:01] } 26. Qh6# { [%clk 0:03:05] } { White wins by checkmate. } 1-0','studylines vs HWTD5 2021-02-18'],
	
	['1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. d3 Nf6 5. c3 0-0 6. Bb3 a6 7. 0-0 Ba7 8. Bg5 h6 9. Bh4 d6 10. Nd2 g5 11. Bg3 Nh5 12. Nxe5 Nxe5 13. Qxh5 Kg7 14. d4 Ng6 15. f4 gxf4 16. Bxf4 Qh4 17. Bxh6+ Kg8 18. Qxg6+ 1-0','Gauri - Nakamura 2015'],

	['1. e4 e5 2. Nf3 Nc6 3. Bb5 Nf6 4. 0-0 Ng4 5. h3 h5 6. hxg4 hxg4 7. Ne1 Qh4 8. f3 g3 9. Bxc6 Qh2# 0-1','Scholars mate - Fishing pole'],
	
	['1. e4 { [%eval 0.25] [%clk 0:05:00] } 1... e5 { [%eval 0.31] [%clk 0:05:00] } 2. Nf3 { [%eval 0.28] [%clk 0:04:59] } 2... Nc6 { [%eval 0.27] [%clk 0:04:59] } 3. Bb5 { [%eval 0.17] [%clk 0:04:58] } 3... Nf6 { [%eval 0.48] [%clk 0:04:56] } { C65 Ruy Lopez: Berlin Defense } 4. d3 { [%eval 0.32] [%clk 0:04:56] } 4... a6? { (0.32 → 1.75) Mistake. Bc5 was best. } { [%eval 1.75] [%clk 0:04:47] } (4... Bc5 5. Bxc6 dxc6 6. O-O Qe7 7. Nbd2 a5 8. Nc4 Nd7 9. c3) 5. Bxc6 { [%eval 1.55] [%clk 0:04:55] } 5... dxc6 { [%eval 1.74] [%clk 0:04:46] } 6. O-O?? { (1.74 → 0.15) Blunder. Nxe5 was best. } { [%eval 0.15] [%clk 0:04:55] } (6. Nxe5 Be6 7. f4 Qe7 8. O-O O-O-O 9. Nc3 g6 10. Be3 Kb8) 6... Bc5?? { (0.15 → 1.74) Blunder. Bd6 was best. } { [%eval 1.74] [%clk 0:04:38] } (6... Bd6 7. Nbd2 Be6 8. b3 Qe7 9. a4 Nd7 10. Nc4 f6 11. Nxd6+) 7. Nc3? { (1.74 → 0.39) Mistake. Nxe5 was best. } { [%eval 0.39] [%clk 0:04:51] } (7. Nxe5 Qe7 8. Nf3 Bg4 9. h3 Bxf3 10. Qxf3 O-O 11. Nd2 Rfe8) 7... h6?! { (0.39 → 1.38) Inaccuracy. Qd6 was best. } { [%eval 1.38] [%clk 0:04:31] } (7... Qd6 8. h3 Be6 9. a3 Nd7 10. b4 Bb6 11. Na4 O-O 12. c4) 8. Nxe5 { [%eval 1.57] [%clk 0:04:46] } 8... Bg4?? { (1.57 → 6.87) Blunder. Qe7 was best. } { [%eval 6.87] [%clk 0:04:25] } (8... Qe7 9. d4) 9. Qd2?? { (6.87 → 2.06) Blunder. Nxg4 was best. } { [%eval 2.06] [%clk 0:04:31] } (9. Nxg4 Qe7 10. Nxf6+ Qxf6 11. Be3 Be7 12. f4 O-O-O 13. Qf3 Kb8 14. h3 Ka8 15. f5 g6) 9... Bd4?! { (2.06 → 3.22) Inaccuracy. Be6 was best. } { [%eval 3.22] [%clk 0:04:12] } (9... Be6 10. Qe1 Nd7 11. Nf3 Qe7 12. Be3 O-O-O 13. Bxc5 Qxc5 14. Qe3 Qxe3 15. fxe3 c5 16. Kf2) 10. Nxg4 { [%eval 2.94] [%clk 0:04:28] } 10... Nxg4 { [%eval 2.91] [%clk 0:04:09] } 11. Qf4 { [%eval 2.84] [%clk 0:04:20] } 11... h5 { [%eval 2.71] [%clk 0:03:52] } 12. Ne2?? { (2.71 → 0.40) Blunder. h3 was best. } { [%eval 0.4] [%clk 0:04:16] } (12. h3 Be5) 12... Rh6?? { (0.40 → 4.98) Blunder. Be5 was best. } { [%eval 4.98] [%clk 0:03:37] } (12... Be5 13. Qg5 Bxh2+ 14. Kh1 Qxg5 15. Bxg5 Bd6 16. f3 f6 17. Bd2 Ne5 18. Nd4 g5 19. f4) 13. Nxd4 { [%eval 5.02] [%clk 0:04:00] } 13... Rf6?! { (5.02 → 8.41) Inaccuracy. Qxd4 was best. } { [%eval 8.41] [%clk 0:03:31] } (13... Qxd4 14. Qxc7 Qd6 15. Bf4 Qxc7 16. Bxc7 Re6 17. Rae1 f6 18. d4 h4 19. Ba5 Nh6 20. h3) 14. Qg3?! { (8.41 → 5.98) Inaccuracy. Nf5 was best. } { [%eval 5.98] [%clk 0:03:43] } (14. Nf5 g6) 14... Qxd4 { [%eval 5.91] [%clk 0:03:23] } 15. Qxc7?? { (5.91 → -7.71) Blunder. h3 was best. } { [%eval -7.71] [%clk 0:03:40] } (15. h3 Qe5 16. hxg4 Qxg3 17. fxg3 Rxf1+ 18. Kxf1 hxg4 19. Ke2 Kd7 20. Be3 Rh8 21. Rf1 f6) 15... Nxf2?! { (-7.71 → -5.54) Inaccuracy. Rxf2 was best. } { [%eval -5.54] [%clk 0:03:19] } (15... Rxf2) 16. Bg5?? { (-5.54 → Mate in 3) Checkmate is now unavoidable. Be3 was best. } { [%eval #-3] [%clk 0:03:05] } (16. Be3) 16... Nh3+ { [%eval #-2] [%clk 0:03:15] } 17. Kh1 { [%eval #-2] [%clk 0:03:03] } 17... Qg1+ { [%eval #-1] [%clk 0:03:13] } 18. Rxg1 { [%eval #-1] [%clk 0:03:01] } 18... Nf2# { [%clk 0:03:12] } { Black wins by checkmate. } 0-1','WYHN - studylines 2021'],
	
	
	['1. e4 { [%eval 0.25] [%clk 0:05:00] } 1... e5 { [%eval 0.31] [%clk 0:05:00] } 2. Nf3 { [%eval 0.28] [%clk 0:04:59] } 2... Nc6 { [%eval 0.27] [%clk 0:04:59] } 3. Bb5 { [%eval 0.17] [%clk 0:04:58] } 3... Nf6 { [%eval 0.48] [%clk 0:04:56] } { C65 Ruy Lopez: Berlin Defense  } 4. d3 { [%eval 0.32] [%clk 0:04:56] } 4... a6 { [%eval 1.75] [%clk 0:04:47] } { (0.32 → 1.75) Mistake. Bc5 was best.  } 5. Bxc6 { [%eval 1.55] [%clk 0:04:55] } 5... dxc6 { [%eval 1.74] [%clk 0:04:46] } 6. 0-0 { [%eval 0.15] [%clk 0:04:55] } { (1.74 → 0.15) Blunder. Nxe5 was best.  } 6... Bc5 { [%eval 1.74] [%clk 0:04:38] } { (0.15 → 1.74) Blunder. Bd6 was best.  } 7. Nc3 { [%eval 0.39] [%clk 0:04:51] } { (1.74 → 0.39) Mistake. Nxe5 was best.  } 7... h6 { [%eval 1.38] [%clk 0:04:31] } { (0.39 → 1.38) Inaccuracy. Qd6 was best.  } 8. Nxe5 { [%eval 1.57] [%clk 0:04:46] } 8... Bg4 { [%eval 6.87] [%clk 0:04:25] } { (1.57 → 6.87) Blunder. Qe7 was best.  } 9. Qd2 { [%eval 2.06] [%clk 0:04:31] } { (6.87 → 2.06) Blunder. Nxg4 was best.  } 9... Bd4 { [%eval 3.22] [%clk 0:04:12] } { (2.06 → 3.22) Inaccuracy. Be6 was best.  } 10. Nxg4 { [%eval 2.94] [%clk 0:04:28] } 10... Nxg4 { [%eval 2.91] [%clk 0:04:09] } 11. Qf4 { [%eval 2.84] [%clk 0:04:20] } 11... h5 { [%eval 2.71] [%clk 0:03:52] } 12. Ne2 { [%eval 0.4] [%clk 0:04:16] } { (2.71 → 0.40) Blunder. h3 was best.  } 12... Rh6 { [%eval 4.98] [%clk 0:03:37] } { (0.40 → 4.98) Blunder. Be5 was best.  } 13. Nxd4 { [%eval 5.02] [%clk 0:04:00] } 13... Rf6 { [%eval 8.41] [%clk 0:03:31] } { (5.02 → 8.41) Inaccuracy. Qxd4 was best.  } 14. Qg3 { [%eval 5.98] [%clk 0:03:43] } { (8.41 → 5.98) Inaccuracy. Nf5 was best.  } 14... Qxd4 { [%eval 5.91] [%clk 0:03:23] } 15. Qxc7 { [%eval -7.71] [%clk 0:03:40] } { (5.91 → -7.71) Blunder. h3 was best.  } 15... Nxf2 { [%eval -5.54] [%clk 0:03:19] } { (-7.71 → -5.54) Inaccuracy. Rxf2 was best.  } 16. Bg5 { [%eval #-3] [%clk 0:03:05] } { (-5.54 → Mate in 3) Checkmate is now unavoidable. Be3 was best.  } 16... Nh3+ { [%eval #-2] [%clk 0:03:15] } 17. Kh1 { [%eval #-2] [%clk 0:03:03] } 17... Qg1+ { [%eval #-1] [%clk 0:03:13] } 18. Rfxg1 { [%eval #-1] [%clk 0:03:01] } 18... Nf2# { [%clk 0:03:12] } { Black wins by checkmate.  } 0-1','test'],
	
	
	['1. e4 c5 2. Nc3 d6 3. Nf3 a6 4. d4 cxd4 5. Nxd4 Nf6 6. Be3 e5 7. Nb3 Be7 8. f3 Be6 9. Qd2 h5 10. Be2 Nbd7 11. Nd5 Bxd5 12. exd5 Qc7 13. c4 a5 14. Rd1 O-O 15. O-O a4 16. Na1 Nb6 17. Rc1 h4 18. Rc3 Bd8 19. Nc2 Nc8 20. Bd3 Qd7 21. Na3 Ba5 22. Bg5 Bxc3 23. bxc3 Nh5 24. Qe1 f5 25. Qxh4 Nf6 26. Qh3 e4 27. fxe4 fxe4 28. Qxd7 Nxd7 29. Be2 Rxf1+ 30. Kxf1 Ne5 31. Kf2 Nf7 32. Be3 Ne7 33. Bb6 Rf8 34. Nb5 Nf5 35. Ke1 g5 36. Kd2 Kg7 37. g4 Nh4 38. Bd4+ Kg8 39. Ke3 Ng2+ 40. Kxe4 Re8+ 41. Kf3 Nf4 42. Bd1 Nd3 43. Bxa4 Ne1+ 44. Kf2 Nd3+ 45. Kf3 Ne1+ 46. Kf2 Nd3+ 47. Kf3','Stockfish 13+ NNUE Depth 30'],
	
	["1. e4 { [%eval 0.25] } 1... e5 { [%eval 0.31] } 2. Bc4 { [%eval 0.0] } 2... Nf6 { [%eval 0.01] } { C24 Bishop's Opening: Berlin Defense } 3. d3 { [%eval 0.0] } 3... d5?! { (0.00 → 0.82) Inaccuracy. c6 was best. } { [%eval 0.82] } (3... c6 4. Bb3 a5 5. c3 d5 6. Nf3 Bd6 7. exd5 cxd5 8. O-O) 4. Bb3?? { (0.82 → -1.50) Blunder. exd5 was best. } { [%eval -1.5] } (4. exd5 Nxd5 5. Nf3 Nc6 6. O-O Nb6 7. Bb5 Bd6 8. Nxe5 Bxe5) 4... d4?? { (-1.50 → 0.31) Blunder. dxe4 was best. } { [%eval 0.31] } (4... dxe4 5. Nc3 Bb4 6. Ne2 exd3 7. Qxd3 Qxd3 8. cxd3 Nc6 9. Be3) 5. h3 { [%eval 0.16] } 5... Bb4+ { [%eval 0.5] } 6. Bd2 { [%eval 0.28] } 6... Bxd2+ { [%eval 0.32] } 7. Qxd2 { [%eval 0.08] } 7... c5?! { (0.08 → 1.06) Inaccuracy. Nh5 was best. } { [%eval 1.06] } (7... Nh5 8. Ne2 O-O 9. g4 Nf6 10. O-O a5 11. f4 a4 12. Bc4 exf4 13. Qxf4 Nc6 14. Nd2) 8. a3? { (1.06 → -0.40) Mistake. Qg5 was best. } { [%eval -0.4] } (8. Qg5) 8... Nc6 { [%eval -0.28] } 9. c3 { [%eval -0.7] } 9... Na5 { [%eval -0.41] } 10. Ba2 { [%eval -0.2] } 10... O-O { [%eval -0.51] } 11. Nf3 { [%eval -0.29] } 11... Qd6?? { (-0.29 → 1.95) Blunder. Nc6 was best. } { [%eval 1.95] } (11... Nc6 12. cxd4) 12. Qg5?? { (1.95 → -0.84) Blunder. cxd4 was best. } { [%eval -0.84] } (12. cxd4) 12... Re8 { [%eval -0.55] } 13. Nh4? { (-0.55 → -1.64) Mistake. cxd4 was best. } { [%eval -1.64] } (13. cxd4) 13... h6 { [%eval -1.51] } 14. Qg3 { [%eval -2.04] } 14... Nh5 { [%eval -1.89] } 15. Qf3 { [%eval -2.16] } 15... Nf4 { [%eval -1.92] } 16. O-O { [%eval -2.38] } 16... Be6?! { (-2.38 → -1.26) Inaccuracy. Rd8 was best. } { [%eval -1.26] } (16... Rd8) 17. Bxe6? { (-1.26 → -2.55) Mistake. cxd4 was best. } { [%eval -2.55] } (17. cxd4 Qxd4 18. Nc3 g6 19. Ne2 Qxd3 20. Nxf4 Qxf3 21. Nxf3 exf4 22. Bxe6 Rxe6 23. Rac1 b6) 17... Rxe6?! { (-2.55 → -1.58) Inaccuracy. Qxe6 was best. } { [%eval -1.58] } (17... Qxe6) 18. Nf5 { [%eval -1.74] } 18... Qd7?! { (-1.74 → -1.00) Inaccuracy. Qc7 was best. } { [%eval -1.0] } (18... Qc7 19. cxd4) 19. cxd4 { [%eval -0.93] } 19... cxd4 { [%eval -0.78] } 20. Nd2 { [%eval -0.44] } 20... Rg6 { [%eval -0.62] } 21. Nh4?! { (-0.62 → -1.38) Inaccuracy. g3 was best. } { [%eval -1.38] } (21. g3) 21... Rg5 { [%eval -1.87] } 22. g3?? { (-1.87 → -6.22) Blunder. Rfc1 was best. } { [%eval -6.22] } (22. Rfc1 Nc6) 22... Qxh3 { [%eval -6.32] } 23. Qh1?? { (-6.32 → Mate in 1) Checkmate is now unavoidable. Ng2 was best. } { [%eval #-1] } (23. Ng2 Rh5 24. Nh4 Nb3 25. Qxh5 Nxh5 26. Nxb3 Nf4 27. gxf4 Qxh4 28. fxe5 Rd8 29. Nxd4 Qg5+) 23... Ne2# { Black wins by checkmate. } 0-1",'festis-studylines 2021-03-06'],
	
	['1. e4 { [%eval 0.25] [%clk 0:05:00] } 1... e5 { [%eval 0.31] [%clk 0:05:00] } 2. Nf3 { [%eval 0.28] [%clk 0:04:59] } 2... Nf6 { [%eval 0.48] [%clk 0:04:58] } 3. Nxe5 { [%eval 0.43] [%clk 0:04:54] } 3... Nc6?? { (0.43 → 2.25) Blunder. d6 was best. } { [%eval 2.25] [%clk 0:04:57] } (3... d6 4. Nf3 Nxe4 5. Bd3 Nc5 6. Be2 Be7 7. c4 O-O 8. Nc3) 4. Nxc6 { [%eval 1.61] [%clk 0:04:52] } 4... dxc6 { [%eval 1.84] [%clk 0:04:57] } { C42 Russian Game: Stafford Gambit } 5. e5?! { (1.84 → 0.95) Inaccuracy. Nc3 was best. } { [%eval 0.95] [%clk 0:04:50] } (5. Nc3 Bc5 6. Qe2 Be6 7. d3 Qe7 8. g3 O-O-O 9. Bg2 a6) 5... Ng4?! { (0.95 → 1.73) Inaccuracy. Nd5 was best. } { [%eval 1.73] [%clk 0:04:53] } (5... Nd5 6. d4 Bf5 7. c3 Qd7 8. Bd3 c5 9. Bxf5 Qxf5 10. Qa4+) 6. d4 { [%eval 1.8] [%clk 0:04:43] } 6... c5? { (1.80 → 3.35) Mistake. Be6 was best. } { [%eval 3.35] [%clk 0:04:49] } (6... Be6 7. Nc3 Qd7 8. f3 Nh6 9. Bxh6 gxh6 10. Qd3 O-O-O 11. O-O-O) 7. Be2?? { (3.35 → 0.31) Blunder. h3 was best. } { [%eval 0.31] [%clk 0:04:26] } (7. h3 Nh6 8. d5 Qe7 9. Bb5+ Bd7 10. Bxd7+ Qxd7 11. c4 Nf5) 7... Qh4?? { (0.31 → 3.44) Blunder. Qxd4 was best. } { [%eval 3.44] [%clk 0:04:37] } (7... Qxd4 8. Qxd4 cxd4 9. Bf4 Bf5 10. Nd2 f6 11. exf6 gxf6 12. O-O) 8. g3 { [%eval 3.52] [%clk 0:03:44] } 8... Qh3 { [%eval 3.61] [%clk 0:04:30] } 9. Bf1 { [%eval 3.25] [%clk 0:03:36] } 9... Qh5 { [%eval 3.45] [%clk 0:04:22] } 10. h3 { [%eval 3.58] [%clk 0:03:30] } 10... cxd4 { [%eval 3.16] [%clk 0:03:58] } 11. Be2 { [%eval 3.31] [%clk 0:03:27] } 11... Qxe5 { [%eval 3.5] [%clk 0:03:36] } 12. hxg4 { [%eval 3.63] [%clk 0:03:16] } 12... Bb4+?! { (3.63 → 5.16) Inaccuracy. Bxg4 was best. } { [%eval 5.16] [%clk 0:03:28] } (12... Bxg4 13. Kf1) 13. Bd2 { [%eval 4.5] [%clk 0:03:05] } 13... Bxd2+ { [%eval 4.38] [%clk 0:03:22] } 14. Nxd2 { [%eval 4.6] [%clk 0:02:40] } 14... Qd5?! { (4.60 → 5.97) Inaccuracy. Bxg4 was best. } { [%eval 5.97] [%clk 0:03:10] } (14... Bxg4 15. Kf1) 15. Bf3 { [%eval 5.83] [%clk 0:02:24] } 15... Qe5+ { [%eval 5.94] [%clk 0:03:00] } 16. Qe2 { [%eval 5.86] [%clk 0:02:18] } 16... Qxe2+ { [%eval 5.6] [%clk 0:02:56] } 17. Bxe2 { [%eval 5.48] [%clk 0:02:16] } 17... Be6 { [%eval 5.89] [%clk 0:02:51] } 18. O-O-O { [%eval 5.87] [%clk 0:02:11] } 18... O-O { [%eval 6.32] [%clk 0:02:40] } 19. Bd3 { [%eval 6.21] [%clk 0:02:03] } 19... g6 { [%eval 6.17] [%clk 0:02:36] } 20. f3 { [%eval 6.12] [%clk 0:01:55] } 20... Rae8 { [%eval 6.87] [%clk 0:02:32] } 21. Nb3 { [%eval 5.64] [%clk 0:01:51] } 21... Bd5 { [%eval 5.52] [%clk 0:02:28] } 22. Rh2?? { (5.52 → 2.18) Blunder. Nxd4 was best. } { [%eval 2.18] [%clk 0:01:36] } (22. Nxd4 c5) 22... Bxf3 { [%eval 2.0] [%clk 0:02:23] } 23. Rf1 { [%eval 1.94] [%clk 0:01:23] } 23... Bxg4 { [%eval 1.87] [%clk 0:02:19] } 24. Nxd4 { [%eval 2.21] [%clk 0:01:17] } 24... Re3 { [%eval 2.12] [%clk 0:02:01] } 25. Rg1 { [%eval 1.87] [%clk 0:00:52] } 25... Rfe8 { [%eval 2.34] [%clk 0:01:44] } 26. b3 { [%eval 1.97] [%clk 0:00:48] } 26... Re1+ { [%eval 2.52] [%clk 0:01:37] } 27. Rxe1 { [%eval 2.58] [%clk 0:00:46] } 27... Rxe1+ { [%eval 2.64] [%clk 0:01:36] } 28. Kd2 { [%eval 2.31] [%clk 0:00:44] } 28... Rg1 { [%eval 2.76] [%clk 0:01:32] } 29. Ne2 { [%eval 2.32] [%clk 0:00:37] } 29... Ra1 { [%eval 2.63] [%clk 0:01:25] } 30. a4 { [%eval 2.47] [%clk 0:00:36] } 30... Ra2? { (2.47 → 4.71) Mistake. Kg7 was best. } { [%eval 4.71] [%clk 0:01:18] } (30... Kg7) 31. Bc4 { [%eval 4.38] [%clk 0:00:33] } 31... Bf5 { [%eval 5.52] [%clk 0:01:13] } 32. Nd4 { [%eval 5.62] [%clk 0:00:29] } 32... c5?! { (5.62 → 7.82) Inaccuracy. Bd7 was best. } { [%eval 7.82] [%clk 0:01:04] } (32... Bd7) 33. Nxf5 { [%eval 7.41] [%clk 0:00:26] } 33... gxf5 { [%eval 7.71] [%clk 0:01:04] } 34. Rf2 { [%eval 7.85] [%clk 0:00:24] } 34... Kg7 { [%eval 8.2] [%clk 0:00:56] } 35. Rxf5 { [%eval 8.08] [%clk 0:00:23] } 35... f6 { [%eval 8.1] [%clk 0:00:53] } 36. Rxc5 { [%eval 8.46] [%clk 0:00:22] } 36... Ra1 { [%eval 8.63] [%clk 0:00:51] } 37. Rc7+ { [%eval 8.66] [%clk 0:00:21] } 37... Kg6 { [%eval 8.91] [%clk 0:00:49] } 38. Rxb7 { [%eval 8.78] [%clk 0:00:20] } 38... h5 { [%eval 8.88] [%clk 0:00:47] } 39. Rxa7 { [%eval 9.31] [%clk 0:00:18] } 39... Kg5 { [%eval 9.95] [%clk 0:00:47] } 40. Ra5+ { [%eval 9.31] [%clk 0:00:16] } 40... Kg4 { [%eval 10.18] [%clk 0:00:45] } 41. Be6+ { [%eval 9.37] [%clk 0:00:15] } 41... Kxg3 { [%eval 9.51] [%clk 0:00:41] } 42. Rxh5 { [%eval 9.71] [%clk 0:00:13] } 42... Rf1 { [%eval 10.17] [%clk 0:00:37] } 43. Rg5+?? { (10.17 → 0.00) Blunder. c4 was best. } { [%eval 0.0] [%clk 0:00:11] } (43. c4 f5 44. c5 f4 45. Rh3+ Kg2 46. c6 Rf2+ 47. Kd3 Rf1 48. c7 Rc1 49. c8=Q Rxc8) 43... Kf4?? { (0.00 → Mate in 12) Checkmate is now unavoidable. fxg5 was best. } { [%eval #12] [%clk 0:00:35] } (43... fxg5 44. b4 Kf4 45. a5 Ke5 46. Bc8 g4 47. Bxg4 Rf4 48. Be2 Rxb4 49. Kc3 Rb1 50. Kc4) 44. Rg8? { (Mate in 12 → 8.21) Lost forced checkmate sequence. Rf5+ was best. } { [%eval 8.21] [%clk 0:00:08] } (44. Rf5+ Ke4 45. Rxf1 Ke5 46. Bh3 Kd6 47. Rxf6+ Kd5 48. a5 Ke5 49. Rf7 Kd6 50. a6 Kd5) 44... Ke5 { [%eval 8.15] [%clk 0:00:34] } 45. Bc4 { [%eval 8.56] [%clk 0:00:07] } 45... f5? { (8.56 → Mate in 12) Checkmate is now unavoidable. Ra1 was best. } { [%eval #12] [%clk 0:00:33] } (45... Ra1 46. Ra8) 46. Rf8? { (Mate in 12 → 8.72) Lost forced checkmate sequence. Bxf1 was best. } { [%eval 8.72] [%clk 0:00:06] } (46. Bxf1 Kf6 47. Rf8+ Kg5 48. Bd3 f4 49. a5 f3 50. Rxf3 Kh4 51. Rf5 Kg3 52. a6 Kg2) 46... f4? { (8.72 → Mate in 10) Checkmate is now unavoidable. Ra1 was best. } { [%eval #10] [%clk 0:00:32] } (46... Ra1 47. Kc3) 47. a5? { (Mate in 10 → 9.27) Lost forced checkmate sequence. Bxf1 was best. } { [%eval 9.27] [%clk 0:00:04] } (47. Bxf1 Kd4 48. a5 Kc5 49. Rxf4 Kc6 50. a6 Kb6 51. Rf7 Kc6 52. a7 Kb6 53. a8=Q Kc5) 47... f3? { (9.27 → Mate in 9) Checkmate is now unavoidable. Ra1 was best. } { [%eval #9] [%clk 0:00:31] } (47... Ra1 48. b4) 48. a6?! { (Mate in 9 → 10.77) Lost forced checkmate sequence. Bxf1 was best. } { [%eval 10.77] [%clk 0:00:04] } (48. Bxf1 Ke6 49. Rxf3 Kd5 50. a6 Ke4 51. Rf7 Ke5 52. a7 Ke6 53. Bc4+ Kd6 54. a8=Q Kc5) 48... f2?! { (10.77 → Mate in 6) Checkmate is now unavoidable. Ra1 was best. } { [%eval #6] [%clk 0:00:29] } (48... Ra1 49. Ke3) 49. a7?! { (Mate in 6 → 72.85) Lost forced checkmate sequence. Bxf1 was best. } { [%eval 72.85] [%clk 0:00:03] } (49. Bxf1 Ke6 50. a7 Ke5 51. a8=Q Kd6 52. Qa5 Kc6 53. Rd8 Kb7 54. Bg2#) 49... Kd6?! { (72.85 → Mate in 5) Checkmate is now unavoidable. Ra1 was best. } { [%eval #5] [%clk 0:00:25] } (49... Ra1 50. a8=Q) 50. a8=Q { [%eval #5] [%clk 0:00:01] } 50... Kc5 { [%eval #3] [%clk 0:00:25] } 51. Qa5+ { [%eval #2] [%clk 0:00:01] } 51... Kd4 { [%eval #1] [%clk 0:00:24] } { Black wins on time. } 0-1', 'studylines-okta39 2021-03-08'],
	
	["1. d4 { [%eval 0.0] [%clk 0:05:00] } 1... d5 { [%eval 0.22] [%clk 0:05:00] } 2. e3 { [%eval 0.05] [%clk 0:04:58] } { D00 Queen's Pawn Game } 2... Bf5 { [%eval 0.13] [%clk 0:04:49] } 3. c3 { [%eval -0.2] [%clk 0:04:55] } 3... e6 { [%eval -0.17] [%clk 0:04:43] } 4. Bd3 { [%eval -0.6] [%clk 0:04:53] } 4... Bg6?! { (-0.60 → 0.13) Inaccuracy. Bxd3 was best. } { [%eval 0.13] [%clk 0:04:32] } (4... Bxd3 5. Qxd3 Qg5 6. g3 Nc6 7. Nf3 Qg6 8. Qxg6 hxg6 9. b4) 5. Bxg6 { [%eval -0.16] [%clk 0:04:51] } 5... hxg6 { [%eval 0.0] [%clk 0:04:31] } 6. h3 { [%eval -0.15] [%clk 0:04:47] } 6... f5 { [%eval 0.2] [%clk 0:04:29] } 7. Nf3 { [%eval -0.02] [%clk 0:04:43] } 7... Nc6 { [%eval -0.06] [%clk 0:04:22] } 8. Ne5? { (-0.06 → -1.26) Mistake. Qb3 was best. } { [%eval -1.26] [%clk 0:04:37] } (8. Qb3 a6) 8... Nxe5 { [%eval -1.2] [%clk 0:04:20] } 9. dxe5 { [%eval -1.06] [%clk 0:04:35] } 9... g5 { [%eval -1.2] [%clk 0:04:11] } 10. g3?! { (-1.20 → -1.87) Inaccuracy. Qb3 was best. } { [%eval -1.87] [%clk 0:04:25] } (10. Qb3 Ne7) 10... Ne7 { [%eval -1.76] [%clk 0:04:05] } 11. f4 { [%eval -1.61] [%clk 0:04:19] } 11... g4 { [%eval -1.46] [%clk 0:03:59] } 12. h4? { (-1.46 → -2.66) Mistake. Qe2 was best. } { [%eval -2.66] [%clk 0:04:17] } (12. Qe2 Qd7) 12... Qd7 { [%eval -2.1] [%clk 0:03:18] } 13. Na3 { [%eval -2.59] [%clk 0:04:06] } 13... Nc6 { [%eval -2.64] [%clk 0:03:10] } 14. Nc2 { [%eval -2.52] [%clk 0:03:57] } 14... g5 { [%eval -2.56] [%clk 0:03:02] } 15. Nd4?! { (-2.56 → -3.38) Inaccuracy. e4 was best. } { [%eval -3.38] [%clk 0:03:49] } (15. e4 O-O-O) 15... gxh4 { [%eval -3.53] [%clk 0:02:48] } 16. gxh4 { [%eval -3.35] [%clk 0:03:35] } 16... O-O-O { [%eval -3.12] [%clk 0:02:38] } 17. Bd2 { [%eval -3.63] [%clk 0:03:31] } 17... Be7 { [%eval -3.3] [%clk 0:02:32] } 18. h5 { [%eval -3.84] [%clk 0:03:22] } 18... Rh6?! { (-3.84 → -2.96) Inaccuracy. Nxd4 was best. } { [%eval -2.96] [%clk 0:02:30] } (18... Nxd4) 19. Qc2?! { (-2.96 → -4.43) Inaccuracy. Qa4 was best. } { [%eval -4.43] [%clk 0:03:13] } (19. Qa4 Nxd4) 19... Rdh8 { [%eval -3.72] [%clk 0:02:26] } 20. O-O-O { [%eval -4.2] [%clk 0:03:09] } 20... Rxh5 { [%eval -4.05] [%clk 0:02:24] } 21. Rxh5 { [%eval -4.06] [%clk 0:03:02] } 21... Rxh5 { [%eval -4.12] [%clk 0:02:23] } 22. Ne2 { [%eval -4.57] [%clk 0:02:54] } 22... Rh2 { [%eval -4.07] [%clk 0:02:02] } 23. Ng3?! { (-4.07 → -5.54) Inaccuracy. Qd3 was best. } { [%eval -5.54] [%clk 0:02:52] } (23. Qd3 Na5 24. b3 Qe8 25. Be1 Kb8 26. Kb1 a6 27. Nd4 Bc5 28. Nc2 Bb6 29. Rd2 Rh3) 23... Bh4 { [%eval -4.83] [%clk 0:01:52] } 24. Rg1?! { (-4.83 → -7.59) Inaccuracy. Nf1 was best. } { [%eval -7.59] [%clk 0:02:49] } (24. Nf1) 24... Bxg3 { [%eval -6.88] [%clk 0:01:47] } 25. Qd1 { [%eval -10.17] [%clk 0:02:33] } 25... Rh3 { [%eval -8.18] [%clk 0:01:25] } 26. Rh1 { [%eval -8.7] [%clk 0:02:30] } 26... Qh7 { [%eval -10.1] [%clk 0:01:20] } 27. Rxh3 { [%eval -11.8] [%clk 0:02:15] } 27... Qxh3 { [%eval -10.26] [%clk 0:01:06] } 28. b4 { [%eval -10.4] [%clk 0:02:07] } 28... Bf2 { [%eval -10.86] [%clk 0:01:00] } 29. Be1 { [%eval -12.1] [%clk 0:02:01] } 29... Qxe3+ { [%eval -12.83] [%clk 0:00:54] } 30. Bd2 { [%eval -12.01] [%clk 0:01:59] } 30... Qd3 { [%eval -12.18] [%clk 0:00:47] } 31. Qh1 { [%eval -12.81] [%clk 0:01:47] } 31... Qh3 { [%eval -12.35] [%clk 0:00:40] } 32. Qxh3 { [%eval -14.37] [%clk 0:01:36] } 32... gxh3 { [%eval -13.98] [%clk 0:00:38] } { White resigns. } 0-1",'mhdzo-studylines 2021-03-09']

];
const constFens = [
	['R2Rn1n1/7n/1R2R3/7n/1R2R3/Q1Q5/7n/Q5n1 w KQkq - 0 1','Unambiguation test'],
	['4nr2/5PPP/2K5/8/8/5k2/8/8 w KQkq - 0 1','Promotion test'],
	['1R6/6pk/6np/p6Q/P2p4/3P4/K1P5/8 w KQkq - 0 1', 'White checkmates in two'],
	['2N5/8/8/3k4/K7/8/8/3B4 w KQkq - 0 1', 'KNB checkmate in 33'],
	['k7/1r6/2K5/7Q/8/8/8/8 w KQkq - 0 1', 'White to move (Su Xuan)'], // https://www.youtube.com/watch?v=7OGAiz5p_L4
	['5rk1/1b3ppp/8/2RN4/8/8/2Q2PPP/6K1 w KQkq - 0 1', 'Anastasias mate w in 3'],
	['r1k4r/ppp1bq1p/2n1N3/6B1/3p2Q1/8/PPP2PPP/R5K1 w KQkq - 0 1','Smothered mate w in 6'],
	['2r2rk1/5ppp/pp6/2q5/2P2P2/3pP1RP/P5P1/B1R3K1 w KQkq - 0 1','Morphys mate w in 6'],
	['8/8/1p6/1K6/8/pk2N3/3Q4/n7 w KQkq - 0 1','w mates in two'],
	['6n1/3p4/3P1k2/7R/7K/8/8/8 w KQkq - 0 1','White wins (Rh8-Zugzwang)'],
	['3b3k/4n3/8/8/7B/8/8/5KR1 w KQkq - 0 1','White wins'],
	['3q4/p1p5/2p3k1/2b2pP1/P1N4K/6PP/1QP2r2/2BR4 b - - 0 1','B mates in 4'],
	['k7/2q5/3p2N1/N5P1/2B5/8/2K5/8 w KQkq - 0 1','w draws (Ne7-d5-Nc6)'],
	['6q1/3p4/4pp2/2P2k2/7K/3PP3/2R5/1B6 w KQkq - 0 1','w wins']
];

// evaluation
var track = [];
const material = { 'P':1, 'N':3, 'B':3, 'R':5, 'Q':9, 'K':0 };
const squareValues1 = [
	[ 1, 1, 1, 1, 1, 1, 1, 1 ],
	[ 1, 3, 3, 3, 3, 3, 3, 1 ],
	[ 1, 3, 6, 6, 6, 6, 3, 1 ],
	[ 1, 3, 6,12,12, 6, 3, 1 ],
	[ 1, 3, 6,12,12, 6, 3, 1 ],
	[ 1, 3, 6, 6, 6, 6, 3, 1 ],
	[ 1, 3, 3, 3, 3, 3, 3, 1 ],
	[ 1, 1, 1, 1, 1, 1, 1, 1 ]
];
const squareValues = [
	[ 1, 1, 1, 1, 1, 1, 1, 1 ],
	[ 1, 2, 2, 2, 2, 2, 2, 1 ],
	[ 1, 2, 3, 3, 3, 3, 2, 1 ],
	[ 1, 2, 3, 4, 4, 3, 2, 1 ],
	[ 1, 2, 3, 4, 4, 3, 2, 1 ],
	[ 1, 2, 3, 3, 3, 3, 2, 1 ],
	[ 1, 2, 2, 2, 2, 2, 2, 1 ],
	[ 1, 1, 1, 1, 1, 1, 1, 1 ]
];

// rules
var allMoves = {
    'P': [ ],
    'R': [ [[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0]],
        [[-1,0],[-2,0],[-3,0],[-4,0],[-5,0],[-6,0],[-7,0]],
        [[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[0,7]],
        [[0,-1],[0,-2],[0,-3],[0,-4],[0,-5],[0,-6],[0,-7]] ],
    'N': [ [[1,2]], [[-1,2]], [[1,-2]], [[-1,-2]], [[2,1]], [[-2,1]], [[2,-1]], [[-2,-1]] ],
    'B': [ [[1,1],[2,2],[3,3],[4,4],[5,5],[6,6],[7,7]],
        [[-1,1],[-2,2],[-3,3],[-4,4],[-5,5],[-6,6],[-7,7]],
        [[1,-1],[2,-2],[3,-3],[4,-4],[5,-5],[6,-6],[7,-7]],
        [[-1,-1],[-2,-2],[-3,-3],[-4,-4],[-5,-5],[-6,-6],[-7,-7]] ],
    'Q': [ [[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0]],
        [[-1,0],[-2,0],[-3,0],[-4,0],[-5,0],[-6,0],[-7,0]],
        [[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[0,7]],
        [[0,-1],[0,-2],[0,-3],[0,-4],[0,-5],[0,-6],[0,-7]],
        [[1,1],[2,2],[3,3],[4,4],[5,5],[6,6],[7,7]],
        [[-1,1],[-2,2],[-3,3],[-4,4],[-5,5],[-6,6],[-7,7]],
        [[1,-1],[2,-2],[3,-3],[4,-4],[5,-5],[6,-6],[7,-7]],
        [[-1,-1],[-2,-2],[-3,-3],[-4,-4],[-5,-5],[-6,-6],[-7,-7]] ],
    'K': [ [[1,0]], [[1,1]], [[0,1]], [[-1,1]], [[-1,0]], [[-1,-1]], [[0,-1]], [[1,-1]] ]
}
