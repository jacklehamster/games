const shortcut = {
	0: ({situation, data}) => situation.explode && data.shot["left guard"] && data.shot["right guard"] ? FORWARD : null,
	1: game => game.matchCell(game.map,game.pos.x,game.pos.y,0,1,game.orientation,"12345",[]) && !game.doorOpening ? DOOR : FORWARD,
	2: game => game.matchCell(game.map,game.pos.x,game.pos.y,0,1,game.orientation,"12345",[]) ? (!game.doorOpening ? DOOR : FORWARD) : null,
	3: game => game.battle ? BAG : BACKWARD,
	4: game => game.sceneData.forwardUnlocked ? FORWARD : null,
	5: game => game.rotation === 0 ? BAG : null,
	6: ({battle}) => battle ? BLOCK : s(3),
	7: ({battle}) => battle ? BLOCK : null,
	8: ({battle}) => battle ? BLOCK : s(1),
	9: game => {
		if (game.battle) {
			return BAG;
		}
		const door = game.frontDoor();
		if (door && door.lock && game.frameIndex === 0 && game.rotation % 2 === 0) {
			const cell = game.frontCell();
			if (!game.situation.unlocked || !game.situation.unlocked[cell]) {
				return BAG;
			}
		}
		if (game.facingEvent() && game.facingEvent().showBag) {
			return BAG;
		}

		return BACKWARD;
	},
};

function s(index) {
	return shortcut[index];
}

const gameConfig = {
	scenes: [],
};

