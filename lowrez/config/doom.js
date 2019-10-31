gameConfig.scenes.push(
	{
		name: "doom",
		onScene: game => {
			game.playTheme(null);
			game.hideCursor = true;
			game.showTip([
				"And that was it.",
				"I took those painkillers, prescribed by Yupa and the doctor,",
				"Laid on the bench, and closed my eyes.",
				"My life as the hitman who was supposed to kill Baby Hitler, ended here.",
				"I would simply vanish, as if I never existed.",
				"Future generations will live in peace, not ever knowing what it was like...",
				"to live in a world, where Hitler rose to power.",
				"As I contemplate that future I imagined, my mind started to fade, peacefully...",
				"Actually, it didn't really feel that peaceful at all, I was feeling pain",
				"Hey, did that medecine they give me really work? I'm feeling very painful here!",
				"The pain, the suffering, it is getting worst and worst...",
				"Is this really how it feels like to die!?!",
				"I've never felt pain like this my whole life, this is absolute torture!",
				"My brain, my limbs, my genitals, everything in my body feels like it's being ripped apart by demons!!",
				"The sensation of drenched in acide bath...",
				"The feeling of being fried in burning oil...",
				"The  of being impaled on a stick...",
				"All those feelings overwhelm me at the same time.",
				"This is worst than hell! Please get me out of here!",
				"PUT ME OUT OF MY MISERY!!!!....",
			], game => {
				game.gotoScene("human-woke");
			}, 100, {maxLines: 10});
		},
		sprites: [
			{
				custom: (game, sprite, ctx) => {
					const time = game.now - game.sceneTime;
					const hex = (100 + Math.floor(Math.random() * 30 * Math.min(1, Math.max(0, time - 40000)/30000))).toString().substr(1);
					ctx.fillStyle = `#${hex}0000`;
					ctx.fillRect(0, 0, 64, 64);
				},
			},
		],
	},
);