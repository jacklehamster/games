let val = 0;
const magicnum = 13;

gameConfig.scenes.push(
	{
		name: "concert",
		onScene: game => {
			game.playTheme(SOUNDS.MUSETTE, {volume: .8});
			game.hideCursor = true;
			game.delayAction(game => {
				game.hideCursor = false;
			}, 15000);
		},
		onSceneRefresh: game => {
			game.fade = Math.min(1, 1 - (game.now - game.sceneTime) / 10000);
		},
		sprites: [
			{
				src: ASSETS.TAMMY_SLOW,
				index: ({now}) => Math.floor(now / 800) % 4,
			},
			{
				shift: Math.random() * 10000,
				src: ASSETS.DANCER, size: [32, 32], col: 3, row: 3,
				index: ({now}, {shift}) => Math.floor((now+shift) / 400) % 2,
				offsetX: Math.round(-20 + (magicnum * val++) % 100),
				offsetY: ({now}, {shift}) => 32 + Math.floor((now+shift) / 200) % 2,
			},
			{
				shift: Math.random() * 10000,
				src: ASSETS.DANCER, size: [32, 32], col: 3, row: 3,
				index: ({now}, {shift}) => 2 + Math.floor((now+shift) / 400) % 2,
				offsetX: Math.round(-20 + (magicnum * val++) % 100),
				offsetY: ({now}, {shift}) => 32 + Math.floor((now+shift) / 200) % 2,
			},
			{
				shift: Math.random() * 10000,
				src: ASSETS.DANCER, size: [32, 32], col: 3, row: 3,
				index: ({now}, {shift}) => 4 + Math.floor((now+shift) / 400) % 2,
				offsetX: Math.round(-20 + (magicnum * val++) % 100),
				offsetY: ({now}, {shift}) => 32 + Math.floor((now+shift) / 200) % 2,
			},
			{
				shift: Math.random() * 10000,
				src: ASSETS.DANCER, size: [32, 32], col: 3, row: 3,
				index: ({now}, {shift}) => 6 + Math.floor((now+shift) / 400) % 2,
				offsetX: Math.round(-20 + (magicnum * val++) % 100),
				offsetY: ({now}, {shift}) => 32 + Math.floor((now+shift) / 200) % 2,
			},
			{
				shift: Math.random() * 10000,
				src: ASSETS.DANCER, size: [32, 32], col: 3, row: 3,
				index: ({now}, {shift}) => Math.floor((now+shift) / 400) % 2,
				offsetX: Math.round(-20 + (magicnum * val++) % 100),
				offsetY: ({now}, {shift}) => 32 + Math.floor((now+shift) / 200) % 2,
			},
			{
				shift: Math.random() * 10000,
				src: ASSETS.DANCER, size: [32, 32], col: 3, row: 3,
				index: ({now}, {shift}) => 2 + Math.floor((now+shift) / 400) % 2,
				offsetX: Math.round(-20 + (magicnum * val++) % 100),
				offsetY: ({now}, {shift}) => 32 + Math.floor((now+shift) / 200) % 2,
			},
			{
				shift: Math.random() * 10000,
				src: ASSETS.DANCER, size: [32, 32], col: 3, row: 3,
				index: ({now}, {shift}) => 4 + Math.floor((now+shift) / 400) % 2,
				offsetX: Math.round(-20 + (magicnum * val++) % 100),
				offsetY: ({now}, {shift}) => 32 + Math.floor((now+shift) / 200) % 2,
			},
			{
				shift: Math.random() * 10000,
				src: ASSETS.DANCER, size: [32, 32], col: 3, row: 3,
				index: ({now}, {shift}) => 6 + Math.floor((now+shift) / 400) % 2,
				offsetX: Math.round(-20 + (magicnum * val++) % 100),
				offsetY: ({now}, {shift}) => 32 + Math.floor((now+shift) / 200) % 2,
			},
			{
				shift: Math.random() * 10000,
				src: ASSETS.DANCER_2, size: [32, 32], col: 3, row: 3,
				index: ({now}, {shift}) => Math.floor((now+shift) / 400) % 2,
				offsetX: Math.round(-20 + (magicnum * val++) % 100),
				offsetY: ({now}, {shift}) => 32 + Math.floor((now+shift) / 200) % 2,
			},
			{
				shift: Math.random() * 10000,
				src: ASSETS.DANCER_2, size: [32, 32], col: 3, row: 3,
				index: ({now}, {shift}) => 2 + Math.floor((now+shift) / 400) % 2,
				offsetX: Math.round(-20 + (magicnum * val++) % 100),
				offsetY: ({now}, {shift}) => 32 + Math.floor((now+shift) / 200) % 2,
			},
			{
				shift: Math.random() * 10000,
				src: ASSETS.DANCER_2, size: [32, 32], col: 3, row: 3,
				index: ({now}, {shift}) => 4 + Math.floor((now+shift) / 400) % 2,
				offsetX: Math.round(-20 + (magicnum * val++) % 100),
				offsetY: ({now}, {shift}) => 32 + Math.floor((now+shift) / 200) % 2,
			},
			{
				shift: Math.random() * 10000,
				src: ASSETS.DANCER_2, size: [32, 32], col: 3, row: 3,
				index: ({now}, {shift}) => 6 + Math.floor((now+shift) / 400) % 2,
				offsetX: Math.round(-20 + (magicnum * val++) % 100),
				offsetY: ({now}, {shift}) => 32 + Math.floor((now+shift) / 200) % 2,
			},
			{
				shift: Math.random() * 10000,
				src: ASSETS.DANCER_2, size: [32, 32], col: 3, row: 3,
				index: ({now}, {shift}) => Math.floor((now+shift) / 400) % 2,
				offsetX: Math.round(-20 + (magicnum * val++) % 100),
				offsetY: ({now}, {shift}) => 32 + Math.floor((now+shift) / 200) % 2,
			},
			{
				shift: Math.random() * 10000,
				src: ASSETS.DANCER_2, size: [32, 32], col: 3, row: 3,
				index: ({now}, {shift}) => 2 + Math.floor((now+shift) / 400) % 2,
				offsetX: Math.round(-20 + (magicnum * val++) % 100),
				offsetY: ({now}, {shift}) => 32 + Math.floor((now+shift) / 200) % 2,
			},
			{
				shift: Math.random() * 10000,
				src: ASSETS.DANCER_2, size: [32, 32], col: 3, row: 3,
				index: ({now}, {shift}) => 4 + Math.floor((now+shift) / 400) % 2,
				offsetX: Math.round(-20 + (magicnum * val++) % 100),
				offsetY: ({now}, {shift}) => 32 + Math.floor((now+shift) / 200) % 2,
			},
			{
				shift: Math.random() * 10000,
				src: ASSETS.DANCER_2, size: [32, 32], col: 3, row: 3,
				index: ({now}, {shift}) => 6 + Math.floor((now+shift) / 400) % 2,
				offsetX: Math.round(-20 + (magicnum * val++) % 100),
				offsetY: ({now}, {shift}) => 32 + Math.floor((now+shift) / 200) % 2,
			},
			{
				shift: Math.random() * 10000,
				src: ASSETS.DANCER_3, size: [32, 32], col: 3, row: 3,
				index: ({now}, {shift}) => Math.floor((now+shift) / 400) % 2,
				offsetX: Math.round(-20 + (magicnum * val++) % 100),
				offsetY: ({now}, {shift}) => 32 + Math.floor((now+shift) / 200) % 2,
			},
			{
				shift: Math.random() * 10000,
				src: ASSETS.DANCER_3, size: [32, 32], col: 3, row: 3,
				index: ({now}, {shift}) => 2 + Math.floor((now+shift) / 400) % 2,
				offsetX: Math.round(-20 + (magicnum * val++) % 100),
				offsetY: ({now}, {shift}) => 32 + Math.floor((now+shift) / 200) % 2,
			},
			{
				shift: Math.random() * 10000,
				src: ASSETS.DANCER_3, size: [32, 32], col: 3, row: 3,
				index: ({now}, {shift}) => 4 + Math.floor((now+shift) / 400) % 2,
				offsetX: Math.round(-20 + (magicnum * val++) % 100),
				offsetY: ({now}, {shift}) => 32 + Math.floor((now+shift) / 200) % 2,
			},
			{
				shift: Math.random() * 10000,
				src: ASSETS.DANCER_3, size: [32, 32], col: 3, row: 3,
				index: ({now}, {shift}) => 6 + Math.floor((now+shift) / 400) % 2,
				offsetX: Math.round(-20 + (magicnum * val++) % 100),
				offsetY: ({now}, {shift}) => 32 + Math.floor((now+shift) / 200) % 2,
			},					
			{
				shift: Math.random() * 10000,
				src: ASSETS.DANCER_4, size: [32, 32], col: 3, row: 3,
				index: ({now}, {shift}) => Math.floor((now+shift) / 400) % 2,
				offsetX: -10,
				offsetY: ({now}, {shift}) => 32 + 2 * Math.floor((now+shift) / 200) % 2,
				scale: 2,
			},
			{
				shift: Math.random() * 10000,
				src: ASSETS.DANCER_4, size: [32, 32], col: 3, row: 3,
				index: ({now}, {shift}) => 2 + Math.floor((now+shift) / 400) % 2,
				offsetX: 5,
				offsetY: ({now}, {shift}) => 32 + 2 * Math.floor((now+shift) / 200) % 2,
				scale: 2,
			},
			{
				shift: Math.random() * 10000,
				src: ASSETS.DANCER_4, size: [32, 32], col: 3, row: 3,
				index: ({now}, {shift}) => 4 + Math.floor((now+shift) / 400) % 2,
				offsetX: 10,
				offsetY: ({now}, {shift}) => 32 + 2 * Math.floor((now+shift) / 200) % 2,
				scale: 2,
			},
			{
				shift: Math.random() * 10000,
				src: ASSETS.DANCER_4, size: [32, 32], col: 3, row: 3,
				index: ({now}, {shift}) => 6 + Math.floor((now+shift) / 400) % 2,
				offsetX: 25,
				offsetY: ({now}, {shift}) => 32 + 2 * Math.floor((now+shift) / 200) % 2,
				scale: 2,
			},
			{
				src: ASSETS.NEXT_SCENE,
				hidden: game => game.hideCursor || game.waitCursor,
				onClick: game => game.fadeToScene("the-date", null, 5000),
			},
			{
				custom: (game, sprite, ctx) => {
					game.displayTextLine(ctx, {
						msg: "skip", x: 50, y: 47,
					});
				},
				hidden: game => !game.hoverSprite || game.hoverSprite.src !== ASSETS.NEXT_SCENE,
			},
		],
	},
);