function getCommonMaze(modifier) {
	const maze = [
		{
			src: ASSETS[`MAZE_ROTATION_BACKGROUND${modifier}`],
			hidden: game => game.rotation % 2 === 0,
		},
		{
			src: ASSETS[`MAZE_ROTATION_WALLS${modifier}`],
			side: LEFT,
			hidden: game => game.rotation % 2 === 0 || !game.hasLeftWallWhenRotating(),
		},
		{
			src: ASSETS[`MAZE_ROTATION_WALLS${modifier}`],
			side: RIGHT,
			hidden: game => game.rotation % 2 === 0 || !game.hasRightWallWhenRotating(),
		},
		{
			src: ASSETS[`MAZE_ROTATION_CORNER${modifier}`],
			hidden: game => game.hasLeftWallWhenRotating() !== game.hasRightWallWhenRotating(),
		},
		{
			src: ASSETS[`DUNGEON_MOVE${modifier}`],
			index: game => game.doorOpening || game.bagOpening || game.menuOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1,
		},
		{
			src: ASSETS[`FAR_SIDE${modifier}`],
			side: LEFT,
			index: game => game.doorOpening || game.bagOpening || game.menuOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.mazeHole({direction:LEFT, distance: FAR}),
		},
		{ 
			src: ASSETS[`FAR_SIDE_CORNER${modifier}`],
			side: LEFT,
			index: game => game.doorOpening || game.bagOpening || game.menuOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.mazeHole({direction:LEFT, distance: FAR}) || game.farWall() && !game.mazeHole({direction:LEFT, distance:FURTHER}),
		},
		{
			src: ASSETS[`FAR_SIDE${modifier}`],
			side: RIGHT,
			index: game => game.doorOpening || game.bagOpening || game.menuOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.mazeHole({direction:RIGHT, distance: FAR}),
		},
		{
			src: ASSETS[`FAR_SIDE_CORNER${modifier}`],
			side: RIGHT,
			index: game => game.doorOpening || game.bagOpening || game.menuOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.mazeHole({direction:RIGHT, distance: FAR}) || game.farWall() && !game.mazeHole({direction:RIGHT, distance:FURTHER}),
		},
		{
			src: ASSETS[`FAR_FAR_SIDE${modifier}`],
			side: LEFT,
			index: game => game.doorOpening || game.bagOpening || game.menuOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.mazeHole({direction:LEFT, distance: FURTHER}),
		},
		{
			src: ASSETS[`FAR_FAR_SIDE${modifier}`],
			side: RIGHT,
			index: game => game.doorOpening || game.bagOpening || game.menuOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.mazeHole({direction:RIGHT, distance: FURTHER}),
		},
		{
			src: ASSETS[`FURTHER_SIDE${modifier}`],
			side: LEFT,
			index: game => game.doorOpening || game.bagOpening || game.menuOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.mazeHole({direction:LEFT, distance: FAR}) || !game.mazeHole({direction:LEFT, distance:FURTHER}),
		},
		{
			src: ASSETS[`FURTHER_SIDE${modifier}`],
			side: RIGHT,
			index: game => game.doorOpening || game.bagOpening || game.menuOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.mazeHole({direction:RIGHT, distance: FAR}) || !game.mazeHole({direction:RIGHT, distance:FURTHER}),
		},
		{
			src: ASSETS[`FURTHER_WALL${modifier}`],
			index: game => game.doorOpening || game.bagOpening || game.menuOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.furtherWall(),					
		},
		{
			src: ASSETS[`FAR_WALL${modifier}`],
			index: game => game.doorOpening || game.bagOpening || game.menuOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.farWall(),					
		},
		{
			src: ASSETS[`FAR_SIDE_CORNER${modifier}`],
			side: LEFT,
			index: game => game.doorOpening || game.bagOpening || game.menuOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.farWall() || game.mazeHole({direction:LEFT, distance: FAR}),
		},
		{
			src: ASSETS[`FAR_SIDE_CORNER${modifier}`],
			side: RIGHT,
			index: game => game.doorOpening || game.bagOpening || game.menuOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.farWall() || game.mazeHole({direction:RIGHT, distance: FAR}),
		},
		{
			src: ASSETS[`FAR_DOOR${modifier}`],
			index: game => game.doorOpening || game.bagOpening || game.menuOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.farDoor(),
		},
		{
			src: ASSETS[`CLOSE_SIDE${modifier}`],
			side: LEFT,
			index: game => game.doorOpening || game.bagOpening || game.menuOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.mazeHole({direction: LEFT, distance: CLOSE}),
		},
		{
			src: ASSETS[`CLOSE_FURTHER_SIDE${modifier}`],
			side: LEFT,
			index: game => game.doorOpening || game.bagOpening || game.menuOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.mazeHole({direction:LEFT, distance: CLOSE}) || !game.mazeHole({direction:LEFT, distance:FAR}),
		},		
		{
			src: ASSETS[`CLOSE_SIDE_CORNER${modifier}`],
			side: LEFT,
			index: game => game.doorOpening || game.bagOpening || game.menuOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.mazeHole({direction: LEFT, distance: CLOSE}) || game.closeWall() && !game.mazeHole({direction:LEFT, distance:FAR}),
		},
		{
			src: ASSETS[`CLOSE_SIDE${modifier}`],
			side: RIGHT,
			index: game => game.doorOpening || game.bagOpening || game.menuOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.mazeHole({direction: RIGHT, distance: CLOSE}),
		},
		{
			src: ASSETS[`CLOSE_FURTHER_SIDE${modifier}`],
			side: RIGHT,
			index: game => game.doorOpening || game.bagOpening || game.menuOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.mazeHole({direction:RIGHT, distance: CLOSE}) || !game.mazeHole({direction:RIGHT, distance:FAR}),
		},
		{
			src: ASSETS[`CLOSE_SIDE_CORNER${modifier}`],
			side: RIGHT,
			index: game => game.doorOpening || game.bagOpening || game.menuOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.mazeHole({direction: RIGHT, distance: CLOSE}) || game.closeWall() && !game.mazeHole({direction:RIGHT, distance:FAR}),
		},
		{
			src: ASSETS[`CLOSE_SIDE_CORNER${modifier}`],
			side: LEFT,
			index: game => game.doorOpening || game.bagOpening || game.menuOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.closeWall() || game.mazeHole({direction: LEFT, distance: CLOSE}),
		},
		{
			src: ASSETS[`CLOSE_SIDE_CORNER${modifier}`],
			side: RIGHT,
			index: game => game.doorOpening || game.bagOpening || game.menuOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.closeWall() || game.mazeHole({direction: RIGHT, distance: CLOSE}),
		},
		{
			src: ASSETS.FAR_MAP,
			index: game => game.doorOpening || game.bagOpening || game.menuOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.farMap(),
		},
		{
			src: ASSETS.SIDE_MAP,
			side: LEFT,
			index: game => game.doorOpening || game.bagOpening || game.menuOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.mazeMap({direction: LEFT, distance: CLOSE}),
		},
		{
			src: ASSETS.SIDE_MAP,
			side: RIGHT,
			index: game => game.doorOpening || game.bagOpening || game.menuOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.mazeMap({direction: RIGHT, distance: CLOSE}),
		},
		{
			src: ASSETS.SIDE_FAR_MAP,
			side: LEFT,
			index: game => game.doorOpening || game.bagOpening || game.menuOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || game.closeWall() || !game.mazeMap({direction: LEFT, distance: FAR}),
		},
		{
			src: ASSETS.SIDE_FAR_MAP,
			side: RIGHT,
			index: game => game.doorOpening || game.bagOpening || game.menuOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || game.closeWall() || !game.mazeMap({direction: RIGHT, distance: FAR}),
		},
		{
			src: ASSETS.SIDE_FURTHER_MAP,
			side: LEFT,
			index: game => game.doorOpening || game.bagOpening || game.menuOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || game.closeWall() || game.farWall() || !game.mazeMap({direction: LEFT, distance: FURTHER}),
		},
		{
			src: ASSETS.SIDE_FURTHER_MAP,
			side: RIGHT,
			index: game => game.doorOpening || game.bagOpening || game.menuOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || game.closeWall() || game.farWall() || !game.mazeMap({direction: RIGHT, distance: FURTHER}),
		},
		{
			src: ASSETS[`CLOSE_WALL${modifier}`],
			index: game => game.doorOpening || game.bagOpening || game.menuOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.closeWall(),
		},
		{
			src: ASSETS.DOORWAY, col: 2, row: 3,
			index: game => {
				const frontDoor = game.frontDoor();
				if (!frontDoor) return 0;
				if (frontDoor.wayUp) return 1;
				if (frontDoor.wayDown) return 2;
				if (frontDoor.eye) return 3 + (game.now % 4000 < 1000 ? 1 : 0);
				return 0;
			},
			hidden: game => game.rotation % 2 === 1 || !game.closeDoor() || game.moving,
		},
		{
			src: ASSETS[`DOOR_OPEN${modifier}`],
			index: game => game.onDoor() ? 3 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.closeDoor() || !game.doorOpening && (!game.onDoor() || game.moving),
		},
		{
			src: ASSETS[`CLOSE_DOOR${modifier}`],
			index: game => game.doorOpening || game.bagOpening || game.menuOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.closeDoor() || game.doorOpening || game.onDoor(),
		},
		{
			src: ASSETS[`DUNGEON_LOCK${modifier}`], col: 2, row: 2,
			index: game => game.moving ? game.frameIndex : 0,
			hidden: game => {
				if(game.rotation % 2 === 1 || !game.closeDoor()) {
					return true;
				}
				const frontDoor = game.frontDoor();
				if (!frontDoor || !frontDoor.lock) {
					return true;
				}
				if (game.situation.unlocked && game.situation.unlocked[game.frontCell()]) {
					return true;
				}
				return false;
			},
			onClick: game => {
				game.showTip("It's locked.", null, null, { removeLock:true });
			},
			combine: (item, game) => {
				if (item === "key") {
					const cell = game.frontCell();
					if (game.unlock(cell)) {
						game.removeFromInventory("key");
						game.playSound(SOUNDS.DUD);
					}
				} else {
					game.playErrorSound();
				}
				game.useItem = null;
				return true;
			},
		},
		{
			src: ASSETS.MAP,
			index: game => game.doorOpening || game.bagOpening || game.menuOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.closeMap(),
		},
		{
			custom: ({map, sceneData,pos, events}, sprite, ctx) => {
				const mapWidth = map[0].length, mapHeight = map.length;
				const mapXCenter = ctx.canvas.width / 2, mapYCenter = ctx.canvas.height / 2;
				const key = `${pos.x}_${pos.y}`;
				if (!sceneData.canvases || !sceneData.canvases[key]) {
					if (!sceneData.canvases) {
						sceneData.canvases = {};
					}
					const mapCanvas = document.createElement("canvas");
					mapCanvas.width = mapWidth; mapCanvas.height = mapHeight;
					const ctx = mapCanvas.getContext("2d"); 
					ctx.clearRect(0, 0, mapWidth, mapHeight);
					const imageData = ctx.getImageData(0, 0, mapWidth, mapHeight);
					for (let i = 0; i < imageData.data.length; i+=4) {
						const cell = map[mapHeight-1 - Math.floor((i/4)/mapWidth)][(i/4)%mapWidth];
						const onCell = mapHeight-1 - Math.floor((i/4)/mapWidth)===pos.y && (i/4)%mapWidth===pos.x;
						if (onCell) {
							imageData.data[i] = 255;
							imageData.data[i+1] = 0;
							imageData.data[i+2] = 0;							
						} else if ("12345".indexOf(cell)>=0) {
							imageData.data[i] = 50;
							imageData.data[i+1] = 150;
							imageData.data[i+2] = 255;
						} else if (cell==='.' || events && events[cell] && !events[cell].blockMap) {
							imageData.data[i] = 0;
							imageData.data[i+1] = 0;
							imageData.data[i+2] = 0;
						} else {
							imageData.data[i] = 255;
							imageData.data[i+1] = 255;
							imageData.data[i+2] = 255;
						}
						imageData.data[i+3] = 255;
					}
					ctx.putImageData(imageData, 0, 0);
					sceneData.canvases[key] = mapCanvas;
				}
				ctx.drawImage(sceneData.canvases[key], Math.floor(mapXCenter - mapWidth / 2), Math.floor(mapYCenter - mapHeight / 2));
			},
			hidden: game => game.rotation % 2 === 1 || game.frameIndex !== 0 && !game.bagOpening && !game.menuOpening || !game.closeMap(),
		},
	];
	return maze;
}


