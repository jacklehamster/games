const year = new Date().getFullYear();
const game = {
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
	],
	firstScene: "intro",
	scenes: [
		{
			name: "intro",
			background: "#000000",
			fadeIn: 0xFFFFFF,
			next: 1,
		},
		{
			fadeIn: 0x000000,
			fadeOut: 0x000000,
			sprites: [
				["hitler"],
				["text", 38, 20, "kill"],
				["text", 36, 41, "baby"],
				["text", 26, 52, "hitler"],
			],
			next: 1,
		},
		{
			sprites: [
				["text", 6, 20, "this is", "progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["text", 6, 10, "a game by\n\n  jack\nlehamster", "progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["text", 6, 6, "produced\n  for\n\n really\n retro\n gamejam", "progressive"],
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
			sprites: [
				["time-traveler"],
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
				["text", 2, 36,
					"this will\nnot be a\nproblem.",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["time-traveler-speak"],
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
					"to kill\nthe\ntoddler",
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
				["text", 2, 36,
					"you are\nasking me\nto...",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["time-traveler-speak"],
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
			next: 1,
		},
		{
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
			fadeIn: 0x000000,
			fadeOut: 0xFFFFFF,
			sprites: [
				["time-machine", 0, 0, 'appendvar', 'mission'],
				["text", 2, 46, "wait,\nwhat if...", "progressive-next"],
			],
			next: 1,
		},
		{
			name: "baby-hitler",
			enableInventory: true,
			fadeIn: 0xFFFFFF,
			sprites: [
				["background"],
				["window"],
				["cross"],
				["pen"],
				["picture-frame"],
				["baby", 0, 0, 'loop'],
				["mustache", 0, 0, 'ifvar', 'baby-hitler'],
				["cross-cursor", 0, 0, 'ifselected', 'gun'],
				["pen-cursor/cursor", -30, 0, 'ifselected', 'pen'],
				["gun", 0, 0, 'ifselected', 'gun'],
			],
			onClick: [
				{
					name: "mask",
					ifselected: 'gun',
					actions: [
						{ removeSprite: "cross-cursor" },
						{ replaceSprite: ["baby", "baby.0"] },
						{ next: 1, fadeOut: 0xae5e32 }
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
						{ setVar: "baby-hitler", value: true },
						{ removeSprite: "pen-cursor/cursor" },
						{ removeInventory: 'pen' },
						{ selectItem: null },
						{ setMission: 0 },
					],
				},
				{
					name: "pen", ifselected: null, ifvisible: 'pen',
					actions: [
						{ tip: [
							"hum... what a strange looking pen for 1889! I'll just take it.",
						]},
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
							"I have no use in defacing the window.",
						]},
						{ removeSprite: "pen-cursor" },
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
						{ next: "missed-shot", fadeOut: 0xFFFFFF }
					],
				},
				{
					name: "cross",
					ifselected: 'gun',
					actions: [
						{ removeSprite: "cross-cursor" },
						{ next: "missed-shot", fadeOut: 0xFFFFFF },
						{ dropSprite: "cross" },
					],
				},
				{
					name: "picture-frame",
					ifselected: 'gun',
					actions: [
						{ removeSprite: "cross-cursor" },
						{ next: "missed-shot", fadeOut: 0xFFFFFF }
					],
				},
				{
					name: "background",
					ifselected: 'gun',
					actions: [
						{ removeSprite: "cross-cursor" },
						{ next: "missed-shot", fadeOut: 0xFFFFFF }
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
			background: "#ae5e32",
			fadeOut: 0xFFFFFF,
			sprites: [
				["text", 4, 25, `GAME OVER`],
			],
			next: "intro",
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
			],
			next: 1,
		},
		{
			sprites: [
				["secret-agent"],
			],
			next: 1,
		},
		{
			sprites: [
				["time-traveler"],
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
				["text", 2, 36,
					"I couldn't\naim right.",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["time-traveler-speak"],
				["text", 2, 36,
					"the\ntarget was\ntoo tiny.",
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
				["text", 2, 36,
					"i have\nalways\nregretted",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["time-traveler-speak"],
				["text", 2, 36,
					"giving up\non my",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["time-traveler-speak"],
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
				["text", 2, 36,
					"thanks,\ni'll be on\nmy way.",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["time-traveler-speak"],
				["text", 2, 36,
					"I guess I\nwon't be\nseeing you",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["time-traveler-speak"],
				["text", 2, 36,
					"any time\nin",
					"progressive"],
			],
			next: 1,
		},
		{
			sprites: [
				["time-traveler-speak"],
				["text", 2, 36,
					"the\nnear\nfuture.",
					"progressive"],
			],
			next: 1,
		},
		{
			fadeOut: 0x000000,
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"that, i\ncan\nassure you.",
					"progressive"],
			],
			next: 1,
		},
		{
			fadeOut: 0x000000,
			sprites: [
				["secret-agent"],
				["text", 2, 36,
					"good luck",
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
			],
			next: 1,
		},
		{
			background: "#ae5e32",
			fadeOut: 0xFFFFFF,
			sprites: [
				["text", 4, 25, `GAME OVER`],
			],
			next: "intro",
		},
	],	
};




