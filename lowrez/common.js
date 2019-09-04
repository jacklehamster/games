const DEMO = false;

const LEFT = 1, RIGHT = 2, FORWARD = 3, BACKWARD = 4, BAG = 5, DOOR = 6, FAR = 7, CLOSE = 8, FURTHER = 9, MENU = 10, BLOCK = 11;

const MAZE_ASSETS = {
	MAZE_ROTATION_BACKGROUND: "assets/maze-rotation-background.png",
	MAZE_ROTATION_WALLS: "assets/maze-rotation-walls.png",
	MAZE_ROTATION_CORNER: "assets/maze-rotation-corner.png",
	DUNGEON_MOVE:'assets/dungeon-move.png',
	FAR_SIDE:'assets/far-side.png',
	FAR_SIDE_CORNER:'assets/far-side-corner.png',
	FAR_WALL:'assets/far-wall.png',
	FURTHER_WALL:'assets/further-wall.png',
	FAR_DOOR:'assets/far-door.png',
	CLOSE_SIDE:'assets/close-side.png',
	CLOSE_SIDE_CORNER:'assets/close-side-corner.png',
	FAR_FAR_SIDE:'assets/side-far-far.png',
	CLOSE_WALL:'assets/close-wall.png',
	DOOR_OPEN:'assets/door-open.png',
	CLOSE_DOOR:'assets/close-door.png',
	FURTHER_SIDE:'assets/further-side.png',
	CLOSE_FURTHER_SIDE:'assets/close-further-side.png',

	DUNGEON_MOVE_SOLID:'assets/dungeon-move-solid.png',
	FAR_WALL_SOLID:'assets/far-wall-solid.png',
	CLOSE_WALL_SOLID:'assets/close-wall-solid.png',
	MAZE_ROTATION_BACKGROUND_SOLID: "assets/maze-rotation-background-solid.png",
	MAZE_ROTATION_WALLS_SOLID: "assets/maze-rotation-walls-solid.png",
	MAZE_ROTATION_CORNER_SOLID: "assets/maze-rotation-corner-solid.png",
	CLOSE_SIDE_SOLID:'assets/close-side-solid.png',
};

const MAZE_ASSETS_BLUE = Object.assign(...Object.entries(MAZE_ASSETS).map(([k,v])=>({[`${k}_BLUE`]:`${v}|rotate-colors`})));
const MAZE_ASSETS_RED = Object.assign(...Object.entries(MAZE_ASSETS).map(([k,v])=>({[`${k}_RED`]:`${v}|rotate-colors|rotate-colors`})));

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

	...MAZE_ASSETS,
	...Object.assign(...Object.entries(MAZE_ASSETS).map(([k,v])=>({[`${k}_1`]:`${v}|darken`}))),
	...Object.assign(...Object.entries(MAZE_ASSETS).map(([k,v])=>({[`${k}_2`]:`${v}|darken|darken`}))),

	...MAZE_ASSETS_BLUE,
	...Object.assign(...Object.entries(MAZE_ASSETS_BLUE).map(([k,v])=>({[`${k}_1`]:`${v}|darken`}))),
	...Object.assign(...Object.entries(MAZE_ASSETS_BLUE).map(([k,v])=>({[`${k}_2`]:`${v}|darken|darken`}))),

	...MAZE_ASSETS_RED,
	...Object.assign(...Object.entries(MAZE_ASSETS_RED).map(([k,v])=>({[`${k}_1`]:`${v}|darken`}))),
	...Object.assign(...Object.entries(MAZE_ASSETS_RED).map(([k,v])=>({[`${k}_2`]:`${v}|darken|darken`}))),

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
	ACCESS_CARD: "assets/access-card.png",
	GRAB_ACCESS_CARD: "assets/grab-access-card.png",
	SCAN_CARD: "assets/scan-card.png",
	FINAL_EXIT: "assets/final-exit.png",
	GATE: "assets/gate.png",
	OUTDOOR: "assets/outdoor.png",
	CONGRATS: "assets/congrats.png|darken",
	COINSTART: "assets/coinstart.png",
	FLASH_SCREEN: "assets/flash-screen.png",
	ARCADE_HANDS: "assets/arcade-hands.png",
	TOP_5: "assets/top-5.png",
	MOON_BASE: "assets/moon-base.png",
	MOON_BASE_GUARD: "assets/moon-base-guard.png",
	TOILET_ZOOM: "assets/toilet-zoom.png",
	TOILET_ZOOM_BACKGROUND: "assets/toilet-zoom-background.png",
	MAP: "assets/map.png",
	FAR_MAP: "assets/far-map.png",
	SIDE_MAP:'assets/side-map.png',
	SIDE_FAR_MAP:'assets/side-far-map.png',
	SIDE_FURTHER_MAP:'assets/side-further-map.png',
	FLOOR_CEILING:'assets/floor-ceiling.png',
	MENU_OUT:'assets/menu-out.png',
	MENU_DISK:'assets/menu-disk.png',
	MENU_SOUND_ON:'assets/menu-sound-on.png',
	MENU_SOUND_OFF:'assets/menu-sound-off.png',
	TREASURE_CHEST: "assets/treasure-chest.png",
	SLIME: "assets/slime.png",
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
	FUTURE_SONG_THEME: 'sounds/future-song.mp3',
	JINGLE: 'sounds/jingle.mp3',
	DARK_THEME: 'sounds/dark.mp3',
	BATTLE_THEME: 'sounds/battle-theme.mp3',
	FOE_DEFEAT: 'sounds/foe-defeat.mp3',
	LAZER: 'sounds/lazer.mp3',
	DOOR: 'sounds/door.mp3',
};

const ALPHAS = (() => {
	const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz.,?'#@!♪()[]/ "
   	   + new Array(10).fill(null).map((a, index) => String.fromCharCode(1000 + index)).join("");
	const array = [];
	for(let c = 0; c < letters.length; c++) {
		array[letters.charCodeAt(c)] = { char: letters[c], index: c };
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

const Cursor = {
	WAIT: "wait",
	NONE: "none",
};