function getRoomMaze(modifier) {
	const maze = [
		{
			src: ASSETS[`MAZE_ROTATION_BACKGROUND_SOLID${modifier}`],
			hidden: game => game.rotation % 2 === 0,
		},
		{
			src: ASSETS[`MAZE_ROTATION_WALLS_SOLID${modifier}`],
			side: LEFT,
			hidden: game => game.rotation % 2 === 0 || !game.hasLeftWallWhenRotating(),
		},
		{
			src: ASSETS[`MAZE_ROTATION_WALLS_SOLID${modifier}`],
			side: RIGHT,
			hidden: game => game.rotation % 2 === 0 || !game.hasRightWallWhenRotating(),
		},
		{
			src: ASSETS[`MAZE_ROTATION_CORNER_SOLID${modifier}`],
			hidden: game => game.hasLeftWallWhenRotating() !== game.hasRightWallWhenRotating(),
		},
		{
			src: ASSETS[`DUNGEON_MOVE_SOLID${modifier}`],
			index: game => game.doorOpening || game.bagOpening || game.menuOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1,
		},
		{
			src: ASSETS[`FAR_SIDE${modifier}`],
			side: LEFT,
			index: game => game.doorOpening || game.bagOpening || game.menuOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.mazeHole({direction:LEFT, distance: FAR}),
		},
		{ 
			src: ASSETS[`FAR_SIDE_CORNER${modifier}`],
			side: LEFT,
			index: game => game.doorOpening || game.bagOpening || game.menuOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.mazeHole({direction:LEFT, distance: FAR}) || game.farWall() && !game.mazeHole({direction:LEFT, distance:FURTHER}),
		},
		{
			src: ASSETS[`FAR_SIDE${modifier}`],
			side: RIGHT,
			index: game => game.doorOpening || game.bagOpening || game.menuOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.mazeHole({direction:RIGHT, distance: FAR}),
		},
		{
			src: ASSETS[`FAR_SIDE_CORNER${modifier}`],
			side: RIGHT,
			index: game => game.doorOpening || game.bagOpening || game.menuOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.mazeHole({direction:RIGHT, distance: FAR}) || game.farWall() && !game.mazeHole({direction:RIGHT, distance:FURTHER}),
		},
		{
			src: ASSETS[`FAR_FAR_SIDE${modifier}`],
			side: LEFT,
			index: game => game.doorOpening || game.bagOpening || game.menuOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.mazeHole({direction:LEFT, distance: FURTHER}),
		},
		{
			src: ASSETS[`FAR_FAR_SIDE${modifier}`],
			side: RIGHT,
			index: game => game.doorOpening || game.bagOpening || game.menuOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.mazeHole({direction:RIGHT, distance: FURTHER}),
		},
		{
			src: ASSETS[`FURTHER_SIDE${modifier}`],
			side: LEFT,
			index: game => game.doorOpening || game.bagOpening || game.menuOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.mazeHole({direction:LEFT, distance: FAR}) || !game.mazeHole({direction:LEFT, distance:FURTHER}),
		},
		{
			src: ASSETS[`FURTHER_SIDE${modifier}`],
			side: RIGHT,
			index: game => game.doorOpening || game.bagOpening || game.menuOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.mazeHole({direction:RIGHT, distance: FAR}) || !game.mazeHole({direction:RIGHT, distance:FURTHER}),
		},
		{
			src: ASSETS[`FURTHER_WALL${modifier}`],
			index: game => game.doorOpening || game.bagOpening || game.menuOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.furtherWall(),					
		},
		{
			src: ASSETS[`FAR_WALL_SOLID${modifier}`],
			index: game => game.doorOpening || game.bagOpening || game.menuOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.farWall(),					
		},
		{
			src: ASSETS[`FAR_SIDE_CORNER${modifier}`],
			side: LEFT,
			index: game => game.doorOpening || game.bagOpening || game.menuOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.farWall() || game.mazeHole({direction:LEFT, distance: FAR}),
		},
		{
			src: ASSETS[`FAR_SIDE_CORNER${modifier}`],
			side: RIGHT,
			index: game => game.doorOpening || game.bagOpening || game.menuOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.farWall() || game.mazeHole({direction:RIGHT, distance: FAR}),
		},
		{
			src: ASSETS[`FAR_DOOR${modifier}`],
			index: game => game.doorOpening || game.bagOpening || game.menuOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.farDoor(),
		},
		{
			src: ASSETS[`CLOSE_SIDE_SOLID${modifier}`],
			side: LEFT,
			index: game => game.doorOpening || game.bagOpening || game.menuOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.mazeHole({direction: LEFT, distance: CLOSE}),
		},
		{
			src: ASSETS[`CLOSE_FURTHER_SIDE${modifier}`],
			side: LEFT,
			index: game => game.doorOpening || game.bagOpening || game.menuOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.mazeHole({direction:LEFT, distance: CLOSE}) || !game.mazeHole({direction:LEFT, distance:FAR}),
		},		
		{
			src: ASSETS[`CLOSE_SIDE_CORNER${modifier}`],
			side: LEFT,
			index: game => game.doorOpening || game.bagOpening || game.menuOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.mazeHole({direction: LEFT, distance: CLOSE}) || game.closeWall() && !game.mazeHole({direction:LEFT, distance:FAR}),
		},
		{
			src: ASSETS[`CLOSE_SIDE_SOLID${modifier}`],
			side: RIGHT,
			index: game => game.doorOpening || game.bagOpening || game.menuOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.mazeHole({direction: RIGHT, distance: CLOSE}),
		},
		{
			src: ASSETS[`CLOSE_FURTHER_SIDE${modifier}`],
			side: RIGHT,
			index: game => game.doorOpening || game.bagOpening || game.menuOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.mazeHole({direction:RIGHT, distance: CLOSE}) || !game.mazeHole({direction:RIGHT, distance:FAR}),
		},
		{
			src: ASSETS[`CLOSE_SIDE_CORNER${modifier}`],
			side: RIGHT,
			index: game => game.doorOpening || game.bagOpening || game.menuOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.mazeHole({direction: RIGHT, distance: CLOSE}) || game.closeWall() && !game.mazeHole({direction:RIGHT, distance:FAR}),
		},
		{
			src: ASSETS[`CLOSE_WALL_SOLID${modifier}`],
			index: game => game.doorOpening || game.bagOpening || game.menuOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.closeWall(),
		},
		{
			src: ASSETS[`CLOSE_SIDE_CORNER${modifier}`],
			side: LEFT,
			index: game => game.doorOpening || game.bagOpening || game.menuOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.closeWall() || game.mazeHole({direction: LEFT, distance: CLOSE}),
		},
		{
			src: ASSETS[`CLOSE_SIDE_CORNER${modifier}`],
			side: RIGHT,
			index: game => game.doorOpening || game.bagOpening || game.menuOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.closeWall() || game.mazeHole({direction: RIGHT, distance: CLOSE}),
		},
		{
			src: ASSETS.DOORWAY, col: 2, row: 3,
			index: game => {
				const frontDoor = game.frontDoor();
				if (!frontDoor) return 0;
				if (frontDoor.wayUp) return 1;
				if (frontDoor.wayDown) return 2;
				if (frontDoor.eye) return 3 + (game.now % 4000 < 1000 ? 1 : 0);
				return 0;
			},
			hidden: game => game.rotation % 2 === 1 || !game.closeDoor() || game.moving,
		},
		{
			src: ASSETS[`DOOR_OPEN${modifier}`],
			index: game => game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.closeDoor() || !game.doorOpening,
		},
		{
			src: ASSETS[`CLOSE_DOOR${modifier}`],
			index: game => game.doorOpening || game.bagOpening || game.menuOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.closeDoor() || game.doorOpening,					
		},
		{
			src: ASSETS.MAP,
			index: game => game.doorOpening || game.bagOpening || game.menuOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.closeMap(),
		},
		{
			src: ASSETS.FAR_MAP,
			index: game => game.doorOpening || game.bagOpening || game.menuOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.farMap(),
		},
		{
			src: ASSETS.SIDE_MAP,
			side: LEFT,
			index: game => game.doorOpening || game.bagOpening || game.menuOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || game.closeWall() || !game.mazeMap({direction: LEFT, distance: CLOSE}),
		},
		{
			src: ASSETS.SIDE_MAP,
			side: RIGHT,
			index: game => game.doorOpening || game.bagOpening || game.menuOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || game.closeWall() || !game.mazeMap({direction: RIGHT, distance: CLOSE}),
		},
		{
			src: ASSETS.SIDE_FAR_MAP,
			side: LEFT,
			index: game => game.doorOpening || game.bagOpening || game.menuOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || game.closeWall() || !game.mazeMap({direction: LEFT, distance: FAR}),
		},
		{
			src: ASSETS.SIDE_FAR_MAP,
			side: RIGHT,
			index: game => game.doorOpening || game.bagOpening || game.menuOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || game.closeWall() || !game.mazeMap({direction: RIGHT, distance: FAR}),
		},
		{
			src: ASSETS.SIDE_FURTHER_MAP,
			side: LEFT,
			index: game => game.doorOpening || game.bagOpening || game.menuOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || game.closeWall() || game.farWall() || !game.mazeMap({direction: LEFT, distance: FURTHER}),
		},
		{
			src: ASSETS.SIDE_FURTHER_MAP,
			side: RIGHT,
			index: game => game.doorOpening || game.bagOpening || game.menuOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || game.closeWall() || game.farWall() || !game.mazeMap({direction: RIGHT, distance: FURTHER}),
		},
		{
			custom: ({map, sceneData,pos}, sprite, ctx) => {
				const mapWidth = map[0].length, mapHeight = map.length;
				const mapXCenter = ctx.canvas.width / 2, mapYCenter = ctx.canvas.height / 2;
				const key = `${pos.x}_${pos.y}`;
				if (!sceneData.canvases || !sceneData.canvases[key]) {
					if (!sceneData.canvases) {
						sceneData.canvases = {};
					}
					const mapCanvas = document.createElement("canvas");
					mapCanvas.width = mapWidth; mapCanvas.height = mapHeight;
					const ctx = mapCanvas.getContext("2d"); 
					ctx.clearRect(0, 0, mapWidth, mapHeight);
					const imageData = ctx.getImageData(0, 0, mapWidth, mapHeight);
					for (let i = 0; i < imageData.data.length; i+=4) {
						const cell = map[mapHeight-1 - Math.floor((i/4)/mapWidth)][(i/4)%mapWidth];
						const onCell = mapHeight-1 - Math.floor((i/4)/mapWidth)===pos.y && (i/4)%mapWidth===pos.x;
						if (onCell) {
							imageData.data[i] = 255;
							imageData.data[i+1] = 0;
							imageData.data[i+2] = 0;							
						} else if ("12345".indexOf(cell)>=0) {
							imageData.data[i] = 50;
							imageData.data[i+1] = 150;
							imageData.data[i+2] = 255;
						} else if (cell==='.') {
							imageData.data[i] = 0;
							imageData.data[i+1] = 0;
							imageData.data[i+2] = 0;
						} else {
							imageData.data[i] = 255;
							imageData.data[i+1] = 255;
							imageData.data[i+2] = 255;
						}
						imageData.data[i+3] = 255;
					}
					ctx.putImageData(imageData, 0, 0);
					sceneData.canvases[key] = mapCanvas;
				}
				ctx.drawImage(sceneData.canvases[key], Math.floor(mapXCenter - mapWidth / 2), Math.floor(mapYCenter - mapHeight / 2));
			},
			hidden: game => game.rotation % 2 === 1 || game.frameIndex !== 0 && !game.bagOpening && !game.menuOpening || !game.closeMap(),
		},
	];
	return maze;
}

