const year = new Date().getFullYear();
const game = {
	firstScene: "intro",
	inventory: [
		"gun",
	],
	assets: [
		["alphabet.png", 6, 9],
		["secret-agent.png"],
		["hitler.png"],
		["time-traveler.png",64,64, 15],
		["time-traveler-speak.png",64,64, 16],
		["handing-gun.png"],
		["time-machine.png",64,64],
		["baby.png", 64, 64, 40],
		["inventory.png", 64, 64],
		["gun-inventory.png", 64, 64],
		["background.png", 64, 64],
		["cross.png", 64, 64],
		["cross-dropped.png", 64, 64, 8],
		["pen.png", 64, 64],
		["gun.png", 64, 64],
		["mask.png", 64, 64],
		["picture-frame.png", 64, 64],
		["window.png", 64, 64],
		["pen-inventory.png", 64, 64],
		["pen-cursor.png", 64, 64],
		["mustache.png", 64, 64],
		["exit.png", 64, 64],
		["back-stab.png", 64, 64, 5],
		["exit-death.png", 64, 64, 70],
		["back-shot.png", 64, 64, 2],
		["gun-shot.mp3"],
		["kill-baby-hitler.mp3"],
		["time-traveler-beard.png", 64, 64, 16],
		["alien.png", 64, 64, 16, 'fixcolor'],
		["future-song.mp3"],
		["random.mp3"],
		["f1.mp3"],
		["f2.mp3"],
		["f3.mp3"],
		["f4.mp3"],
		["wooo.mp3"],
		["soft-song.mp3"],
		["dumb-founded.png", 64, 64],
		["dumb-founded-speak.png", 64, 64, 7],
		["alien-speak.png", 64, 64, 6, 'fixcolor'],
		["alien-song.mp3"],
		["languages.png", 64, 64, 7],
		["what-are-yu-doin.png", 64, 64, 8],
		["alien-close.png", 64, 64, 1, 'fixcolor'],
		["black-bar.png", 64, 64],
		["alien-very-close.png", 64, 64, 1, 'fixcolor'],
		["dumb-founded-happy.png", 64, 64, 7],
		["saucer.png", 64, 64],
		["soup-chou.mp3"],
		["ending1.png", 64, 64, 2],
		["ending2.png", 64, 64, 2],
		["ending3.png", 64, 64, 2],
		["ending4.png", 64, 64, 2],
	],
	scenes: [
		{
			name: "intro",
			background: "#000000",
			fadeIn: 0xFFFFFF,
			next: 1,
		},
		{
			sprites: [
				["text", 2, 20, " this is \n a visual\n novel", "progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["text", 6, 10, " written\n   by\n\n  jack\nlehamster", "progressive"],
			],
			next: 1,
		},
		{
			name: "rules",
			fadeOut: 0x000000,
			sprites: [
				["text", 6, 8, " 64 x 64\n pixels\n\n four\n colors", "progressive"],
			],
			next: 1,
		},
		{
			name: "start-game",
			fadeIn: 0x000000,
			fadeOut: 0x000000,
			sprites: [
				["hitler"],
				["text", 38, 20, "kill"],
				["text", 36, 41, "baby"],
				["text", 26, 52, "hitler"],
				["gun-shot", 0, 0, 1000],
				["kill-baby-hitler", 0, 0, 2000],
			],
			next: 1,
		},
		{			
			sprites: [
				["future-song", 0, 0, 0, "loop"],
				["time-traveler"],
				["time-traveler-beard.0",0,0,"ifequal",['mission',3]],
			],
			next: 1,
		},
		{
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"welcome to\nthe agency",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"i hope you\nare ready",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"for your\nfirst\nmission.",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"many have\npreviously\nfailed.",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["time-traveler-speak"],
				["time-traveler-beard",0,0,"ifequal",['mission',3]],
				["text", 2, 36,
					"who is the\ntarget?",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"first, let\nme tell\nyou",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"about our\nagency.",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"our work\nis highly\nclassified.",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"we fix\nhistorical\nmisteps",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"caused by\nmankind",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"by going\ninto the\npast.",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["time-traveler-speak"],
				["time-traveler-beard",0,0,"ifequal",['mission',3]],
				["text", 2, 36,
					"time\ntravel?",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"precisely.",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"the target",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"is the one\nwho will\nlater",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"be the\ncause of",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"millions\nof\nlives lost.",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["hitler"],
				["text", 2, 36,
					"\nthat's...\nhitler!",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["time-traveler-speak"],
				["time-traveler-beard",0,0,"ifequal",['mission',3]],
				["text", 2, 36,
					"this will\nnot be a\nproblem.",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["time-traveler-speak"],
				["time-traveler-beard",0,0,"ifequal",['mission',3]],
				["text", 2, 36,
					"i hate the\nbastard!",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"there is\none detail..",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"we can\nonly send\nyou",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"back to\n1889",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"the year\nhe was\nborn.",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"you will\nhave\n24 hours",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"to kill\nthe\ninfant",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"known as\nadolf\nhitler.",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["time-traveler-speak"],
				["time-traveler-beard",0,0,"ifequal",['mission',3]],
				["text", 2, 36,
					"you are\nasking me\nto...",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["time-traveler-speak"],
				["time-traveler-beard",0,0,"ifequal",['mission',3]],
				["text", 2, 36,
					"kill baby\nhitler?",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"it will\nbe your\nduty,",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"should you\naccept",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"this\nmission.",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"please,\ntake\nthe gun.",
					"progressive"],
			],
			next: 1,
		},
		{
			background: "#ae5e32",
			sprites: [
				["handing-gun", 0, 0, 'from-top'],
			],
			onIdle: [
				{
					delay: 12000,
					next: "impatient",
				}
			],
			next: "accept-mission",
		},
		{
			name: "accept-mission",
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"great\ni hope\nyou are",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"commited\nto\nfullfill",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"this\nmission.",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"you'll be\nlocated in\na room",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"where you\nwill find\nthe target.",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"once you\npull the\ntrigger,",
					"progressive"],
			],
			next: 1,
		},
		{
			fadeOut: 0x000000,
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					`you'll be\nsent back\nto ${year}.`,
					"progressive"],
			],
			next: 1,
		},
		{
			name: "time-machine",
			fadeIn: 0x000000,
			fadeOut: 0xFFFFFF,
			sprites: [
				["time-machine", 0, 0, 'appendvar', 'mission'],
				["text", 2, 46, "wait,\nwhat if...", "progressive-next"],
			],
			next: 1,
			onFadeOut: [
				{ stopSong: 'future-song' },
				{ playSong: 'random' },
			],
		},
		{
			frameRate: 5,
			name: "baby-hitler",
			enableInventory: true,
			fadeIn: 0xFFFFFF,
			sprites: [
				["soft-song", 0.5, 0, 2000, 'loop'],
				["background"],
				["window"],
				["cross", 0, 0, 'ifnotvar', 'cross-gone'],
				["pen", 0, 0, 'ifnotvar', 'pen-gone'],
				["picture-frame"],
				["draw-dots", 0, 0, 'holes', 'black'],
				["baby", 0, 0, 'loop'],
				["mustache", 0, 0, 'ifvar', 'baby-hitler'],
				["alien", 0, 0, 'ifvar', 'alien'],
				["cross-cursor", 0, 0, 'ifselected', 'gun'],
				["pen-cursor/cursor", -30, 0, 'ifselected', 'pen'],
				["gun", 0, 0, 'ifselected', 'gun'],
			],
			onIdle: [
				{
					ifgreaterequal: ['mission', 5],
					delay: 3000,
					setCache: "alien",
					value: true,
				},
				{
					ifgreaterequal: ['mission', 5],
					delay: 3100,
					clearCache: "mission",
				},
			],			
			onClick: [
				{
					name: "alien",
					ifselected: null,
					actions: [
						{ tip: [
							"???",
						]},
					],
				},
				{
					name: "alien",
					ifselected: 'gun',
					actions: [
						{ removeSprite: "cross-cursor" },
						{ stopSong: "soft-song", },
						{ playSound: 'wooo' },
						{ next: "alien" },
					],
				},
				{
					name: "mask",
					ifselected: 'gun',
					actions: [
						{ playSound: 'gun-shot' },
						{ stopSong: "soft-song" },
						{ removeSprite: "cross-cursor" },
						{ replaceSprite: ["baby", "baby.0"] },
						{ next: 1, fadeOut: 0xae5e32 },
					],
				},
				{
					name: "mask", ifselected: null, ifvisible: 'mustache',
					actions: [
						{ tip: [
							"now, that's definitly baby hitler.",
							"i have less remorse killing a baby that looks like hitler.",
							"hum... it still doesn't feel quite right.",
							"I really have to make a decision.",
						]},
					],
				},
				{
					name: "mask", ifselected: null,
					actions: [
						{ tip: [
							"so, that's baby hitler.",
							"it's the target I must eliminate.",
							"do I really have to kill a baby?",
							"this individual is responsible for countless deaths.",
							"he seems rather cute.",
							"he's a murdering monster!",
							"he looks so innocent as a baby.",
							"I have to make a decision.",
						]},
					],
				},
				{
					name: "mask", ifselected: 'pen',
					actions: [
						{ tip: [
							"there, that looks more like it.",
						]},
						{ setCache: "baby-hitler", value: true },
//						{ removeSprite: "pen-cursor/cursor" },
						{ removeInventory: 'pen' },
						{ selectItem: null },
						{ trigger: "baby-hitler", medal: "Baby Hitler" },
					],
				},
				{
					name: "pen", ifselected: null, ifvisible: 'pen',
					actions: [
						{ tip: [
							"hum... what a strange looking pen for 1889! I'll just take it.",
						]},
						{ setCache: "pen-gone", value: true },
						{ removeSprite: "pen", addInventory: "pen" },
					],
				},
				{
					name: "picture-frame", ifselected: null,
					actions: [
						{ tip: [
							"mother and child both look happy. if only they knew...",
						]},
					],
				},				
				{
					name: "cross", ifselected: null,
					actions: [
						{ tip: [
							"it's a cross with Jesus on it.",
						]},
					],
				},				
				{
					name: "window", ifselected: null,
					actions: [
						{ tip: [
							"the moon looks beautiful tonight.",
						]},
					],
				},
				{
					name: "picture-frame", ifselected: 'pen',
					actions: [
						{ tip: [
							"I have no use in defacing this photo.",
						]},
						{ removeSprite: "pen-cursor" },
						{ selectItem: null },
					],
				},
				{
					name: "window", ifselected: 'pen',
					actions: [
						{ tip: [
							"I don't really need that pen.",
						]},
						{ clearCache: "pen-gone" },
						{ replaceSprite: ["pen", "pen"] },
//						{ removeSprite: "pen-cursor/cursor" },
						{ removeInventory: 'pen' },
						{ selectItem: null },
					],
				},
				{
					name: "cross", ifselected: 'pen',
					actions: [
						{ tip: [
							"I have no use in defacing jesus.",
						]},
						{ removeSprite: "pen-cursor" },
						{ selectItem: null },
					],
				},
				{
					name: "window",
					ifselected: 'gun',
					actions: [
						{ removeSprite: "cross-cursor" },
						{ next: "missed-shot", fadeOut: 0xFFFFFF },
						{ playSound: 'gun-shot' },
						{ stopSong: "soft-song" },
					],
				},
				{
					name: "cross",
					ifselected: 'gun',
					actions: [
						{ setCache: "cross-gone", value: true },
						{ removeSprite: "cross-cursor" },
						{ next: "missed-shot", fadeOut: 0xFFFFFF },
						{ dropSprite: "cross" },
						{ playSound: 'gun-shot' },
						{ stopSong: "soft-song" },
					],
				},
				{
					name: "picture-frame",
					ifselected: 'gun',
					actions: [
						{ removeSprite: "cross-cursor" },
						{ next: "missed-shot", fadeOut: 0xFFFFFF },
						{ playSound: 'gun-shot' },
						{ stopSong: "soft-song" },
						{ addDot: "holes" },
					],
				},
				{
					name: "background",
					ifselected: 'gun',
					actions: [
						{ removeSprite: "cross-cursor" },
						{ next: "missed-shot", fadeOut: 0xFFFFFF },
						{ playSound: 'gun-shot' },
						{ stopSong: "soft-song" },
					],
				},
			],
		},
		{
			background: "#ae5e32",
			sprites: [
				["text", 2, 20, "after you\npull the\ntrigger...", "progressive"],
			],
			next: 1,
		},
		{
			background: "#ae5e32",
			sprites: [
				["text", 2, 15, "you feel\nas if time\nis frozen\n...", "progressive"],
			],
			next: 1,
		},
		{
			background: "#ae5e32",
			sprites: [
				["text", 2, 15, "and your\nlifeforce\nslowly\nvanish\n...", "progressive"],
			],
			next: 1,
		},
		{
			background: "#ae5e32",
			sprites: [
				["text", 2, 10, "history\n\nhas been\n\naltered.", "progressive"],
			],
			next: 1,
		},
		{
			background: "#ae5e32",
			sprites: [
				["text", 2, 15, "for better\nor worse?\n\nwho knows.", "progressive"],
			],
			next: 1,
		},
		{
			background: "#ae5e32",
			sprites: [
				["text", 2, 15, "but there\nis one\nthing you\nknow.", "progressive"],
			],
			next: 1,
		},
		{
			background: "#ae5e32",
			sprites: [
				["text", 2, 15, "by\ncompleting\nyour\nmission,", "progressive"],
			],
			next: 1,
		},
		{
			background: "#ae5e32",
			sprites: [
				["text", 2, 10, `you have\ncreated\na new\nreality\nfor ${year}.`, "progressive"],
			],
			next: 1,
		},
		{
			background: "#ae5e32",
			sprites: [
				["text", 2, 20, `one in\nwhich...`, "progressive"],
			],
			next: 1,
		},
		{
			background: "#ae5e32",
			fadeOut: 0xae5e32,
			sprites: [
				["text", 2, 18, `you do not\n\nexist.`, "progressive"],
			],
			next: 1,
		},
		{
			clearCache: [ 
				'mission', 'baby-hitler', 'pen-gone', 'cross-gone', 'alien', 'holes'],
			fadeIn: 0xae5e32,
			background: "#FFFFFF",
			fadeOut: 0xFFFFFF,
			sprites: [
				["f1", 0, 0, 0, "loop"],
				["text", 10, 25, "THE END"],
				["ending1", 0, 0, 'loop'],
				["ending2.0", 0, 0, "ifvar", "ending2"],
				["ending3.0", 0, 0, "ifvar", "ending3"],
				["ending4.0", 0, 0, "ifvar", "ending4"],
			],
			onFadeOut: [
				{ stopSong: 'f1' },
				{ playSong: 'wooo' },
			],
			onIdle: [
				{
					delay: 100,
					setCache: "ending1",
				},
				{ trigger: "mission-accomplished", medal: "Mission Accomplished" },
			],			
			next: "start-game",
		},
		{
			name: "missed-shot",
			background: "#ffffff",
			next: 1,
		},
		{
			fadeIn: 0xFFFFFF,
			sprites: [
				["time-machine", 0, 0, 'appendvar', 'mission'],
				["random"],
			],
			next: 1,
		},
		{
			sprites: [
				["future-song", 0, 0, 0, "loop"],
				["secret-agent"],
			],
			next: 1,
		},
		{
			sprites: [
				["time-traveler"],
				["time-traveler-beard.0",0,0,"ifequal",['mission',3]],
			],
			next: 1,
		},
		{
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"looks like\nyou missed\nyour shot,",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"on a still\ntarget",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"at point\nblank.",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"mind tell\nme what\nhappened?",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["time-traveler-speak"],
				["time-traveler-beard",0,0,"ifequal",['mission',3]],
				["text", 2, 36,
					"I couldn't\naim right.",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["time-traveler-speak"],
				["time-traveler-beard",0,0,"ifequal",['mission',3]],
				["text", 2, 36,
					"the target\nwas too\ntiny.",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"i see...\nno matter\nthe",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"gravity\nof the\nsituation,",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"your sense\nof sarcasm",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"remains\nunshaken.",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["time-traveler-speak"],
				["time-traveler-beard",0,0,"ifequal",['mission',3]],
				["text", 2, 36,
					"i have\nalways\nregretted",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["time-traveler-speak"],
				["time-traveler-beard",0,0,"ifequal",['mission',3]],
				["text", 2, 36,
					"giving up\non my",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["time-traveler-speak"],
				["time-traveler-beard",0,0,"ifequal",['mission',3]],
				["text", 2, 36,
					"career\nas a\ncomedian.",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"yea what a\nwaste of\ntalent.",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"well, got\ngood news\nfor you.",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"since you\nfailed the\nmission,",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"you will\nbe\ndismissed",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"from our\nagency.",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"i'll show\nyou\nthe door",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"you are\nfree\nto go.",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["time-traveler-speak"],
				["time-traveler-beard",0,0,"ifequal",['mission',3]],
				["text", 2, 36,
					"thanks,\ni'll be on\nmy way.",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["time-traveler-speak"],
				["time-traveler-beard",0,0,"ifequal",['mission',3]],
				["text", 2, 36,
					"I guess I\nwon't be\nseeing you",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["time-traveler-speak"],
				["time-traveler-beard",0,0,"ifequal",['mission',3]],
				["text", 2, 36,
					"any time",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["time-traveler-speak"],
				["time-traveler-beard",0,0,"ifequal",['mission',3]],
				["text", 2, 36,
					"in the\nnear\nfuture.",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"that,\ni can\nassure you.",
					"progressive"],
			],
			next: 1,
		},
		{
			fadeOut: 0x000000,
			sprites: [
				["future-song", 0, 0, 0, "fade"],
				["secret-agent"],
				["text", 2, 36,
					"farewell.",
					"progressive"],
			],
			next: 1,
		},
		{
			name: "exit",
			fadeIn: 0x000000,
			sprites: [
				["exit.0"],
			],
			next: 1,
		},
		{
			sprites: [
				["exit.0"],
				["back-stab.0", 0, 0, 'from-right'],
			],
			next: 1,
		},
		{
			frameRate: 10,
			sprites: [
				["exit.0"],
				["back-stab"],
			],
			next: 1,
		},
		{
			frameRate: 10,
			fadeOut: 0xae5e32,
			sprites: [
				["exit-death"],
				["back-shot"],
				["gun-shot"],
			],
			next: 1,
		},
		{
			clearCache: [ 'alien' ],
			incrementCache: 'mission',
			background: "#ae5e32",
			fadeOut: 0xFFFFFF,
			sprites: [
				["f3", 0, 0, 0, "loop"],
				["text", 10, 25, "THE END"],
				["ending1.0", 0, 0, "ifvar", "ending1"],
				["ending2", 0, 0, 'loop'],
				["ending3.0", 0, 0, "ifvar", "ending3"],
				["ending4.0", 0, 0, "ifvar", "ending4"],
			],
			onFadeOut: [
				{ stopSong: 'f3' },
				{ playSong: 'wooo' },
			],
			onIdle: [
				{
					delay: 100,
					setCache: "ending2",
				},
				{ trigger: "mission-failed", medal: "Mission Failed" },
			],			
			next: "start-game",
		},
		{
			name: "impatient",
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"perhaps, I\ndid not",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"make\nmyself\nclear",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"you are\nunder my\ncommand",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"and I am\ngiving you",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"a direct\norder.",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"I will\ngive you",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"another\nchance.",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"take the\ngun, now!",
					"progressive"],
			],			
			next: 1,
		},
		{
			background: "#ae5e32",
			sprites: [
				["handing-gun", 0, 0, 'from-top'],
			],
			onIdle: [
				{
					delay: 15000,
					next: 1,
				}
			],
			next: "accept-mission",
		},
		{
			name: "impatient-2",
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"it seems\nlike we\nare having",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"a little\nproblem.",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"mind\nsharing\nwith me",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"what's on\nyour mind?",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["time-traveler-speak"],
				["time-traveler-beard",0,0,"ifequal",['mission',3]],
				["text", 2, 36,
					"I don't\nthink I am",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["time-traveler-speak"],
				["time-traveler-beard",0,0,"ifequal",['mission',3]],
				["text", 2, 36,
					"the right\nperson",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["time-traveler-speak"],
				["time-traveler-beard",0,0,"ifequal",['mission',3]],
				["text", 2, 36,
					"for this\nkind of\njob.",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"are you\ntelling me",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"you can't\neven kill\n...",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"...\na baby?",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["time-traveler-speak"],
				["time-traveler-beard",0,0,"ifequal",['mission',3]],
				["text", 2, 36,
					"babies are\nmy weak\nspot.",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"I see...\nmy mistake.",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"I thought",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"I could\ncount on\nyou.",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"but you're\njust a\nsheep.",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"you're not\nbrave\nenough",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"to make\nthe hard\ndecisions.",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"you let\nsomeone\nelse",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"do the\ndirty\nwork.",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"you are\ndismissed.",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"go home,\nlie on\nyour couch",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"and watch\nsome TV.",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"get out of\nmy sight,",
					"progressive"],
			],
			next: 1,
		},
		{
			fadeOut: 0x000000,
			sprites: [
				["future-song", 0, 0, 0, "fade"],
				["secret-agent"],
				["text", 2, 36,
					"you\ndisgust\nme!",
					"progressive"],
			],
			next: 1,
		},
		{
			name: "exit",
			fadeIn: 0x000000,
			fadeOut: 0xd8a184,
			sprites: [
				["exit.0"],
			],
			next: 1,
		},
		{
			name: "sheep-end",
			background: "#d8a184",
			fadeOut: 0xFFFFFF,
			sprites: [
				["f2", 0, 0, 0, "loop"],
				["text", 10, 25, "THE END"],
				["ending1.0", 0, 0, "ifvar", "ending1"],
				["ending2.0", 0, 0, "ifvar", "ending2"],
				["ending3", 0, 0, 'loop'],
				["ending4.0", 0, 0, "ifvar", "ending4"],
			],
			onFadeOut: [
				{ stopSong: 'f2' },
				{ playSong: 'wooo' },
			],
			onIdle: [
				{
					delay: 100,
					setCache: "ending3",
				},
				{ trigger: "sheep", medal: "Sheep" },
			],			
			next: "start-game",
		},
		{
			name: "alien",
			sprites: [
				["alien-song", 0, 0, 0, "loop"],
				["background"],
				["window"],
				["cross", 0, 0, 'ifnotvar', 'cross-gone'],
				["pen", 0, 0, 'ifnotvar', 'pen-gone'],
				["picture-frame"],
				["baby", 0, 0, 'loop'],
				["mustache", 0, 0, 'ifvar', 'baby-hitler'],
				["alien-speak", 0, 0, 'loop'],
				["text", 40, 5, "A!.\ni!Dp"],
			],			
			next: 1,
		},
		{
			sprites: [
				["background"],
				["window"],
				["cross", 0, 0, 'ifnotvar', 'cross-gone'],
				["pen", 0, 0, 'ifnotvar', 'pen-gone'],
				["picture-frame"],
				["baby", 0, 0, 'loop'],
				["mustache", 0, 0, 'ifvar', 'baby-hitler'],
				["alien-speak", 0, 0, 'loop'],
				["text", 35, 5, ";!u\nO! 4"],
			],			
			next: 1,
		},
		{
			sprites: [
				["background"],
				["window"],
				["cross", 0, 0, 'ifnotvar', 'cross-gone'],
				["pen", 0, 0, 'ifnotvar', 'pen-gone'],
				["picture-frame"],
				["baby", 0, 0, 'loop'],
				["mustache", 0, 0, 'ifvar', 'baby-hitler'],
				["alien-speak", 0, 0, 'loop'],
				["text", 35, 5, "xxd\n;;ol"],
			],			
			next: 1,
		},
		{
			sprites: [
				["background"],
				["window"],
				["cross", 0, 0, 'ifnotvar', 'cross-gone'],
				["pen", 0, 0, 'ifnotvar', 'pen-gone'],
				["picture-frame"],
				["baby", 0, 0, 'loop'],
				["mustache", 0, 0, 'ifvar', 'baby-hitler'],
				["alien-speak", 0, 0, 'loop'],
				["text", 35, 5, ";!\nO!l"],
			],
			next: 1,
		},
		{
			sprites: [
				["alien-song", 0, 0, 0, "stop"],
				["dumb-founded"],
			],
			next: 1,
		},
		{
			sprites: [
				["dumb-founded"],
				["text", 2, 36,
					"Whaaa....",
					"progressive"],
			],
			next: 1,
		},
		{
			frameRate: 30,
			sprites: [
				["alien-song", 0, 0, 0, "loop"],
				["background"],
				["window"],
				["cross", 0, 0, 'ifnotvar', 'cross-gone'],
				["pen", 0, 0, 'ifnotvar', 'pen-gone'],
				["picture-frame"],
				["baby", 0, 0, 'loop'],
				["mustache", 0, 0, 'ifvar', 'baby-hitler'],
				["alien-speak", 0, 0, 'loop'],
				["languages", 0, 0, 'loop'],
			],
			next: 1,
		},
		{
			sprites: [
				["background"],
				["window"],
				["cross", 0, 0, 'ifnotvar', 'cross-gone'],
				["pen", 0, 0, 'ifnotvar', 'pen-gone'],
				["picture-frame"],
				["baby", 0, 0, 'loop'],
				["mustache", 0, 0, 'ifvar', 'baby-hitler'],
				["alien-speak", 0, 0, 'loop'],
				["what-are-yu-doin"],
			],
			next: 1,
		},
		{
			sprites: [
				["alien-song", 0, 0, 0, "stop"],
				["dumb-founded-speak.0"],
			],
			next: 1,
		},
		{
			background: "#d8a184",
			sprites: [
				["black-bar"],
				["text", 2, 36,
					"i said\nwhat are\nyu doin",
					"progressive"],
				["alien-close"],
			],
			next: 1,
		},
		{
			sprites: [
				["alien-song", 0, 0, 0, "stop"],
				["dumb-founded-speak.0"],
			],
			next: 1,
		},
		{
			sprites: [
				["dumb-founded-speak"],
				["text", 2, 36,
					"What are\nyou?",
					"progressive"],
			],
			next: 1,
		},
		{
			background: "#d8a184",
			sprites: [
				["black-bar"],
				["text", 2, 36,
					"imma yupa.\nam here\nto stop",
					"progressive"],
				["alien-close"],
			],
			next: 1,
		},
		{
			background: "#d8a184",
			sprites: [
				["black-bar"],
				["text", 2, 36,
					"idiots\nlike you\nfrom",
					"progressive"],
				["alien-close"],
			],
			next: 1,
		},
		{
			background: "#d8a184",
			sprites: [
				["black-bar"],
				["text", 2, 36,
					"crashing\nspace time\ncontinuum",
					"progressive"],
				["alien-close"],
			],
			next: 1,
		},
		{
			sprites: [
				["dumb-founded-speak"],
				["text", 2, 36,
					"space..\nwait..\nwhat?!",
					"progressive"],
			],
			next: 1,
		},
		{
			name:"x",
			background: "#d8a184",
			sprites: [
				["black-bar"],
				["text", 2, 36,
					"it's five\ntimes\nalready",
					"progressive"],
				["alien-close"],
			],
			next: 1,
		},
		{
			background: "#d8a184",
			sprites: [
				["black-bar"],
				["text", 2, 36,
					"you travel\nback thru\ntame..",
					"progressive"],
				["alien-close"],
			],
			next: 1,
		},
		{
			background: "#d8a184",
			sprites: [
				["black-bar"],
				["text", 2, 36,
					"what the\nhall are\nyu doin?",
					"progressive"],
				["alien-close"],
			],
			next: 1,
		},
		{
			sprites: [
				["dumb-founded-speak"],
				["text", 2, 36,
					"i'm just..\ni was sent\nback...",
					"progressive"],
			],
			next: 1,
		},
		{
			background: "#d8a184",
			sprites: [
				["black-bar"],
				["text", 2, 36,
					"whaa\nwhaaaa\nwhaaaat?",
					"progressive"],
				["alien-close"],
			],
			next: 1,
		},
		{
			sprites: [
				["dumb-founded-speak"],
				["text", 2, 36,
					"i was sent\nback\nthru tame",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["dumb-founded-speak"],
				["text", 2, 36,
					"to kill\nbaby\nhitler!",
					"progressive"],
			],
			next: 1,
		},
		{
			background: "#d8a184",
			sprites: [
				["black-bar"],
				["text", 2, 36,
					"baby?\nwhat's a\nbaby?",
					"progressive"],
				["alien-close"],
			],
			next: 1,
		},
		{
			sprites: [
				["dumb-founded-speak"],
				["text", 2, 36,
					"that's the\ncute\nthing",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["dumb-founded-speak"],
				["text", 2, 36,
					"right\nbehind\nyou.",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["baby", 0, 0, 'loop'],
				["mustache", 0, 0, 'ifvar', 'baby-hitler'],
			],
			next: 1,
		},
		{
			background: "#d8a184",
			sprites: [
				["black-bar"],
				["text", 2, 36,
					"dats\ncute?",
					"progressive"],
				["alien-close"],
			],
			next: 1,
		},
		{
			sprites: [
				["dumb-founded-speak"],
				["text", 2, 36,
					"well not\nreally,\nhe's also",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["dumb-founded-speak"],
				["text", 2, 36,
					"a future\nmass\nmurderer.",
					"progressive"],
			],
			next: 1,
		},
		{
			background: "#d8a184",
			sprites: [
				["black-bar"],
				["text", 2, 36,
					"then whai\nnot kill?",
					"progressive"],
				["alien-close"],
			],
			next: 1,
		},
		{
			sprites: [
				["dumb-founded-speak"],
				["text", 2, 36,
					"I can't\nkill a\nbaby!",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["dumb-founded-speak"],
				["text", 2, 36,
					"I can't\nkill\nsomething",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["dumb-founded-speak"],
				["text", 2, 36,
					"that\ncute!",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["dumb-founded-speak"],
				["text", 2, 36,
					"also, if i\nkill this\nbaby,",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["dumb-founded-speak"],
				["text", 2, 36,
					"it will\ncreate",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["dumb-founded-speak"],
				["text", 2, 36,
					`a new\nreality\nfor ${year}`,
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["dumb-founded-speak"],
				["text", 2, 36,
					"in which\ni don't\nexist!",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["dumb-founded-speak"],
				["text", 2, 36,
					"so i will\ndisappear!",
					"progressive"],
			],
			next: 1,
		},
		{
			background: "#d8a184",
			sprites: [
				["black-bar"],
				["text", 2, 36,
					"wait...\nhow do you\nknow that?",
					"progressive"],
				["alien-close"],
			],
			next: 1,
		},
		{
			sprites: [
				["dumb-founded-speak"],
				["text", 2, 36,
					"trust me.\ni know!",
					"progressive"],
			],
			next: 1,
		},
		{
			background: "#d8a184",
			sprites: [
				["black-bar"],
				["text", 2, 36,
					"then, dont\nkill the\nbaby.",
					"progressive"],
				["alien-close"],
			],
			next: 1,
		},
		{
			sprites: [
				["dumb-founded-speak"],
				["text", 2, 36,
					"it's no\nuse. they\nwill send",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["dumb-founded-speak"],
				["text", 2, 36,
					"another\nhitman",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["dumb-founded-speak"],
				["text", 2, 36,
					"from the\nfuture\nto kill",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["dumb-founded-speak"],
				["text", 2, 36,
					"baby\nhitler!",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["dumb-founded-speak"],
				["text", 2, 36,
					"this will\nnever end!",
					"progressive"],
			],
			next: 1,
		},
		{
			background: "#d8a184",
			sprites: [
				["black-bar"],
				["text", 2, 36,
					"hum.. i\nthink yu\nmistaken",
					"progressive"],
				["alien-close"],
			],
			next: 1,
		},
		{
			background: "#d8a184",
			sprites: [
				["black-bar"],
				["text", 2, 36,
					"becoze\nyu see",
					"progressive"],
				["alien-close"],
			],
			next: 1,
		},
		{
			background: "#d8a184",
			sprites: [
				["black-bar"],
				["text", 2, 36,
					`if you not\ngo back\nto ${year}.`,
					"progressive"],
				["alien-close"],
			],
			next: 1,
		},
		{
			background: "#d8a184",
			sprites: [
				["black-bar"],
				["text", 2, 36,
					"that\nfuture\n...",
					"progressive"],
				["alien-close"],
			],
			next: 1,
		},
		{
			background: "#d8a184",
			sprites: [
				["black-bar"],
				["text", 2, 36,
					"will never\nexist!",
					"progressive"],
				["alien-very-close"],
			],
			next: 1,
		},
		{
			sprites: [
				["dumb-founded"],
			],
			next: 1,
		},
		{
			background: "#d8a184",
			sprites: [
				["black-bar"],
				["text", 2, 36,
					"so, what\ndo yu say?",
					"progressive"],
				["alien-very-close"],
			],
			next: 1,
		},
		{
			sprites: [
				["dumb-founded-speak"],
				["text", 2, 36,
					"thanks,\nbut what\nwill i do",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["dumb-founded-speak"],
				["text", 2, 36,
					"in 1889?\nthere's no\ninternet!",
					"progressive"],
			],
			next: 1,
		},
		{
			background: "#d8a184",
			sprites: [
				["black-bar"],
				["text", 2, 36,
					"why not go\nwith me on\nsaucer",
					"progressive"],
				["alien-close"],
			],
			next: 1,
		},
		{
			background: "#d8a184",
			sprites: [
				["black-bar"],
				["text", 2, 36,
					"and travel\nthrough\nspace!",
					"progressive"],
				["alien-close"],
			],
			next: 1,
		},
		{
			sprites: [
				["dumb-founded-happy"],
				["text", 2, 36,
					"yes! that\nsounds\nawesome!",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["dumb-founded-happy"],
				["text", 2, 36,
					"visit all\nvarious\nplanets!",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["dumb-founded-happy"],
				["text", 2, 36,
					"meet sexy\nalien\nladies!",
					"progressive"],
			],
			next: 1,
		},
		{
			background: "#d8a184",
			sprites: [
				["black-bar"],
				["text", 2, 36,
					"great, i'm\nglad yu\nlike dat!",
					"progressive"],
				["alien-close"],
			],
			next: 1,
		},
		{
			background: "#d8a184",
			sprites: [
				["black-bar"],
				["text", 2, 36,
					"then letz\ngo right\naway!",
					"progressive"],
				["alien-close"],
			],
			next: 1,
		},
		{
			sprites: [
				["dumb-founded-happy"],
				["text", 2, 36,
					"wait, one\nmore\nthing.",
					"progressive"],
			],
			next: 1,
		},
		{
			name: "can-we-take",
			sprites: [
				["baby", 0, -20, 'loop'],
				["mustache", 0, -20, 'ifvar', 'baby-hitler'],
				["black-bar"],
				["text", 2, 36,
					"can we\ntake\nthe baby?",
					"progressive"],
			],
			next: 1,
		},
		{
			background: "#d8a184",
			sprites: [
				["black-bar"],
				["text", 2, 36,
					"sure, why\nnot?",
					"progressive"],
				["alien-close"],
			],
			next: 1,
		},
		{
			background: "#d8a184",
			sprites: [
				["black-bar"],
				["text", 2, 36,
					"take\nanythin\nyou want!",
					"progressive"],
				["alien-close"],
			],
			next: 1,
		},
		{
			sprites: [
				["dumb-founded-happy"],
				["text", 2, 36,
					"great then\nlet's go\nto space",
					"progressive"],
			],
			next: 1,
		},
		{
			fadeOut: 0,
			sprites: [
				["dumb-founded-happy"],
				["text", 2, 36,
					"me, yupa,\nand baby\nhitler!",
					"progressive"],
			],
			onFadeOut: [
				{ playSong: 'wooo' },
			],
			next: 1,
		},
		{
			name: 'starfield',
			sprites: [
				["starfield"],
				["soup-chou", 0, 0, 0, "loop"],
				["saucer/cursor", -32, -32],
				["text", 10, 25, "THE END"],
				["ending1.0", 0, 0, "ifvar", "ending1"],
				["ending2.0", 0, 0, "ifvar", "ending2"],
				["ending3.0", 0, 0, "ifvar", "ending3"],
				["ending4", 0, 0, 'loop'],
			],
			onIdle: [
				{
					delay: 100,
					setCache: "ending4",
				},
				{ trigger: "alien", medal: "Alien" },
			],			
			scroll: [
				"this was a",
				"game by",
				"jack le",
				"hamster",
				"produced",
				"for",
				"a bunch of",
				"gamejams",
				"thanks for",
				"trying out",
				"this",
				"weirdo",
				"game and",
				"feel free",
				"to leave a",
				"comment",
				"below",
				"and tell",
				"me;",
				"would you",
				"travel",
				"back in",
				"time to",
				"kill",
				"baby",
				"hitler",
			].join("\n\n"),
		},
	],	
};




