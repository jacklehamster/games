const shortcut = {
	0: game => game.situation.explode && game.data.shot["left guard"] && game.data.shot["right guard"] ? FORWARD : null,
	1: game => game.matchCell(game.map,game.pos.x,game.pos.y,0,1,game.orientation,"12345",[]) && !game.doorOpening ? DOOR : FORWARD,
	2: game => game.matchCell(game.map,game.pos.x,game.pos.y,0,1,game.orientation,"12345",[]) ? (!game.doorOpening ? DOOR : FORWARD) : null,
	3: game => game.battle ? BAG : BACKWARD,
	4: game => game.sceneData.forwardUnlocked ? FORWARD : null,
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
			src: ASSETS[`MAZE_ROTATION_BACKGROUND_${modifier}`],
			hidden: game => game.rotation % 2 === 0,
		},
		{
			src: ASSETS[`MAZE_ROTATION_WALLS_${modifier}`],
			side: LEFT,
			hidden: game => game.rotation % 2 === 0 || !game.hasLeftWallWhenRotating(),
		},
		{
			src: ASSETS[`MAZE_ROTATION_WALLS_${modifier}`],
			side: RIGHT,
			hidden: game => game.rotation % 2 === 0 || !game.hasRightWallWhenRotating(),
		},
		{
			src: ASSETS[`MAZE_ROTATION_CORNER_${modifier}`],
			hidden: game => game.hasLeftWallWhenRotating() !== game.hasRightWallWhenRotating(),
		},
		{
			src: ASSETS[`DUNGEON_MOVE_${modifier}`],
			index: game => game.doorOpening || game.bagOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1,
		},
		{
			src: ASSETS[`FAR_SIDE_${modifier}`],
			side: LEFT,
			index: game => game.doorOpening || game.bagOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.mazeHole({direction:LEFT, distance: FAR}),
		},
		{ 
			src: ASSETS[`FAR_SIDE_CORNER_${modifier}`],
			side: LEFT,
			index: game => game.doorOpening || game.bagOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.mazeHole({direction:LEFT, distance: FAR}) || game.farWall() && !game.mazeHole({direction:LEFT, distance:FURTHER}),
		},
		{
			src: ASSETS[`FAR_SIDE_${modifier}`],
			side: RIGHT,
			index: game => game.doorOpening || game.bagOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.mazeHole({direction:RIGHT, distance: FAR}),
		},
		{
			src: ASSETS[`FAR_SIDE_CORNER_${modifier}`],
			side: RIGHT,
			index: game => game.doorOpening || game.bagOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.mazeHole({direction:RIGHT, distance: FAR}) || game.farWall() && !game.mazeHole({direction:RIGHT, distance:FURTHER}),
		},
		{
			src: ASSETS[`FURTHER_SIDE_${modifier}`],
			side: LEFT,
			index: game => game.doorOpening || game.bagOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.mazeHole({direction:LEFT, distance: FAR}) || !game.mazeHole({direction:LEFT, distance:FURTHER}),
		},
		{
			src: ASSETS[`FURTHER_SIDE_${modifier}`],
			side: RIGHT,
			index: game => game.doorOpening || game.bagOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.mazeHole({direction:RIGHT, distance: FAR}) || !game.mazeHole({direction:RIGHT, distance:FURTHER}),
		},
		{
			src: ASSETS[`FAR_WALL_${modifier}`],
			index: game => game.doorOpening || game.bagOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.farWall(),					
		},
		{
			src: ASSETS[`FAR_SIDE_CORNER_${modifier}`],
			side: LEFT,
			index: game => game.doorOpening || game.bagOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.farWall() || game.mazeHole({direction:LEFT, distance: FAR}),
		},
		{
			src: ASSETS[`FAR_SIDE_CORNER_${modifier}`],
			side: RIGHT,
			index: game => game.doorOpening || game.bagOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.farWall() || game.mazeHole({direction:RIGHT, distance: FAR}),
		},
		{
			src: ASSETS[`FAR_DOOR_${modifier}`],
			index: game => game.doorOpening || game.bagOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.farDoor(),
		},
		{
			src: ASSETS[`CLOSE_SIDE_${modifier}`],
			side: LEFT,
			index: game => game.doorOpening || game.bagOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.mazeHole({direction: LEFT, distance: CLOSE}),
		},
		{
			src: ASSETS[`CLOSE_FURTHER_SIDE_${modifier}`],
			side: LEFT,
			index: game => game.doorOpening || game.bagOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.mazeHole({direction:LEFT, distance: CLOSE}) || !game.mazeHole({direction:LEFT, distance:FAR}),
		},		
		{
			src: ASSETS[`CLOSE_SIDE_CORNER_${modifier}`],
			side: LEFT,
			index: game => game.doorOpening || game.bagOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.mazeHole({direction: LEFT, distance: CLOSE}) || game.closeWall() && !game.mazeHole({direction:LEFT, distance:FAR}),
		},
		{
			src: ASSETS[`CLOSE_SIDE_${modifier}`],
			side: RIGHT,
			index: game => game.doorOpening || game.bagOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.mazeHole({direction: RIGHT, distance: CLOSE}),
		},
		{
			src: ASSETS[`CLOSE_FURTHER_SIDE_${modifier}`],
			side: RIGHT,
			index: game => game.doorOpening || game.bagOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.mazeHole({direction:RIGHT, distance: CLOSE}) || !game.mazeHole({direction:RIGHT, distance:FAR}),
		},
		{
			src: ASSETS[`CLOSE_SIDE_CORNER_${modifier}`],
			side: RIGHT,
			index: game => game.doorOpening || game.bagOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.mazeHole({direction: RIGHT, distance: CLOSE}) || game.closeWall() && !game.mazeHole({direction:RIGHT, distance:FAR}),
		},
		{
			src: ASSETS[`CLOSE_WALL_${modifier}`],
			index: game => game.doorOpening || game.bagOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.closeWall(),
		},
		{
			src: ASSETS[`CLOSE_SIDE_CORNER_${modifier}`],
			side: LEFT,
			index: game => game.doorOpening || game.bagOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.closeWall() || game.mazeHole({direction: LEFT, distance: CLOSE}),
		},
		{
			src: ASSETS[`CLOSE_SIDE_CORNER_${modifier}`],
			side: RIGHT,
			index: game => game.doorOpening || game.bagOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.closeWall() || game.mazeHole({direction: RIGHT, distance: CLOSE}),
		},
		{
			src: ASSETS[`DOOR_OPEN_${modifier}`],
			index: game => game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.closeDoor() || !game.doorOpening,
		},
		{
			src: ASSETS[`CLOSE_DOOR_${modifier}`],
			index: game => game.doorOpening || game.bagOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.closeDoor() || game.doorOpening,					
		},
		{
			src: ASSETS.MAP,
			index: game => game.doorOpening || game.bagOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.closeMap(),
		},
		{
			src: ASSETS.FAR_MAP,
			index: game => game.doorOpening || game.bagOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.farMap(),
		},
		{
			src: ASSETS.SIDE_MAP,
			side: LEFT,
			index: game => game.doorOpening || game.bagOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1|| !game.mazeMap({direction: LEFT, distance: CLOSE}),
		},
		{
			src: ASSETS.SIDE_MAP,
			side: RIGHT,
			index: game => game.doorOpening || game.bagOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1|| !game.mazeMap({direction: RIGHT, distance: CLOSE}),
		},
		{
			src: ASSETS.SIDE_FAR_MAP,
			side: LEFT,
			index: game => game.doorOpening || game.bagOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.mazeMap({direction: LEFT, distance: FAR}),
		},
		{
			src: ASSETS.SIDE_FAR_MAP,
			side: RIGHT,
			index: game => game.doorOpening || game.bagOpening ? 0 : game.frameIndex,
			hidden: game => game.rotation % 2 === 1 || !game.mazeMap({direction: RIGHT, distance: FAR}),
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
			hidden: game => game.rotation % 2 === 1 || game.frameIndex !== 0 || !game.closeMap(),
		},
	];
	return maze;
}