function standardBag() {
	return [
		{
			name: "self",
			src: ASSETS.EATER, col:2, row:2,
			index: (game, sprite) => game.hoverSprite === sprite ? Math.min(2, Math.floor((game.now - sprite.hoverTime) / 100)) : 0,
			hidden: game => !consumable[game.useItem],
			combine: (item, game) => {
				if (consumable[game.useItem]) {
					if (consumable[game.useItem](game)) {
						game.removeFromInventory(item);
						game.useItem = null;
					}
					return true;
				}
			},
		},
		{
			bag: true,
			src: ASSETS.BAG_OUT,
			index: game => game.frameIndex,
			hidden: game => {
				const {arrow, bagOpening, dialog, data, battle, pickedUp, sceneData, now} = game;
				if (data.gameOver) {
					return true;
				}
				if (bagOpening) {
					return false;
				}
				if (dialog && dialog.conversation[dialog.index].options.length > 2) {
					return true;
				}
				if (arrow === "BAG") {
					const door = game.frontDoor();
					if (door && door.lock && game.frameIndex === 0 && game.rotation % 2 === 0) {
						const cell = game.frontCell();
						if (!game.situation.unlocked || !game.situation.unlocked[cell]) {
							return false;
						}
					}
					if (game.facingEvent() && game.facingEvent().showBag) {
						return false;
					}
				}
				return arrow !== BAG && (!sceneData.showStats || now - sceneData.showStats < 400);
			},
			alpha: game => game.emptyBag() ? .2 : 1,
			onClick: game => game.clickBag(),
		},
	];
}

