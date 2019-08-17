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
	GRAB_WATER_BOTTLE:'assets/grab-water-bottle.png',
	BOTTLE_SHARDS:'assets/bottle-shards.png',
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
	MAZE_ROTATION_BACKGROUND: "assets/maze-rotation-background.png|darken|rotate-colors",
	MAZE_ROTATION_WALLS: "assets/maze-rotation-walls.png|darken|rotate-colors",
	MAZE_ROTATION_CORNER: "assets/maze-rotation-corner.png|darken|rotate-colors",
	DUNGEON_MOVE:'assets/dungeon-move.png|darken|rotate-colors',
	FAR_SIDE:'assets/far-side.png|darken|rotate-colors',
	FAR_SIDE_CORNER:'assets/far-side-corner.png|darken|rotate-colors',
	FAR_WALL:'assets/far-wall.png|darken|rotate-colors',
	FAR_DOOR:'assets/far-door.png|darken|rotate-colors',
	CLOSE_SIDE:'assets/close-side.png|darken|rotate-colors',
	CLOSE_SIDE_CORNER:'assets/close-side-corner.png|darken|rotate-colors',
	CLOSE_WALL:'assets/close-wall.png|darken|rotate-colors',
	DOOR_OPEN:'assets/door-open.png|darken|rotate-colors',
	CLOSE_DOOR:'assets/close-door.png|darken|rotate-colors',

	MAZE_ROTATION_BACKGROUND_2: "assets/maze-rotation-background.png|darken",
	MAZE_ROTATION_WALLS_2: "assets/maze-rotation-walls.png|darken",
	MAZE_ROTATION_CORNER_2: "assets/maze-rotation-corner.png|darken",
	DUNGEON_MOVE_2:'assets/dungeon-move.png|darken',
	FAR_SIDE_2:'assets/far-side.png|darken',
	FAR_SIDE_CORNER_2:'assets/far-side-corner.png|darken',
	FAR_WALL_2:'assets/far-wall.png|darken',
	FAR_DOOR_2:'assets/far-door.png|darken',
	CLOSE_SIDE_2:'assets/close-side.png|darken',
	CLOSE_SIDE_CORNER_2:'assets/close-side-corner.png|darken',
	CLOSE_WALL_2:'assets/close-wall.png|darken',
	DOOR_OPEN_2:'assets/door-open.png|darken',
	CLOSE_DOOR_2:'assets/close-door.png|darken',

	GUARD: "assets/guard.png",
	MONSTER: "assets/monster.png",
	PUNCH: "assets/punch.png",
	TOILETS: "assets/toilets.png",
	BATHROOM: "assets/bathroom-background.png",
	TOILET_MONSTER: "assets/toilet-monster.png",
	VENDING_MACHINE: "assets/vending-machine.png",
	MACHINE: "assets/machine.png",
	COIN_1: "assets/coin-1.png",
	COIN_2: "assets/coin-2.png",
	GRAB_COIN: "assets/grab-coin.png",
	VENDING_MACHINE_CLOSEUP: "assets/vending-machine-close.png",
	VENDING_MACHINE_GLASS: "assets/vending-machine-glass.png",
	VENDING_MACHINE_APPLE: "assets/vending-machine-apple.png",
	VENDING_MACHINE_BOTTLE: "assets/vending-machine-bottle.png",
	VENDING_MACHINE_COIN_SLOT: "assets/vending-machine-coin-slot.png",
	ARCADE: "assets/arcade.png",
	ZOOM_ARCADE: "assets/zoom-arcade.png",
	ARCADE_ROOM: "assets/arcade-room.png",
	LOCKER_ROOM: "assets/locker-room.png",
	LOCKER_DOOR: "assets/locker-door.png",
	LOCK_BACK: "assets/lock-back.png",
	LOCK_DIGIT: "assets/lock-digit.png",
	LOCK_BLOCK: "assets/lock-block.png",
};

const SOUNDS = {
	HELLO:'sounds/hello.mp3',
	HAHAHA:'sounds/hahaha.mp3',
	BIRTHDAY:'sounds/birthday.mp3',
	HEY:'sounds/hey.mp3',
	GUN_SHOT:'sounds/gun-shot.mp3',
	DUD:'sounds/dud.mp3',
	ALIEN:'sounds/alien.mp3',
	HIT:'sounds/hit.mp3',
	PLAYER_HURT:'sounds/player-hurt.mp3',
	HIT_LAND:'sounds/hit-land.mp3',
	PICKUP:'sounds/pickup.mp3',
	EAT: 'sounds/eat.mp3',
	DRINK: 'sounds/drink.mp3',
	JAIL_CELL_THEME: 'sounds/jail-cell-theme.mp3',
	CHIN_TOK_THEME: 'sounds/chintok.mp3',
	ERROR: 'sounds/error.mp3',
//	DARK_THEME: 'sounds/dark.mp3',
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
