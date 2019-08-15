const DEMO = false;

const LEFT = 1, RIGHT = 2, FORWARD = 3, BACKWARD = 4, BAG = 5, DOOR = 6, FAR = 7, CLOSE = 8;

const ASSETS = {
	ARROW_SIDE:'assets/arrow-side.png',
	ARROW_FORWARD:'assets/arrow-forward.png',
	ARROW_BACKWARD:'assets/arrow-backward.png',
	JAIL:'assets/jail.png',
	JAIL360:'assets/jail-360.png',
	WRITING:'assets/writing.png',
	PHOTO:'assets/photo.png',
	TILE:'assets/tile.png',
	BOTTLE:'assets/bottle.png',
	BOTTLE_SHARDS:'assets/bottle-shards.png',
	DUNGEON_MOVE:'assets/dungeon-move.png',
	FAR_SIDE:'assets/far-side.png',
	FAR_SIDE_CORNER:'assets/far-side-corner.png',
	FAR_WALL:'assets/far-wall.png',
	FAR_DOOR:'assets/far-door.png',
	CLOSE_SIDE:'assets/close-side.png',
	CLOSE_SIDE_CORNER:'assets/close-side-corner.png',
	CLOSE_WALL:'assets/close-wall.png',
	DOOR_OPEN:'assets/door-open.png',
	CLOSE_DOOR:'assets/close-door.png',
	BAG_OUT:'assets/bag-out.png',
	LAMP:'assets/light.png',
	LOCK:'assets/lock.png',
	EXIT_DOOR:'assets/exit-door.png',
	CAGE: 'assets/cage.png',
	DIMMING_LIGHT: 'assets/dimming-light.png',
	RIGHT_GUARD: 'assets/right-guard.png',
	LEFT_GUARD: 'assets/left-guard.png',
	ALPHABET:'assets/alphabet.png|invert-colors',
	GRAB_PHOTO:'assets/grab-photo.png',
	GRAB_PHOTO_SHOT:'assets/grab-photo-shot.png',
	ZOOM_GUARDS: 'assets/zoom-guards.png',
	GRAB_BOTTLE:'assets/grab-bottle.png',
	BIRTHDAY: 'assets/birthday.png',
	SPEECH_OUT: 'assets/speech-out.png',
	BRING_CAKE: 'assets/bring-cake.png',
	POOR_HITMAN: 'assets/poor-hitman.png',
	POOR_HITMAN_BACK: 'assets/poor-hitman-back.png',
	POOR_HITMAN_GUARD: 'assets/poor-hitman-guard.png',
	GUARDS_LAUGHING: 'assets/guards-laughing.png',
	HITMAN_LAUGH: 'assets/hitman-laugh.png',
	HITMAN_CAKE_FACE: 'assets/hitman-cake-face.png',
	GUARDS_ATTACK: 'assets/guards-attack.png',
	CAKE_TRASH: 'assets/cake-trash.png',
	CAKE_PIECE: 'assets/cake-piece.png',
	CAKE_FORK: 'assets/cake-fork.png',
	LIGHTER: 'assets/lighter.png',
	GRAB_CAKE:'assets/grab-cake.png',
	GRAB_FORK:'assets/grab-fork.png',
	GRAB_LIGHTER:'assets/grab-lighter.png',
	TILE_HOLE:'assets/tile-hole.png',
	GUN: 'assets/gun.png',
	SHOOTS: 'assets/shoots.png',
	GRAB_GUN: 'assets/grab-gun.png',
	HOLD_GUN: 'assets/hold-gun.png',
	ZOOM_GUARD_ALERT: 'assets/zoom-guard-alert.png',
	SHOOTS: "assets/shoots.png",
	EATER: "assets/eater.png",
	ALIEN_EATER: "assets/alien-eater.png",
	CAKE_BOOM: "assets/cake-boom.png",
	MAZE_ROTATION_BACKGROUND: "assets/maze-rotation-background.png",
	MAZE_ROTATION_WALLS: "assets/maze-rotation-walls.png",
	MAZE_ROTATION_CORNER: "assets/maze-rotation-corner.png",
};

const SOUNDS = {
	HELLO:'sounds/hello.mp3',
	HAHAHA:'sounds/hahaha.mp3',
	BIRTHDAY:'sounds/birthday.mp3',
	HEY:'sounds/hey.mp3',
	GUN_SHOT:'sounds/gun-shot.mp3',
	DUD:'sounds/dud.mp3',
	ALIEN:'sounds/alien.mp3',
};

const ALPHAS = (() => {
	const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz.,?'#@!♪ ";
	const array = [];
	for(let c = 0; c < letters.length; c++) {
		array[letters.charCodeAt(c)] = { index: c };
	}
	array[" ".charCodeAt(0)].width = 1;
	return array;
})();

const ORIENTATIONS = ['N','NW','W','SW','S','SE','E','NE'];
const ARROWS = [
	null, 
	{ src:ASSETS.ARROW_SIDE, side:LEFT },
	{ src:ASSETS.ARROW_SIDE, side:RIGHT},
	{ src:ASSETS.ARROW_FORWARD},
	{ src:ASSETS.ARROW_BACKWARD},
];