function standardMenu() {
	return [
		{
			custom: (game, sprite, ctx) => {
				ctx.fillStyle = "#00000088";
				ctx.fillRect(0, 0, 64, 64);
			},
			hidden: game => !game.sceneData.showStats,
			onClick: game => game.sceneData.showStats = 0,
		},
		{
			src: ASSETS.STATS,
			index: ({now, sceneData}) => Math.min(3, Math.floor((now - sceneData.showStats)/100)),
			hidden: game => !game.sceneData.showStats,
			onClick: game => {
			},
		},
		{
			custom: (game, sprite, ctx) => {
				//	stats
				const { data } = game;
				const { stats }  = data;
				const labelX = 5;
				const statX = 27;
				let y = 9;

				game.displayTextLine(ctx, {
					msg: `LVL ${game.getLevel(stats.xp)}`,
					x:34, y,
				});
				y+=13;
				game.displayTextLine(ctx, {
					msg: `ATK`,
					x:labelX, y,
				});
				game.displayTextLine(ctx, {
					msg: `${stats.damage}`,
					x:statX, y,
				});
				y+=7;
				game.displayTextLine(ctx, {
					msg: `DEF`,
					x:labelX, y,
				});
				game.displayTextLine(ctx, {
					msg: `${stats.defense}`,
					x:statX, y,
				});
				y+=7;
				game.displayTextLine(ctx, {
					msg: `STA`,
					x:labelX, y,
				});
				game.displayTextLine(ctx, {
					msg: `${Math.ceil(stats.life)}/${stats.maxLife}`,
					x:statX, y,
				});
				y+=7;
				game.displayTextLine(ctx, {
					msg: `XP`,
					x:labelX, y,
				});
				game.displayTextLine(ctx, {
					msg: `${stats.xp}/${Math.ceil(Math.exp(Math.max(2, Math.ceil(Math.log(stats.xp)))))}`,
					x:statX, y,
				});

				if (stats.bonus) {
					ctx.fillStyle = "#aa9933";
					for (let i = 0; i < Math.min(9, stats.bonus); i++) {
						ctx.fillRect(34 + i * 3, 16, 2, 2);
					}
				}
			},
			hidden: ({now, sceneData}) => !sceneData.showStats || now - sceneData.showStats < 400,
		},
		{
			custom: (game, sprite, ctx) => {
				ctx.fillStyle = "#ccaa33";
				ctx.strokeStyle = "#cccc00";
				const x = 23.5, y = 23.5;
				ctx.beginPath();
				ctx.moveTo(x, y);
				ctx.lineTo(x-2, y+2);
				ctx.lineTo(x+2, y+2);
				ctx.closePath();
				ctx.fill();
				ctx.stroke();
			},
			hidden: ({data, sceneData, now}) => !sceneData.showStats || now - sceneData.showStats < 400 || !data.stats.bonus,
			onClick: game => {
				const {data} = game;
				data.stats.bonus --;
				data.stats.damage ++;
				game.playSound(SOUNDS.DRINK);
			},
		},
		{
			custom: (game, sprite, ctx) => {
				ctx.fillStyle = "#ccaa33";
				ctx.strokeStyle = "#cccc00";
				const x = 23.5, y = 30.5;
				ctx.beginPath();
				ctx.moveTo(x, y);
				ctx.lineTo(x-2, y+2);
				ctx.lineTo(x+2, y+2);
				ctx.closePath();
				ctx.fill();
				ctx.stroke();
			},	
			hidden: ({data, sceneData, now}) => !sceneData.showStats || now - sceneData.showStats < 400 || !data.stats.bonus,
			onClick: game => {
				const {data} = game;
				data.stats.bonus --;
				data.stats.defense ++;
				game.playSound(SOUNDS.DRINK);
			},
		},
		{
			custom: (game, sprite, ctx) => {
				ctx.fillStyle = "#ccaa33";
				ctx.strokeStyle = "#cccc00";
				const x = 23.5, y = 37.5;
				ctx.beginPath();
				ctx.moveTo(x, y);
				ctx.lineTo(x-2, y+2);
				ctx.lineTo(x+2, y+2);
				ctx.closePath();
				ctx.fill();
				ctx.stroke();
			},	
			hidden: ({data, sceneData, now}) => !sceneData.showStats || now - sceneData.showStats < 400 || !data.stats.bonus,
			onClick: game => {
				const {data} = game;
				data.stats.bonus --;
				data.stats.life += 10;
				data.stats.maxLife += 10;
				game.playSound(SOUNDS.DRINK);
			},
		},
		{
			menu: true,
			src: ASSETS.MENU_OUT,
			index: game => game.frameIndex,
			hidden: game => !game.menuOpening && (game.arrow !== MENU || game.sceneData.firstShot) || game.hideCursor && game.frameIndex === 0 || game.battle && !game.battle.foeDefeated,
			onClick: game => game.clickMenu(),
			onHoverOut: (game, sprite, hovered) => { if (game.menuOpening > 0 && game.frameIndex === 3 && (!hovered || !hovered.menu_item && !hovered.menu)) game.openMenu(game.now); },
		},
		{
			menu_item: true,
			name: "disk",
			src: ASSETS.MENU_DISK,
			index: game => game.frameIndex,
			hidden: game => !game.menuOpening && (game.arrow !== MENU || game.sceneData.firstShot),
			alpha: ({hoverSprite}, sprite) => hoverSprite === sprite ? 1 : .5,
			onClick: game => {
				game.hideCursor = true;
				game.openMenu(game.now, game => {
					const currentSceneIndex = game.sceneIndex;
					const currentScreenshot = game.screenshot();
					game.gotoScene("disk-screen");
					game.sceneData.returnScene = currentSceneIndex;
					game.sceneData.screenshot = currentScreenshot;
				});
			},
			onHoverOut: (game, sprite, hovered) => { if (game.menuOpening > 0 && (!hovered || !hovered.menu_item && !hovered.menu)) game.openMenu(game.now); },
			combine: (item, game) => {
				game.useItem = null;
				return true;
			},
		},
		{
			menu_item: true,
			name: "sound_on",
			src: ASSETS.MENU_SOUND_ON,
			index: game => game.frameIndex,
			hidden: game => !game.menuOpening && (game.arrow !== MENU || game.sceneData.firstShot) || game.mute,
			alpha: ({hoverSprite}, sprite) => hoverSprite === sprite ? 1 : .5,
			onClick: game => game.mute = true,
			onHoverOut: (game, sprite, hovered) => { if (game.menuOpening > 0 && (!hovered || !hovered.menu_item && !hovered.menu)) game.openMenu(game.now); },
			combine: (item, game) => {
				game.useItem = null;
				return true;
			},
		},
		{
			menu_item: true,
			name: "sound_off",
			src: ASSETS.MENU_SOUND_OFF,
			index: game => game.frameIndex,
			hidden: game => !game.menuOpening && (game.arrow !== MENU || game.sceneData.firstShot) || !game.mute,
			alpha: ({hoverSprite}, sprite) => hoverSprite === sprite ? 1 : .5,
			onClick: game => game.mute = false,
			onHoverOut: (game, sprite, hovered) => { if (game.menuOpening > 0 && (!hovered || !hovered.menu_item && !hovered.menu)) game.openMenu(game.now); },
			combine: (item, game) => {
				game.useItem = null;
				return true;
			},
		},
		{
			menu_item: true,
			name: "profile",
			src: ASSETS.MENU_PROFILE,
			index: game => game.frameIndex,
			hidden: game => !game.menuOpening && (game.arrow !== MENU || game.sceneData.firstShot),
			alpha: ({hoverSprite}, sprite) => hoverSprite === sprite ? 1 : .5,
			onClick: game => {
				game.sceneData.showStats = game.sceneData.showStats ? 0 : game.now;
				game.openMenu(game.now);
			},
			onHoverOut: (game, sprite, hovered) => { if (game.menuOpening > 0 && (!hovered || !hovered.menu_item && !hovered.menu)) game.openMenu(game.now); },
			combine: (item, game) => {
				game.useItem = null;
				return true;
			},
		},
		{
			menu_item: true,
			name: "profile-notification",
			src: ASSETS.MENU_PROFILE_NOTIFICATION,
			index: game => game.frameIndex,
			hidden: game => !game.data.stats.bonus || !game.menuOpening && (game.arrow !== MENU || game.sceneData.firstShot),
			combine: (item, game) => {
				game.useItem = null;
				return true;
			},
		},
		{
			hidden: game => !game.menuOpening && (game.arrow !== MENU || game.sceneData.firstShot) || game.hideCursor && game.frameIndex === 0 || game.battle,
			custom: ({data, frameIndex}, sprite, ctx)=> {
				const { stats } = data;
				const offsetX = frameIndex === 3 ? 0 : frameIndex === 2 ? 1 : -10;
				ctx.fillStyle = "#110044";
				ctx.fillRect(50, 2 + offsetX, 12, 3);

				ctx.fillStyle = "#aa0022";
				ctx.fillRect(51, 3 + offsetX, 10, 1);

				ctx.fillStyle = "#bbcc22";
				ctx.fillRect(51, 3 + offsetX, 10 * stats.life / stats.maxLife, 1);

			},
		},
	];
}

