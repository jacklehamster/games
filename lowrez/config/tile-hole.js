gameConfig.scenes.push(
	{
		name: "tile-hole",
		sprites: [
			{
				src: ASSETS.TILE_HOLE,
				preventClick: game => !game.data.pickedUp.gun,
				onClick: game => {
					game.gotoScene("jail-cell");
					game.rotation = 4;
				},
			},
			{
				name: "gun",
				src: ASSETS.GUN,
				hidden: (game, {name}) => game.data.pickedUp[name],
				onClick: (game, {name}) => {
					game.addToInventory({
						item: "bullet",
						count: 6,
					});
					game.pickUp({item:name, image:ASSETS.GRAB_GUN, message:"A loaded gun! Did I hide this in here?",
						onPicked: game => {
							game.gotoScene("jail-cell");
							game.rotation = 4;
						}
					});
				},
			},
			{
				bag: true,
				src: ASSETS.BAG_OUT,
				index: game => game.frameIndex,
				hidden: game => !game.bagOpening,
			},
		],
	},
);