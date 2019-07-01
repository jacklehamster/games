const Game = (() => {

	let sprites = null;
	function getSprites(now) {
		if (sprites === null) {
			const dist = 6;
			const y_pos = -1;
			sprites = [
				['penguin-down', 0, y_pos, - dist, 'sprite', {
					followcam: true,
				}],
				['icewall', -.5, y_pos, - dist, 'left', { chunk: [1,0] }],
				['icewall', -.5, y_pos, - dist, 'right', { chunk: [1,0] }],
				['icewall', .5, y_pos, - dist, 'left', { chunk: [1,0] }],
				['icewall', .5, y_pos, - dist, 'right', { chunk: [1,0] }],

				['icewall', -.5, y_pos, - dist + 1, 'left', { chunk: [0,0] }],
				['icewall', -.5, y_pos, - dist + 1, 'right', { chunk: [2,0] }],
				['icewall', .5, y_pos, - dist + 1, 'left', { chunk: [0,0] }],
				['icewall', .5, y_pos, - dist + 1, 'right', { chunk: [2,0] }],

				['icefloor', 0, y_pos, - dist, 'floor', { chunk: [0,1] }],
				['icefloor', 0, y_pos, - dist, 'ceiling', { chunk: [0,1] }],
				['icefloor', 0, y_pos + 1, - dist, 'floor', { chunk: [0,1] }],
				['icefloor', 0, y_pos + 1, - dist, 'ceiling', { chunk: [0,1] }],

				['icefloor', 0, y_pos, - dist + 1, 'floor', { chunk: [0,2] }],
				['icefloor', 0, y_pos, - dist + 1, 'ceiling', { chunk: [0,0] }],
				['icefloor', 0, y_pos + 1, - dist + 1, 'floor', { chunk: [0,2] }],
				['icefloor', 0, y_pos + 1, - dist + 1, 'ceiling', { chunk: [0,0] }],
				['test',    0, y_pos, - dist - .5, 'sprite', {
				}],
			];
		}
		return sprites;
	}

	return {
		title: "Penguin Quest",
		size: [ 4096, 2160 ],
		background: "#DDEEFF",
		assets: [
			{
				id: 'penguin-down',
				src: 'assets/penguin-down.png',
				spriteSize: [64, 64],
			},
			{
				id: 'penguin-up',
				src: 'assets/penguin-up.png',
				spriteSize: [64, 64],
			},
			{
				id: 'penguin-right',
				src: 'assets/penguin-right.png',
				spriteSize: [64, 64],
			},
			{
				id: 'penguin-top-left',
				src: 'assets/penguin-top-left.png',
				spriteSize: [64, 64],
			},
			{
				id: 'penguin-bot-left',
				src: 'assets/penguin-bot-left.png',
				spriteSize: [64, 64],
			},
			{
				id: 'test',
				src: 'assets/32x64.png',
				spriteSize: [32, 64],
			},
			{
				id: 'icewall',
				src: 'assets/icewall.jpg',
				spriteSize: [800, 800],
				options: {
					chunks: 8,
				},
			},
			{
				id: 'icefloor',
				src: 'assets/icefloor.jpg',
				spriteSize: [800, 800],
				options: {
					chunks: 8,
				},
			},
		],
		getSprites,
	};
})();