function makeFoe(foe, src) {
	return 	{
		src, col: 4, row: 4,
		offsetX: ({now, battle}) => {
			const hitTime = Math.max(1, now - battle.playerAttackLanded);
			return hitTime < 500 ? Math.round((Math.random() - .5) * Math.min(10, 200 / hitTime)) : 0;
		},
		offsetY: ({now, battle}) => {
			const hitTime = Math.max(1, now - battle.playerAttackLanded);
			return hitTime < 500 ? Math.round((Math.random() - 1) * Math.min(10, 200 / hitTime)) : 0;
		},
		index: ({now, battle, data}) => {
			if (!battle || data.gameOver) {
				return 0;
			}
			if (battle.foeDefeated) {
				return Math.min(15, 9 + Math.floor((now - battle.foeDefeated) / 100));
			}
			const hitTime = Math.max(1, now - battle.playerAttackLanded);
			if (hitTime < 400) {
				return 9;
			}
			if (battle.foeBlock && now - battle.foeBlock < 200) {
				return 8;
			}
			if (now > battle.nextAttack) {
				return 4 + Math.floor((now - battle.nextAttack)/100) % 4;
			}
			return Math.floor(now/200) % 4;
		},
		hidden: ({battle, now}) => !battle || battle.foe != foe || battle.foeDefeated && now - battle.foeDefeated >= 2000,
		onShot: (game, sprite) => {
			const {battle, data} = game;
			game.damageFoe(100, {shot:true});
		},
		combine: (item, game) => {
			game.battle.nextAttack =  Math.min(game.now + 3000, game.battle.nextAttack);
			if (item === "gun") {
				game.showTip("I'm out of ammo.", null, 50)
			} else if (item === "photo") {
				game.showTip("Have you seen this baby?", null, 50);
			} else {
				game.showTip(`Would you like this ${item}?`, null, 50);
			}
			return true;
		},
	};
}

function makeOnSceneBattle() {
	return {
		onSceneBattle: (game, battle) => {
			const {now, arrow, data} = game;
			if (battle.foeDefeated) {
				return;
			}
			if (!battle.nextAttack) {
				battle.nextAttack = Math.random() * battle.attackSpeed + now;
			} else if (now >= battle.nextAttack) {
				const frame = 4 + Math.floor((now - battle.nextAttack) / battle.attackPeriod);
				if (frame === 7 && !battle.foeDidAttack) {
					if (game.blocking() && !battle.playerLeftAttack && !battle.playerRightAttack) {
						game.playSound(SOUNDS.DUD);
						battle.playerBlock = now;
						game.damagePlayer(battle.foeDamage / 5, {blocked:true});
					} else {
						game.playSound(SOUNDS.HIT);
						battle.playerHit = now;
						battle.playerLeftAttack = battle.playerRightAttack = 0;
						game.damagePlayer(battle.foeDamage);
					}
					game.pendingTip = null;
					battle.foeDidAttack = now;
				} else if (frame > 7) {
					battle.foeDidAttack = 0;
					battle.nextAttack = null;
				}
			}
			if (battle.playerBlock && now - battle.playerBlock > 200) {
				battle.playerBlock = 0;
			}
			if (battle.playerHit && now - battle.playerHit > 400) {
				battle.playerHit = 0;
			}

			const attackPeriod = (battle.foeBlock ? 1.5 : 1) * battle.playerAttackPeriod;
			const playerAttack = battle.playerLeftAttack || battle.playerRightAttack;
			if (playerAttack) {
				const frame = Math.floor((now - playerAttack) / attackPeriod);
				if (frame === 3 && !battle.playerAttackLanded && !battle.foeBlock) {
					if (now >= battle.nextAttack || Math.random()>=battle.foeBlockChance) {
						battle.nextAttack = null;
						game.playSound(SOUNDS.HIT);
						battle.playerAttackLanded = now;
						game.damageFoe(data.stats.damage);
					} else if (!battle.foeBlock) {
						game.playSound(SOUNDS.DUD);
						battle.foeBlock = now;
						game.damageFoe(data.stats.damage / 5, {blocked:true});
						if (Math.random() >= battle.riposteChance) {
							battle.nextAttack = Math.min(battle.nextAttack, now + 50);
						}
					}
				}
				if (frame > 4) {
					battle.playerRightAttack = 0;
					battle.playerLeftAttack = 0;
					battle.playerAttackLanded = 0;						
					battle.fist = battle.fist === LEFT ? RIGHT: LEFT;
				}
			}
			if (game.data.stats.life <= 0 && !game.data.gameOver) {
				game.gameOver();
				const fadeDuration = 3000;
				game.fadeOut(game.now, {duration:fadeDuration * 1.5, fadeDuration, color:"#FF0000", max: .7});
			}
		},
		onScenePunch: ({useItem}, battle) => {
			return !useItem;
		},
	};
}

function standardBattle() {
	return [
		{
			src: ASSETS.PUNCH, col: 4, row: 4,
			side: ({battle}) => !battle.playerRightAttack ? RIGHT : 0,
			offsetX: ({now, battle}) => Math.cos((now-Math.PI) / 100) + 1 + 3,
			offsetY: ({now, battle}) => Math.sin((now-Math.PI) / 100) + 1 + (battle.playerLeftAttack?10:0),
			index: ({battle, now}) => {
				if (!battle.playerRightAttack || battle.belowTheBelt) {
					return 12;
				}
				const attackPeriod = battle.playerAttackPeriod;
				const frame = Math.min(3, Math.floor((now - battle.playerRightAttack) / attackPeriod));
				return frame;
			},
			hidden: game => {
				const {battle, arrow, useItem, bagOpening} = game;
				return !battle || battle.belowTheBelt && (battle.playerLeftAttack || battle.playerRightAttack) || game.data.gameOver || battle.foeDefeated || (game.blocking() && !battle.playerLeftAttack && !battle.playerRightAttack && !battle.playerHit || useItem || bagOpening);
			},
		},
		{
			src: ASSETS.PUNCH, col: 4, row: 4,
			side: ({battle}) => !battle.playerLeftAttack ? LEFT : 0,
			offsetX: ({now, battle}) => Math.sin(now / 100) - 1 - 3,
			offsetY: ({now, battle}) => Math.cos(now / 100) + 1 + (battle.playerRightAttack?10:0),
			index: ({battle, now}) => {
				if (!battle.playerLeftAttack || battle.belowTheBelt) {
					return 12;
				}
				const attackPeriod = battle.playerAttackPeriod;
				const frame = Math.min(3, Math.floor((now - battle.playerLeftAttack) / attackPeriod));
				return 4 + frame;
			},
			hidden: game => {
				const {battle, arrow, useItem, bagOpening} = game;
				return !battle || battle.belowTheBelt && (battle.playerLeftAttack || battle.playerRightAttack) || game.data.gameOver || battle.foeDefeated || game.blocking() && !battle.playerLeftAttack && !battle.playerRightAttack && !battle.playerHit || useItem || bagOpening;
			},
		},
		{
			src: ASSETS.PUNCH, col: 4, row: 4,	// KICK
			index: ({battle, now}) => {
				const { playerAttackPeriod, playerLeftAttack, playerRightAttack } = battle;
				if (!playerLeftAttack && !playerRightAttack) {
					return 12;
				}
				const frame = Math.min(3, Math.floor((now - Math.max(playerLeftAttack, playerRightAttack)) / playerAttackPeriod));
				return 8 + frame;
			},
			hidden: game => {
				const {battle, arrow, useItem, bagOpening} = game;
				return !battle || !battle.playerLeftAttack && !battle.playerRightAttack || !battle.belowTheBelt || game.data.gameOver || battle.foeDefeated || game.blocking() && !battle.playerLeftAttack && !battle.playerRightAttack && !battle.playerHit || useItem || bagOpening;
			},			
		},
		{
			src: ASSETS.PUNCH, col: 4, row: 4,
			offsetY: ({battle, now}) => battle.playerBlock && now - battle.playerBlock < 50 ? 5 : 0,
			index: 13,
			hidden: game => {
				const {battle, arrow, useItem, bagOpening, hoverSprite} = game;
				if (!game.blocking() || hoverSprite && hoverSprite.bag || battle.foeDefeated || battle.playerHit || battle.playerLeftAttack || battle.playerRightAttack || useItem || bagOpening) {
					return true;
				}
				return false;
			},
		},
		{
			src: ASSETS.TREASURE_CHEST,
			hidden: game => {
				const {chest, now, rotation, moving, frameIndex} = game;
				if (!chest || now < chest.found || rotation % 2 == 1 || moving) {
					return true;
				}
				if (!game.battle) {
					const event = game.facingEvent();
					if (!event || !event.chest) {
						return true;
					}
				}
				return false;
			},
			onClick: (game, sprite) => {
				const {now, chest, situation} = game;
				if (!game.battle) {
					if (situation.chestCleared && situation.chestCleared[game.frontCell()]) {
						return;
					}
				}
				if (chest && !chest.opened) {
					chest.opened = now;
					game.playSound(SOUNDS.DRINK);
				}
			},
			index: game => {
				const {now, chest, situation} = game;
				return !this.battle && situation.chestCleared && situation.chestCleared[game.frontCell()] ? 3 : !chest.opened ? 0 : Math.min(3, Math.floor((now - chest.opened) / 100));
			},
			onRefresh: (game, sprite) => {
				const {now, chest, situation} = game;
				if (chest.opened) {
					const frame = Math.floor((now - chest.opened) / 100);
					if (frame > 4 && !chest.checked) {
						chest.checked = now;
						const { item, image } = chest;
						game.pickUp({item, image, message:"", onPicked: game => {
							if (game.battle) {
								game.battle = null;
							} else {
								if (!situation.chestCleared) {
									situation.chestCleared = {};
								}
								situation.chestCleared[game.frontCell()] = now;
							}
						}});
					}
				}
			},
		},
		{
			custom: (game, sprite, ctx) => {
				const { stats, battle } = game.data;
				ctx.fillStyle = "#333333";
				ctx.fillRect(4, 60, 56, 3);
				ctx.fillRect(4, 2, 56, 3);

				ctx.fillStyle = "#aa0022";
				ctx.fillRect(5, 61, 54, 1);

				ctx.fillStyle = "#770022";
				ctx.fillRect(5, 3, 54, 1);

				ctx.fillStyle = "#bbcc22";
				ctx.fillRect(5, 61, 54 * stats.life / stats.maxLife, 1);

				ctx.fillStyle = "#cc22bb";
				ctx.fillRect(5, 3, 54 * battle.foeLife / battle.foeMaxLife, 1);
			},
			hidden: ({battle, data}) => !battle || data.stats.life <= 0 || battle.foeDefeated,
		},
		{
			custom: (game, sprite, ctx) => {
				const { battle, now } = game;
				const l = now - battle.foeDefeated;
				game.displayTextLine(ctx, {
					msg: `+${battle.gainedXP}xp`,
					x:25, y:30 - Math.round(l/400),
				});				
			},
			hidden: ({battle, data, now}) => !battle || !battle.foeDefeated || !battle.gainedXP || now - battle.foeDefeated > 2000,
		},
		{
			src: ASSETS.LEVEL_UP,
			index: ({now, battle}) => Math.min(3, Math.floor((now - (battle.foeDefeated+2000))/100)),
			hidden: ({battle, data, now}) => !battle || !battle.foeDefeated || !battle.gainedLevel || now - battle.foeDefeated <= 2000 || now - battle.foeDefeated > 4500,
			alpha: ({now, battle}) => Math.max(0, Math.min(1, (battle.foeDefeated+4500 - now) / 500)),
		},
	];
}

const consumable = {
	"fruit?": game => {
		const { stats } = game.data;
		if (game.data.stats.state.ate && !game.battle) {
			game.showTip("I'm not hungry.");
			return false;
		} else {
			game.playSound(SOUNDS.EAT);
			stats.life = Math.min(stats.life + 100, stats.maxLife);
			game.data.stats.state.ate = game.now;
			if (!game.battle) {
				game.showTip("Delicious!");						
			}
			return true;
		}
	},
	"water bottle": game => {
		const { stats } = game.data;
		if (game.data.stats.state.drank && !game.battle) {
			game.showTip("I'm not thirsty.");
			return false;
		} else {
			game.playSound(SOUNDS.DRINK);
			game.addToInventory({item:"empty bottle", image:ASSETS.GRAB_BOTTLE});
			stats.life = Math.min(stats.life + 30, stats.maxLife);
			game.data.stats.state.drank = game.now;
			if (!game.battle) {
				game.showTip("Refreshing!");
			}
			return true;
		}
	},
};

