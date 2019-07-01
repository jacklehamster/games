const Game = function() {
	const DEBUG = {
		canExit: false,
		shortExit: false,
		gunnow: false,
		timeFreeze: false,
		lost: 0,
		freezeBody: false,
	};

	const BACKGROUND_COLOR = "black";//"#121622";
	const GAME_SIZE = [ 320, 256 ];
	const WORLD_SIZE = [600, 600];//[1000, 1000];
	const STRING_LIMIT = 29;
	const LONG_STRING_LIMIT = 42;
	let isHardcore = localStorage.getItem('difficulty')==='hard';
	let isCustomDifficulty = localStorage.getItem('difficulty') && !isHardcore;
	let NPC_COUNT;//100;
	function updateNpcCount() {
		isHardcore = localStorage.getItem('difficulty')==='hard';
		isCustomDifficulty = localStorage.getItem('difficulty') && !isHardcore;
		NPC_COUNT =  !localStorage.getItem('difficulty') ? 12 : isHardcore ? 16 : parseInt(localStorage.getItem('difficulty'));
	}
	updateNpcCount();

	const DEFAULT_SPEECH_SPEED = 30;
	let SPEECH_SPEED = localStorage.getItem('textSpeed')==='fast' ? DEFAULT_SPEECH_SPEED /10 : DEFAULT_SPEECH_SPEED;
	const loop = 'loop';
	const IMMUNE_TIME = 5000;

	const RANDOM_LEFT = ['rick', 'san', 'mor', 'smith', 'beth', 'jer', 'sum', 'har', 'jes', 'va', 'gol', 'fera', 'brad', 'et', 'nan', 'to', 'tri', 'vin', 'phil', 'seth', 'mee', 'bird', 'squan', 'uni', 'poo', 'butt'];
	const RANDOM_RIGHT = ['', 'cent', 'lip', 'chez', 'ty', 'ry', 'mer', 'ry', 'sica', 'gina', 'denfold', 'tu', 'han', 'cy', 'by', 'cia', 'seeks', 'person', 'chy', 'ty', 'py', 'hole', 'wubbalubbadubdub'];

	let nudity = localStorage.getItem('nudity')==='allow' ? 'allow' : null;

	// const RANDOM_SYLLABLES = [
	// 	'jo', 'ja', 'ne', 'ka', 'vi', 'dof', 'lin', 'chu', 'rat', 'be', 'do', 'nald', 'tay', 'lor', 
	// 	'ric', 'ky', 'mor', 'ty', 'jer', 'ry', 'vin', 'cent', 'liz', 'beth', 'scar', 'lett',
	// 	'emi', 'elvi', 'har', 'wubbalubbadubdub',
	// ];

	const randomMess = Math.floor(Math.random()*10000000);

	const OCCUPATIONS = [
		'dentist', 'friend', 'best friend', 'mistress',
		'teacher', 'financial advisor', 'massage therapist',
		'milkman', 'neighbor', 'worst nightmare',
		'cousin', 'brother', 'sister', "buddy", "favorite actor",
		"biggest fan", "first love", 'waitress', 'butler', 'babysitter',
		'janitor', 'landlord', 'doctor', 'divorce lawyer', 'old pal',
		'servant', 'boss', "fiduciary", "slumlord", "bodyguard",
        'nextdoor neighbor', 'wrestling coach', 'middle school English teacher',
	];

	const LOCATIONS = [
		'at a bar', 'in the park', 'at school', 'at a party',
		'at a barbecue', 'at work', "at Wendy's",
		'at the airport', 'in the library', "in your dad's garage",
		"at the Marriot", "at the police station", "at the convention center",
		"on the airplane", "at the concert", "in the car",
		"with your friends", "in front of everybody", "in Vietnam", "at the hospital",
		"in my dreams", "at your mom's house", "at a potluck",
        "during the '80s", "at Spencer's Gifts",
	];

	const HOBBY = [
		'a beer', 'sex', 'sushi', 'tacos', 'a great time',
		'an argument', 'a lot of fun', 'a long conversation',
		'boardgames', 'a little chat', 'a fight', 'fish and chips',
		'lasagna', 'pasta', 'Korean food', "a joint", "drugs",
		"a sandwich", "ice cream", "tiramisu", "too much to drink",
		"discovered something amazing", 'the Impossible Burger',
		'fifty donuts', "a thing", "a tickle-fight", "sexual chemistry",
        "a moment of silence", "parent/teacher conference", "an obligation to do the right thing"
	];

	const TIME = [
		'monday', 'weekend', 'month', 'tuesday', 'wednesday', 'thursday', 'friday', 'time',
		'week', 'year', 'Christmas', 'time we met', "night", "solstice", "freshman year",
        "high noon", "Burning Man", "Republican National Convention",
	];

	const RANDOM_COMMENT = [
		'What a fun time that was...', 'Ah the good memories...', 'Life is so short...',
		"I'll never forget...",
		"It's almost like it was yesterday...", "I can see it now...",
	];

    const INTRO = [
        "You don't recognize me? I am",
        "Huh? You are so forgetful! I'm",
        "Haha! Stop joking around! You know me, I'm",
        "You are such a narcissist! I am",
        "Ugh! AWKWARD! I'm",
        "Aha! *WIINK* Pleased to meet you. I am",
        "WHAT? You are vapid! I am",
        "Come on... this is the third time. I am",
        "Dude! Take it easy on the vape pen! I am",
        "You forgot my name? So rude! I am",
        "Wow, nice power play! I am",
    ];

	function makeCap(string) {
		return string.charAt(0).toUpperCase() + string.substr(1).toLowerCase();
	}

	function seededRandom(n) {
		return Math.floor(Math.sin(n * 313) * 10000);
	}

	let seed = Math.floor(Math.random()*1000000);
	function randomIntroduction(id, name, occupation) {
		return INTRO[(id + seededRandom(999) ^ seed) % INTRO.length] + " "
			+ name
			+ " your "
			+ occupation
			+ ". We had " + HOBBY[(id +seededRandom(3333) ^ seed)%HOBBY.length] + " last "
			+ TIME[(id + seededRandom(13131) ^ seed) % TIME.length] + " "
			+ LOCATIONS[(id + seededRandom(37) ^seed)%LOCATIONS.length] + ". "
			+ RANDOM_COMMENT[(id + seededRandom(9999) ^ seed) % RANDOM_COMMENT.length];
	}

	const GOOD_MEMORIES = [
		"You remember that time you all went to Magic Mountain on that giant rollercoaster. What a fun time you had with {name}!",
		"You remember that wonderful day on an excursion on top of the replica of the Titanic boat. You spread your arms as {name} was holding you and felt lying flying.",
		"You remember that romantic night on top of Lover's Hill, sitting in a car with {name} and watching the sunset. You fell sound asleep tucked in {name}'s arms.",
		"You remember when you got kidnapped by gangsters and {name} went to your rescue. What a heroic gesture!",
		"You remember the romatic dinner with {name} at a very fancy Korean restaurant. You tasted many delicous dishes and didn't gain a pound.",
		"You remember when you went home to visit your parents and introduced {name} to them. They were so ecstatic!",
		"You remember going to the movie theater with {name} to watch Star Wars. You both snuggled during a scene with Chewbacca.",
        "Oh, there was that one time when {name} was getting married. We sang karoake and danced all night long!",
        "Of course your {name}'s 21st birthday party was crazy! Everyone did Jello shots and danced to Soulja Boy!",
        "That remind me of when {name} and I went to see Toy Story on Ice! Buzz Lightyear looked really nice on skates!",
        "One time we went to Coachella with {name}! Ghandi played guitar with Bob Marley and they invited {name} to do a drum solo!",
        "One summer we all went to Hawaii. We drank Piña Coladas and {name} won a surfing contest!",
        "Last time we went to the Summer Olympics was intense! {name} got invited to swim in the 100 meter relay and won Gold!",
        "Remember when we went to Las Vegas to play Eye-Spy? {name} won $6,000,000 on the first day!",
        "It reminds me of that roadtrip we took to The Mall of America. {name} won a free pretzel and we all bought matching Yo-Yos!",
	];

	const BAD_MEMORIES = [
		"You remember that time you all went to Magic Mountain on that giant rollercoaster. {name} vomitted {their} lunch all over your pants, all the way down.",
		"You remember that wonderful day on an excursion on top of the replica of Titanic boat. {name} thought it'd be funny to push you overboard. You spent the rest of the day at the hospital.",
		"You remember that romantic night on top of Lover's Hill, sitting in a car with {name} and watching the sunset. {name} farted, but we didn't open the window because it was too cold.",
		"You remember when you got kidnapped by gangsters and {name} went to your rescue. You found out those were all actors and this was all a ruse for {name} to pretend to be heroic!",
		"You remember the romantic dinner with {name} at a very fancy Korean restaurant. You spend the majority of it by yourself, waiting for {name} to come out of the restroom.",
		"You remember when you went home to visit your parents and introduced {name} to them. {name} got the toilet stuck with a big giant turd and your mom had to spend the night unplugging it.",
		"You remember going to the movie theater with {name} to watch Star Wars. {name} kept yelling at the screen and cursing George Lucas during every scene with Jar Jar Binks.",
        "Oh, there was that one time when {name} was getting married. The bride's mother died from eating undercooked shellfish!",
        "Of course your {name}'s 21st birthday party was crazy! {name} tried to butt-chug a beer and we had to call an ambulance...",
        "That remind me of when {name} and I went to see Toy Story on Ice! {name} got high on bath salts and ate Mr. Potato Head, we didn't get a refund...",
        "One time we went to Coachella with {name}! Limp Bizkit played 5 sets and we all caught Typhoid fever!",
        "One summer we all went to Hawaii. {name} broke {their} leg and we had to sell {their} plasma for plane tickets home...",
        "Last time we went to the Summer Olympics was intense! {name} sneezed on Michael Phelps who got a lung infection and drowned!",
        "Remember when we went to Las Vegas to play Eye-Spy? {name} offended the mob bosses and we all got our legs broken...",
        "It reminds me of that roadtrip we took to The Mall of America. {name} got caught in the escalator... they still have to poop in a bag...",
	];


	const NUMBERS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];

	const HOT_TOPICS = {
		"normal": [
			"At least, we both know we're not parasites.",
			"There are still {parasite} parasites among us.",
			"We both have lots of good memories together.",
			"I'd love to chat with you and remember the good old times.",
			"Can you believe, I've known you since childhood!",
			"Remember that one time, at band camp?",
			"I really love to say the same thing over and over.",
			"Did you find a parasite yet?",
			"There are so many people here.",
			"I don't recognize half the people in this room.",
            "I didn't fight in a war just to let parasites in our homes.",
            "I don't remember the line to the bathroom always being this long...",
            "I'm so glad we aren't parasites. So GROSS!",
		    "I can feel there are {parasite} parasites in this room.",
		    "If I count correctly, there must be {parasite} parasites left.",
			"I've never had a bad memory with a parasite.",
			"I heard you can only remember the good times with parasites.",
		].map(wrapText),
		"justKilled": [
			"Who would have thought {name} was a parasite?",
			"Nice job eliminating that parasite.",
			"You're pretty smart figuring out who's the parasite.",
			"I knew that was a parasite. That looked definitely suspicious.",
			"I remember all the good times with {name}. Who would have thought those were fake!",
			"Isn't weird, I can't recall anything I disliked about {name}.",
            "Of course that was a parasite. Only a parasite would think otherwise.",
            "I remembered {name} so fondly.",
            "Good riddance! {name} was always so nice it was getting annoying. Or was it just a fake memory?",
            "One parasite down, {parasite} to go!"
		].map(wrapText),
		"justKilledHuman": [
			"Hey careful where you point that gun.",
			"Everyone can make mistakes.",
			"Those parasites, they mess with our minds to turn.",
			"I can't believe you killed your {occupation}.",
			"{name} wasn't a parasite! You knew each other since forever!",
			"Nice job cowboy. Maybe you think everyone's a parasite.",
			"{name} will be missed.",
			"{name} was a jerk, but didn't deserve that.",
			"Not a big fan of {name}, but that was uncalled for.",
		].map(wrapText),
		"lastOne": [
		].map(wrapText),
	};

	const settings = {
		size: GAME_SIZE,
		backgroundColor: BACKGROUND_COLOR,
	};

	const songs = {};

	let randomo = Math.floor(Math.random()*100000000);
	let randomi = 0;

	const SPEED = .5;
	const characters = {
		'npc': {
			'body-up': 'npc-body-up',
			'body-left': 'npc-body-left',
			'body-right': 'npc-body-left',
			'body-down': 'npc-body',
			'head': 'npc-head',
			'face': 'npc-face',
			'mouth': 'npc-mouth',
		},
		'mad': {
			'body-up': 'npc-body-up',
			'body-left': 'npc-body-left',
			'body-right': 'npc-body-left',
			'body-down': 'npc-body',
			'head': 'npc-head',
			'face': 'mad-face',
			'mouth': 'npc-mouth',
		},
		'smart': {
			'body-up': 'npc-body-up',
			'body-left': 'npc-body-left',
			'body-right': 'npc-body-left',
			'body-down': 'npc-body',
			'head': 'npc-head',
			'face': 'smart-face',
			'mouth': 'npc-mouth',
		},
		'pixie': {
			'body-up': 'npc-body-up',
			'body-left': 'npc-body-left',
			'body-right': 'npc-body-left',
			'body-down': 'npc-body',
			'head': 'round-head',
			'face': 'pixie-face',
			'mouth': 'npc-mouth',
		},
		'morty': {
			'body-up': 'npc-body-up',
			'body-left': 'npc-body-left',
			'body-right': 'npc-body-left',
			'body-down': 'npc-body',
			'head': 'round-head',
			'face': 'morty-face',
			'mouth': 'npc-mouth',
		},
		'femme': {
			'body-up': 'npc-body-up',
			'body-left': 'npc-body-left',
			'body-right': 'npc-body-left',
			'body-down': 'npc-body',
			'head': 'npc-head',
			'face': 'femme-face',
			'mouth': 'npc-mouth',
		},
		'hero': {
			'body-up': 'npc-body-up',
			'body-left': 'npc-body-left',
			'body-right': 'npc-body-left',
			'body-down': 'npc-body',
			'head': 'npc-head',
			'face': 'npc-face',
			'mouth': 'npc-mouth',
			'skinColor': 'pink',
			// 'hair': 'bowl-hair',
			// 'hairColor': 'pink',
			// 'beard': 'beard',
			// 'bodyColor': 'morty',
		},
		'gun': {
			'body-up': 'npc-body-up-gun',
			'body-left': 'npc-body-left-gun',
			'body-right': 'npc-body-right-gun',
			'body-down': 'npc-body-gun',
			'head': 'npc-head',
			'face': 'npc-face',
			'mouth': 'npc-mouth',
			'skinColor': 'pink',
			// 'hair': 'bowl-hair',
			// 'hairColor': 'pink',
			// 'beard': 'beard',
			// 'bodyColor': 'morty',
		},
		'gunshooting': {
			'body-up': 'npc-body-up-gun-shoot',
			'body-left': 'npc-body-left-gun-shoot',
			'body-right': 'npc-body-right-gun-shoot',
			'body-down': 'npc-body-gun-shoot',
			'head': 'npc-head',
			'face': 'npc-face',
			'mouth': 'npc-mouth',
			'skinColor': 'pink',
			// 'hair': 'bowl-hair',
			// 'hairColor': 'pink',
			// 'beard': 'beard',
			// 'bodyColor': 'morty',
		},
		'gary': {
			'body-up': 'npc-body',
			'body-left': 'npc-body-left',
			'body-right': 'npc-body-left',
			'body-down': 'npc-body',
			'head': 'gary-head',
			'face': 'gary-face',
			'mouth': 'npc-mouth',
			'skinColor': 'pink',
			'bodyColor': 'gary',
		},
	};

window.characters = characters;
	const GENDERS = ['penis', 'vagina'];
	const switchers = ['hair', 'hairColor', 'head', 'face', 'skinColor', 'bodyColor', 'beard', 'gender'];

	function changeHero(element, index) {
		switch(element) {
			case 'face':
				{
					const list = ['npc-face', 'mad-face', 'smart-face', 'pixie-face', 'morty-face', 'femme-face'];
					value = list[(index+list.length) % list.length];
					characters.hero[element] = value;
					characters.gun[element] = value;
					characters.gunshooting[element] = value;
				}
				break;
			case 'head':
				{
					const list = HEADS;
					value = list[(index+list.length) % list.length];
					characters.hero[element] = value;
					characters.gun[element] = value;
					characters.gunshooting[element] = value;
				}
				break;
			case 'skinColor':
				{
					const list = FACE_COLORS.map(a => a.name);
					value = list[(index+list.length) % list.length];
					characters.hero[element] = value;
					characters.gun[element] = value;
					characters.gunshooting[element] = value;
				}
				break;
			case 'bodyColor':
				{
					let list = BODY_COLORS.map(a => a.name);
					if(!nudity) {
						list = list.filter(name => name!=='nude');
					}
					value = list[(index+list.length) % list.length];
					characters.hero[element] = value;
					characters.gun[element] = value;
					characters.gunshooting[element] = value;
				}
				break;
			case 'hairColor':
				{
					const list = HAIR_COLORS.map(a => a.name);
					value = list[(index+list.length) % list.length];
					characters.hero[element] = value;
					characters.gun[element] = value;
					characters.gunshooting[element] = value;
				}
				break;
			case 'hair':
				{
					let list = HAIRS;
					value = list[(index+list.length) % list.length];
					characters.hero[element] = value;
					characters.gun[element] = value;
					characters.gunshooting[element] = value;
				}
				break;
			case 'beard':
				{
					let list = BEARDS;
					value = list[(index+list.length) % list.length];
					characters.hero[element] = value;
					characters.gun[element] = value;
					characters.gunshooting[element] = value;
				}
				break;
			case 'gender':
				{
					let list = GENDERS;
					value = list[(index+list.length) % list.length];
					characters.hero[element] = value;
					characters.gun[element] = value;
					characters.gunshooting[element] = value;
				}
				break;
			default:
				//console.log(element);
		}
	}



	function wrapTextWithLimit(text, limit) {
		const split = text.split("\n").join(" ").split("  ").join(" ").split(" ");
		const newSplit = [];
		let length = 0;
		for(let i=0; i<split.length; i++) {
			if(length + split[i].length > limit) {
			//console.log(split[i].length + limit, length, split[i]);
				newSplit.push('\n');
				length = 0;
			}
			length += split[i].length + 1;
			//console.log(length, split[i])
			newSplit.push(split[i]);
		}
		return newSplit.join(" ").split("\n ").join("\n");		
	}

	function wrapText(text) {
		return wrapTextWithLimit(text, STRING_LIMIT);
	}

	const HEADS = ['npc-head', 'cone-head', 'round-head'];
	const HAIRS = ['bald', 'bald', 'bald', 'bald', 'bald', 'orange-hair', 'pony-tail', 'bowl-hair', 'spike-hair', 'rick-hair'];
	const BEARDS = [null, null, null, null, null, null, null, 'beard'];

	let scroll = { x: 0, y: 0 };
	let hero = {
		id: 0, 
		x: settings.size[0] / 2, 
		y: settings.size[1] / 2, 
		move: { dx: 0, dy: 0 }, 
		face: { dx: 0, dy: 0 },
		gun: 0,
		lastHit: 0,
		// bodyColor: 'nude',
		// gender: 'penis',
	 };
	 window.hero = hero;
	 // 		const xx = Math.round(x / 32);
		// const yy = Math.round(y / 32);


	const FACE_COLORS = [
		{ name: 'default', 0xFFFFFF: 0xFFFFFF },
		{ name: "pink", 0xFFFFFF: 0xFFEEEE },
		{ name: "black", 0xFFFFFF: 0x994444, outline: 'white' },
		{ name: "yellow", 0xFFFFFF: 0xFFFFCC },
		{ name: "orange", 0xFFFFFF: 0xEE9966 },
		{ name: "blue", 0xFFFFFF: 0x88EEDD },
	];
	const BODY_COLORS = [
		{ name: 'default' },
		{ name: 'dark', 0x4b4a4a: 0x2F322F, 0xa7a4a4: 0x161E20, 0x1c1c1c: 0x1E2820 },
		{ name: 'jeans', 0x4b4a4a: 0x2e1cca, 0xa7a4a4: 0xb21818, 0x1c1c1c: 0xFFFFFE },
		{ name: 'yoga', 0x4b4a4a: 0x262a3e, 0xa7a4a4: 0xeeeeee, 0x1c1c1c: 'nude' },
		{ name: 'morty', 0x4b4a4a: 0x212d6d, 0xa7a4a4: 0xF7F372, 0x1c1c1c: 0xb4b4b8 },
		{ name: 'rick', 0x4b4a4a: 0x7A6A46, 0xa7a4a4: 0xA9E3D4, 0x1c1c1c: 0x222222 },
		{ name: 'jerry', 0x4b4a4a: 0x8FC0F0, 0xa7a4a4: 0x3F5810 },
		{ name: 'summer', 0x4b4a4a: 0xEEEEEE, 0xa7a4a4: 0xE976D3, 0x1c1c1c: 'nude' },
		{ name: 'beth', 0x4b4a4a: 0x152C8B, 0xa7a4a4: 0xDC5256, 0x1c1c1c: 0xdddddd },
		{ name: 'nude', 0x4b4a4a: 'nude', 0xa7a4a4: 'nude', 0x1c1c1c: 'nude' },
		{ name: 'gary', 0x4b4a4a: 0xaae1d7, 0xa7a4a4: 0xaae1d7, 0x1c1c1c: 'nude' },
	];
	const HAIR_COLORS = [
		{ name: 'default' },
		{ name: 'ginger', 0xff7c00: 0x90402f },
		{ name: 'blond', 0xff7c00: 0xdadd21 },
		{ name: 'blond', 0xff7c00: 0xdadd21 },
		{ name: 'brown', 0xff7c00: 0x292910 },
		{ name: 'brown', 0xff7c00: 0x292910 },
		{ name: 'brown', 0xff7c00: 0x292910 },
		{ name: 'pink', 0xff7c00: 0xff5ccf },
		{ name: 'rick', 0xff7c00: 0xB4DFF5 },
	];
	const NUDE = BODY_COLORS.filter(a => a.name==='nude')[0];

	let lastKilled = {
		time: 0,
		npc: null,
		parasite: false,
	};

	function npcHusband(index) {
		return index === 0;
	}

	function husbandIntro(gender) {
		return wrapText("I'm Slurpy Gary, your lovely "+(gender==='penis' ? 'husband' : 'wife')+". We've had a wonderful life together, remember?");
	}

	function husbandMemory(gender) {
		return wrapText("You remember the day you said 'I do.' to Slurpy Gary, your lovely husband. Gary forgot that day so he showed up at the ceremony in pyjamas, a cherished moment you will always remember.");
	}

	function randomMemory(index, good, name, gender) {
		const list = good ? GOOD_MEMORIES : BAD_MEMORIES;
		const text = list[index % list.length];
		return text.split("{name}").join(name).split("{their}").join(gender==='penis'?'his':'her').split("{they}").join(gender==='penis'?'he':'she');
	}

	function randomHero(index) {
		if(index < 0) {
			index = Math.abs(index) + 1313311;
		}
		for(let i=0; i<switchers.length; i++) {
			changeHero(switchers[i], !index ? 0 : index + (i * 1373));
		}
		localStorage.setItem('hero', index);
	}
	let initialHero = parseInt(localStorage.getItem('hero') || 0);
	if(initialHero) {
		randomi = 1;
		randomHero(initialHero);
	} else {
		initialHero = Math.floor(Math.random()*1000);
	}


	let parasiteCount = 0;
	let ppCount = 0;
	let npcCount = 0;
	let npcShotCount = 0;

	const walls = {}, surface = {}, npcWalls = {};

	const blocks = {};
	const blocks_ = [
		'1_2',
		'1_3',
		'1_4',
		'1_5',
		'2_2',
		'3_2',
		'4_2',
		'5_2',
		'6_2',
		'7_2',
		'8_2',
		'9_2',
		'9_3',
		'9_4',
		'9_5',
		'9_6',
		'9_7',
		'10_7',
		'10_6',
		'10_5',
		'10_4',
		'10_3',
		'10_2',
		'11_7',
		'11_6',
		'11_5',
		'11_4',
		'11_3',
		'11_2',
		'13_2',

//		'12_6',
		'13_6',
		'14_6',
		'15_5',
		'16_5',
		'15_6',
		'16_6',
		'17_6',
		'18_6',

		'14_2',
		'15_2',
		'16_2',
		'22_2',
		'22_3',
		'22_4',
		'22_5',
		'22_6',
		'22_7',
		'23_2',
		'23_3',
		'23_4',
		'23_5',
		'23_6',
		'23_7',
		'24_2',
		'24_3',
		'24_4',
		'24_5',
		'24_6',
		'24_7',
		'25_2',
		'25_2',
		'26_2',
		'27_2',
		'28_2',
		'29_2',
		'30_2',
		'31_2',
		'31_3',
		'31_4',
		'31_5',
		'31_6',
	].forEach(a => blocks[a] = true);

	const freeSpaces = [];
	let door = null;

	const tiles = [], cols = /*Math.floor(WORLD_SIZE[0] / 32)*/ 33, rows = 11;//Math.floor(WORLD_SIZE[1] / 32);
	for (let r = 0; r < rows; r++) {
		for (let c = 0; c < cols; c++) {
			const isDoor = r===1 && c===Math.round(cols/2) + 4;
			const isWall = c===0 || r<=1 || c===cols-1 || r===rows-1 || blocks[c+"_"+r];
			const type = !isWall ? 'floor-tile' : 'bricks';
			const frame = type==='floor-tile' ? getRandom([0, 1, 2, 3, 3, 3, 3, 3, 3, 3, 3]) : 
				getRandom([0, 1, 2, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
//			tiles.push({ type, x: c * 32 - 16, y: r * 32 - 16, frame, alpha: .3 });
			if(!isWall) {
				freeSpaces.push({x: c * 32 - 16, y: r * 32 - 16});
			}
			if(isDoor) {
				tiles.push(door = { type: 'the-door', x: c * 32 - 16, y: r * 32 - 16, frame:1, door:'closed', });
				tiles.push({ type: 'the-door', x: c * 32 - 16, y: r * 32 - 16, frame:0, door:'opened', });
			}
			walls[c + "_" + r] = isDoor ? 'door' : isWall ? type : null;
			surface[c + "_" + r] = type;
		}
	}
	// Engine.setData('back', {x:-100,y:-150});
	tiles.push({ type: 'house-background', x: ['back.x'], y: ['back.y'], alwaysOnScreen: true });
	tiles.push({ type: 'couch', x: ['couch.x'], y: ['couch.y'], alwaysOnScreen: true });

	let npcs;
	let totalParasiteCount;
	let heartCount = 4;

	function gameStarts(allNude) {
		if(characters.hero.bodyColor==='nude') {
			Engine.dispatchTrigger({trigger:'nude', medal:'Nude player'});
		}

		if(allNude) {
			Engine.dispatchTrigger({trigger:'all-nude', medal:'69'});			
		}

		parasiteCount = 0;
		npcs = new Array(NPC_COUNT).fill(null).map(
			(a, index) => {
				const move = {
					dx: Math.round(2*(Math.random()-.5)),
					dy: Math.round(2*(Math.random()-.5)),
				};
				const husband = npcHusband(index);
				const parasite = !husband && index < NPC_COUNT / 3;
				if (parasite) {
					parasiteCount++;
				}
				const gender = husband || Math.random() < .5 ? 'penis' : 'vagina';
				const faceColor = husband ? FACE_COLORS.filter(a => a.name==="pink")[0] : getRandom(FACE_COLORS);
				const hairColor = getRandom(HAIR_COLORS);
				const name = makeCap(
					RANDOM_LEFT[(randomMess + index+12345)%RANDOM_LEFT.length]
					+ RANDOM_RIGHT[(randomMess + index)%RANDOM_RIGHT.length]);
				const occupation = OCCUPATIONS[(randomMess + index+323)%OCCUPATIONS.length];

				const posIndex = Math.floor(Math.random() * freeSpaces.length);
				const {x, y} = freeSpaces[posIndex];
				freeSpaces[posIndex] = freeSpaces[freeSpaces.length-1];
				freeSpaces.pop();
				if(!parasite) {
					npcCount++;
				}
				const beard = husband ? null : getRandom(BEARDS);
				const hair = husband ? 'bald' : getRandom(HAIRS);

				return { 
					id: index,
					name,
					occupation,
					head: husband ? 'gary-head' : getRandom(HEADS),
					skinColor: faceColor.name,
					hairColor: hairColor.name,
					textColor: '#' + (faceColor[0xFFFFFF] + 0xF000000).toString(16).substr(1),
					outline: faceColor.outline || '#222222',
					bodyColor: allNude && nudity==='allow' ? 'nude' : husband ? 'gary' : (index>=NPC_COUNT * .9 || allNude) && nudity==='allow' ? NUDE.name : getRandom(BODY_COLORS.slice(0, BODY_COLORS.length - 2)).name,
					x, 
					y,
					move,
					face: move,
					lookAtHero: { dx: 0, dy: 0},
					type: husband ? 'gary' : getRandom(['npc', 'pixie', 'mad', 'smart', 'femme', 'morty']),
					gender,
					introduction: husband ? husbandIntro(gender) : wrapText(randomIntroduction(index + randomMess, name, occupation)),
					memory: wrapTextWithLimit(husband ? husbandMemory(gender) : randomMemory(index + randomMess, parasite, name, gender), LONG_STRING_LIMIT),
					blocked: 0,
					husband,
					parasite,
					beard,
					hair,
				};
			}
		);
		totalParasiteCount = parasiteCount;		
		console.log(totalParasiteCount);		
	}


	function canExit() {
		if (DEBUG.canExit) {
			return true;
		}
		if(isCustomDifficulty) {
			return false;
		}
		return garyHidden && (inHallway || parasiteCount===0);
	}

	function initScene(now) {
		if(DEBUG.gunnow) {
			hero.gun = 1;
		}
		waitUp = false;
	}

	function occupy(x, y, value) {
		const xx = Math.round(x / 32);
		const yy = Math.round(y / 32);
		const tag = xx+"_"+yy;
		npcWalls[tag] = value;
	}

	function blocked(x, y, npcToo) {
		const xx = Math.round(x / 32);
		const yy = Math.round(y / 32);
		const tag = xx+"_"+yy;
		if(walls[tag]) {
			if (walls[tag] !== 'door') {
				return true;				
			}

			if(!canExit() && walls[tag] === 'door') {
				return true;
			}
		}
		return !surface[tag] || npcToo && npcWalls[tag];
	}

	function exiting(x, y) {
		const xx = Math.round(x / 32);
		const yy = Math.round(y / 32);
		const tag = xx+"_"+yy;
		return walls[tag] === 'door' && canExit();
	}

	let exited = false;;
	let exitedTheBuilding = 0;
	function goExit(now) {
//		exited = true;
		// try {
		// 	throw new Error();
		// }catch(e) {
		// 	console.log(e);
		// }
		exitedTheBuilding = now;
		Engine.setData('exitTime', now);
	}

	let npcToTalk = null;
	let talking = 0;
	let alreadyPressed = false;
	let lastShot = {
		time: 0,
		x: 0,
		y: 0,
		dx: 0,
		dy: 0,
		size: 1000,
		target: null,
	};

	let timeFreeze = DEBUG.timeFreeze;
	let waitUp = false;;
	let justPutGunDown = 0;

	let inHallway = false;
	let inFinal = false;
	let inFinalFinal = false;

	let skipOnce = false;

	function finalfinalScene(now) {
		skipOnce = true;
		console.log('finalfinal');
//		Engine.previousScene(now);
		Engine.nextScene(now);
		hero.x = 544;//WORLD_SIZE[0]/2+16;
		hero.y = 224;//WORLD_SIZE[1]/2;

		tiles.length = 0;
		exitedTheBuilding = 0;
		exited = false;
		npcs.length = 0;
		hero.gun = now;
		inFinal = true;
		inFinalFinal = true;
		talking = 0;
		npcToTalk.talking = 0;
		chatIndex = 0;
//		hero.talking = now;
//		talking = true;
//		console.log('finalScene');

		scroll.x = (settings.size[0] / 2 - hero.x + (hero.gun ? - hero.face.dx * 70 : talking && npcToTalk ? - hero.face.dx * 20 : 0));
		scroll.y = (settings.size[1] / 2 - hero.y + (hero.gun ? - hero.face.dy * 60 + 30 : talking && npcToTalk ? 40 : 20));

		const COLS = 15, ROWS = 6;
		for(let r=0; r < ROWS; r++) {
			for(let c = -1; c < COLS; c++) {
				const isDoor = false;//c === Math.floor(COLS/2) && r === 1;
				const isWall = c<0 || c === COLS-1 || r<=1 || r===ROWS-1
					|| c >= 2 && r != 2;
				const type = !isWall ? 'floor-tile' : 'bricks';
				const frame = type==='floor-tile' ? getRandom([0, 1, 2, 3, 3, 3, 3, 3, 3, 3, 3]) : 
					getRandom([0, 1, 2, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
				const col = Math.floor(hero.x / 32 + c);
				const row = Math.floor(hero.y / 32 + r - ROWS + 2);
//				tiles.push({ type, x: col * 32 - 16, y: row * 32 - 16, frame });
				walls[col + "_" + row] = isDoor ? 'door' : isWall ? type : null;
				surface[col + "_" + row] = type;
			}
		}
		tiles.push({ type:'moonlight', x: (WORLD_SIZE[0]/2+16) - 72, y: (WORLD_SIZE[1]/2)- 320});

		const husband = true;
		const parasite = false;
		const gender = 'penis';
		const faceColor = FACE_COLORS.filter(a => a.name==="pink")[0];
		const name = 'Slurpy Gary';
		const occupation = 'husband';
		const move = { dx: 0, dy: 0};

		npcs.push(npcToTalk = { 
			id: 0,
			name,
			occupation,
			head: 'gary-head',
			skinColor: faceColor.name,
			textColor: '#' + (faceColor[0xFFFFFF] + 0xF000000).toString(16).substr(1),
			outline: faceColor.outline || '#222222',
			bodyColor: 'gary',
			x: 715, 
			y: 224,
			move,
			face: move,
			lookAtHero: { dx: -1, dy: 0},
			type: 'gary',
			gender,
			introduction: husbandIntro(gender),
			memory: wrapTextWithLimit(husbandMemory(gender), LONG_STRING_LIMIT),
			blocked: 0,
			husband,
			parasite,
		});		
		window.gary = npcToTalk;



		// FINALCHATS = [
		// 	"You're right Slurpy Gary. You really are... human.",
		// 	"--1-",
		// 	"--2-",
		// 	"--3-",
		// 	"--4-",
		// ].map(wrapText);



	}

	function finalScene(now) {
		skipOnce = true;
		Engine.nextScene(now);
		hero.x = WORLD_SIZE[0]/2+16;
		hero.y = WORLD_SIZE[1]/2;
		tiles.length = 0;
		exitedTheBuilding = 0;
		exited = false;
		npcs.length = 0;
		hero.gun = now;
		inFinal = true;
//		console.log('finalScene');

		scroll.x = (settings.size[0] / 2 - hero.x + (hero.gun ? - hero.face.dx * 70 : talking && npcToTalk ? - hero.face.dx * 20 : 0));
		scroll.y = (settings.size[1] / 2 - hero.y + (hero.gun ? - hero.face.dy * 60 + 30 : talking && npcToTalk ? 40 : 20));

		const COLS = 15, ROWS = 6;
		for(let r=0; r < ROWS; r++) {
			for(let c = -1; c < COLS; c++) {
				const isDoor = false;//c === Math.floor(COLS/2) && r === 1;
				const isWall = c<0 || c === COLS-1 || r<=1 || r===ROWS-1
					|| c >= 2 && r != 2;
				const type = !isWall ? 'floor-tile' : 'bricks';
				const frame = type==='floor-tile' ? getRandom([0, 1, 2, 3, 3, 3, 3, 3, 3, 3, 3]) : 
					getRandom([0, 1, 2, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
				const col = Math.floor(hero.x / 32 + c);
				const row = Math.floor(hero.y / 32 + r - ROWS + 2);
//				tiles.push({ type, x: col * 32 - 16, y: row * 32 - 16, frame });
				walls[col + "_" + row] = isDoor ? 'door' : isWall ? type : null;
				surface[col + "_" + row] = type;
			}
		}
		tiles.push({ type:'moonlight', x: (WORLD_SIZE[0]/2+16) - 72, y: (WORLD_SIZE[1]/2)- 320});


		const husband = true;
		const parasite = false;
		const gender = 'penis';
		const faceColor = FACE_COLORS.filter(a => a.name==="pink")[0];
		const name = 'Slurpy Gary';
		const occupation = 'husband';
		const move = { dx: 0, dy: 0};

		npcs.push(npcToTalk = { 
			id: 0,
			name,
			occupation,
			head: 'gary-head',
			skinColor: faceColor.name,
			textColor: '#' + (faceColor[0xFFFFFF] + 0xF000000).toString(16).substr(1),
			outline: faceColor.outline || '#222222',
			bodyColor: 'gary',
			x: 715, 
			y: 224,
			move,
			face: move,
			lookAtHero: { dx: -1, dy: 0},
			type: 'gary',
			gender,
			introduction: husbandIntro(gender),
			memory: wrapTextWithLimit(husbandMemory(gender), LONG_STRING_LIMIT),
			blocked: 0,
			husband,
			parasite,
		});
	}

	function secondScene(now) {
		if(isHardcore) {
			Engine.dispatchTrigger({trigger:'best-times', score:"Fastest HARDCORE players", value:now});
			Engine.dispatchTrigger({trigger:'most-lLives', score:"Most lives remaining on HARD", value:heartCount});
		} else {
			Engine.dispatchTrigger({trigger:'best-times', score:"Fastest players", value:now});
			Engine.dispatchTrigger({trigger:'most-lLives', score:"Most lives remaining", value:heartCount});
		}

		skipOnce = true;
		Engine.nextScene(now);
		hero.x = WORLD_SIZE[0]/2+16;
		hero.y = WORLD_SIZE[1]/2;
		inHallway = true;
		npcs.length = 0;
		parasites.length = 0;
		tiles.length = 0;
		exitedTheBuilding = 0;
		exited = false;
		lastShot.time = 0;
		hero.lastHit = 0;

		const COLS = 7, ROWS = DEBUG.shortExit ? 5 :20;
		for(let r=0; r < ROWS; r++) {
			for(let c = 0; c < COLS; c++) {
				const isDoor = c === Math.floor(COLS/2) && r === 1;
				const isWall = c===0 || c === COLS-1 || r<=1 || r===ROWS-1;
				const type = !isWall ? 'floor-tile' : 'bricks';
				const frame = type==='floor-tile' ? getRandom([0, 1, 2, 3, 3, 3, 3, 3, 3, 3, 3]) : 
					getRandom([0, 1, 2, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
				const col = Math.floor(hero.x / 32 + c - 2);
				const row = Math.floor(hero.y / 32 + r - ROWS + 3);
				const offsetY = r===ROWS-1 && c===Math.floor(COLS/2) ? 8 : 0;
				if(offsetY > 0) {
					tiles.push({ type:'floor-tile', x: col * 32 - 16, y: row * 32 - 16, frame: 0 });					
				}
				tiles.push({ type, x: col * 32 - 16, y: row * 32 - 16 + offsetY, frame });
				if(isDoor) {
					tiles.push({ type: 'the-door', x: col * 32 - 16, y: row * 32 - 16, frame:1, door:'closed', });
					tiles.push({ type: 'the-door', x: col * 32 - 16, y: row * 32 - 16, frame:0, door:'opened', });
				}
				walls[col + "_" + row] = isDoor ? 'door' : isWall ? type : null;
				surface[col + "_" + row] = type;
//				tiles.push({});
			}
		}
	}

	let noMoreActions = false;

	function performActions5(now) {
		if(noMoreActions) {
			return ;
		}


		hero.move.dy = 0;
		hero.move.dx = 0;

		if(gameOver) {
			if(finalEnding ==='LEAVE') {
				Engine.evaluate(['setMusic', 'evil_vortman', false]);
				if(now - gameOver > 3000) {
					hero.move.dx = -1;
					hero.face.dx = -1;
					hero.x--;
				}

				if(now - gameOver > 7000) {
					gary.move.dx = -1;
					gary.face.dx = -1;
					gary.x--;
				}

				// if(now - gameOver > 20000) {
				// 	Engine.nextScene();
				// }
			}
			else if(finalEnding==='SHOOT') {
				if(now - lastShot.time > 3000) {
//					hero.move.dx = 1;
					hero.gun = 0;
					//console.log(hero);
					Engine.evaluate(['setMusic', 'evil_vortman', false]);
					noMoreActions = true;					
				}
			}

			return;
		}

		if(!talking) {
			if(inFinalMoment) {
				return;
			}
			talking = now;
			hero.move.dx = 0;
			hero.move.dy = 0;
			hero.face = {
				dx: hero.x < npcToTalk.x ? 1 : hero.x > npcToTalk.x ? -1 : 0, dy: 0,
			};
			npcToTalk.face = npcToTalk.lookAtHero;
			npcToTalk.lookAtHero.dx = hero.x < npcToTalk.x ? -1 : hero.x > npcToTalk.x ? 1 : 0;
			npcToTalk.lookAtHero.dy = 0;
			chatIndex = 0;
			discussionTopic = null;
			waitUp = false;
			finalChat = 5;
			chatIndex = 3;
		} else {

			if(!talking || !npcToTalk) {
				npcToTalk = null;
			} else {
				if(now - talking > 1000 && !npcToTalk.talking) {
					if(!inFinalMoment) {
						npcToTalk.talking = now;
					}
				}//console.log(Keyboard.move.dy);
				//inFinalfinal

				if (!waitUp && Keyboard.move.dy) {
					chatIndex = Math.max(0, Math.min(3, chatIndex - Keyboard.move.dy)); //(chatIndex % 4 - Keyboard.move.dy + 4) % 4;
//						console.log(chatIndex);
					waitUp = true;
				} else if(!Keyboard.move.dy) {
					waitUp = false;
				}

			}

		}



		if(!alreadyPressed && Keyboard.action.down) {
			{
				let shouldTalk = npcToTalk.talking && now - npcToTalk.talking < lastMessage.length * SPEECH_SPEED;


				if(npcToTalk && !inFinalMoment && !shouldTalk) {
//					talking = talking ? 0 : now;
					if(!talking) {
					} else if (finalChat < FINALCHATS_NEXT) {
						npcToTalk.talking = 0;
						finalChat ++;
						chatIndex = 3;
					} else if(finalChat < FINALCHATS.length) {
						npcToTalk.talking = 0;
						finalChat ++;
						chatIndex = 3;
						// goExit(now);
//						console.log("here");
						if(finalChat === FINALCHATS.length) {
							if(!finalEnding) {
								hero.gun = now;
								npcToTalk.talking = 0;
								inFinalMoment = true;
							}
							// talking = 0;
						}
					}
				} else {
					if(finalChat===FINALCHATS.length && inFinalMoment) {						
						finalAction("SHOOT", now);
					}
				}
			}
			alreadyPressed = true;
		} else if(!alreadyPressed && Keyboard.action.cancel && finalChat===FINALCHATS.length) {
			if(hero.gun) {
				hero.gun = 0;
				justPutGunDown = now;
			}
			talking = 0;
			finalAction("LEAVE", now);
		} else if(alreadyPressed && !Keyboard.action.down && !Keyboard.action.cancel) {
			alreadyPressed = false;
		}
	}

	let gameOver = 0;
	let inFinalMoment = false;
	let finalEnding = null;
	function finalAction(action, now) {
		if(!gameOver) {
			if(action==='SHOOT') {
				lastShot.time = now;
				Engine.playSound('laser');
				lastShot.target = null;
				lastShot.dx = hero.face.dx;
				lastShot.dy = lastShot.dx ? 0 : (hero.face.dy || 1);
				lastShot.x = hero.x + (Math.random()-.5)*5 + lastShot.dx * 20;
				lastShot.y = hero.y + (Math.random()-.5)*5 + lastShot.dy * 20 + (lastShot.dy < 0 ? -20 : 0);
				// for(let i=0; i<10; i++) {
				// 	particles.push([lastShot.x, lastShot.y, (Math.random() -.5) * 3 + lastShot.dx, (Math.random()-.5) * 2 + lastShot.dy]);
				// }
				gameOver = now;
				Engine.dispatchTrigger({trigger:'unforgivable', medal:'Unforgivable'});

			} else if(action==='LEAVE') {
				gameOver = now;
				Engine.dispatchTrigger({trigger:'forgiven', medal:'Happy Ending?'});
				if (npcShotCount === 0) {
					Engine.dispatchTrigger({trigger:'survivor', medal:'No casualty'});					
				}
			}
			finalEnding = action;
			if(isHardcore) {
				Engine.dispatchTrigger({trigger:'hardcore', medal:'Hardcore'});
			}
		}
	}

	function performActions4(now) {
		if(inFinalFinal || exited) {
			return;
		}
		if(exitedTheBuilding && now - exitedTheBuilding > 2000 ) {
			finalfinalScene(now);
			return;
		}
		if(!exitedTheBuilding && now > 20000) {
			goExit(now);
		}
	}

	function performActions3(now) {
		if(exitedTheBuilding && now - exitedTheBuilding > 2000 ) {
			finalScene(now);
		}


		const scrollGx = (settings.size[0] / 2 - hero.x + (hero.gun ? - hero.face.dx * 70 : talking && npcToTalk ? - hero.face.dx * 20 : 0));
		const scrollGy = (settings.size[1] / 2 - hero.y + (hero.gun ? - hero.face.dy * 60 + 30 : talking && npcToTalk ? 40 : 20));
		if (Math.abs(scrollGx - scroll.x) < 1) {
			scroll.x = scrollGx;
		} else {
			scroll.x += (scrollGx - scroll.x) / 10;
		}
		if (Math.abs(scrollGy - scroll.y) < 1) {
			scroll.y = scrollGy;
		} else {
			scroll.y += (scrollGy - scroll.y) / 10;
		}

		if(!exitedTheBuilding && hero.x / 32 < 17) {

			if (Keyboard.move.dx != hero.move.dx || Keyboard.move.dy != hero.move.dy) {
				const { dx, dy } = Keyboard.move;
				hero.move.dx = dx;
				hero.move.dy = dy;
			}

			const { dx, dy } = hero.move;
			const { face } = hero;

			if(dx || dy) {
				face.dx = dx;
				face.dy = dy;
			}

			window.hero = hero;

			const dist = Math.sqrt(dx * dx + dy * dy);
			if (dist) {
				let heroSpeed = shooting(now) ? 0 :  SPEED * 2 * (hero.gun || now - justPutGunDown ? 2 : 1);
				let realDx = heroSpeed * dx / dist;
				let realDy = heroSpeed * dy / dist;
				if (blocked(hero.x + realDx, hero.y + realDy)) {
					if (!blocked(hero.x + heroSpeed * dx, hero.y)) {

						if(Math.floor(hero.y / 32) < 7) {
//							hero.x += heroSpeed * dx;
						}
					} else if(!blocked(hero.x, hero.y + heroSpeed * dy)) {
						if(Math.floor(hero.y / 32) >= 7) {
//							hero.y += heroSpeed * dy;
						}
					} else {

					}
				} else {
					if(hero.y / 32 <= 7) {
						hero.x += realDx;
					}
					if(hero.y / 32 > 7) {
						hero.y += realDy;
					} else {
						hero.y = 7 * 32;
					}
				}
			}
		} else if(!exitedTheBuilding) {
			hero.move.dy = 0;
			hero.move.dx = 0;

			if(!talking) {
				talking = now;
				hero.move.dx = 0;
				hero.move.dy = 0;
				hero.face = {
					dx: hero.x < npcToTalk.x ? 1 : hero.x > npcToTalk.x ? -1 : 0, dy: 0,
				};
				npcToTalk.face = npcToTalk.lookAtHero;
				npcToTalk.lookAtHero.dx = hero.x < npcToTalk.x ? -1 : hero.x > npcToTalk.x ? 1 : 0;
				npcToTalk.lookAtHero.dy = 0;
				chatIndex = 0;
				discussionTopic = null;
				waitUp = false;
				finalChat = 0;
				chatIndex = 3;
			} else {

				if(!talking || !npcToTalk) {
					npcToTalk = null;
				} else {
					if(now - talking > 1000 && !npcToTalk.talking) {
						npcToTalk.talking = now;
					}//console.log(Keyboard.move.dy);

					if (!waitUp && Keyboard.move.dy) {
						chatIndex = Math.max(0, Math.min(3, chatIndex - Keyboard.move.dy)); //(chatIndex % 4 - Keyboard.move.dy + 4) % 4;
//						console.log(chatIndex);
						waitUp = true;
					} else if(!Keyboard.move.dy) {
						waitUp = false;
					}

				}

			}



			if(!alreadyPressed && Keyboard.action.down) {
				{
							let shouldTalk = npcToTalk.talking && now - npcToTalk.talking < lastMessage.length * SPEECH_SPEED;

					if(npcToTalk && !shouldTalk) {
	//					talking = talking ? 0 : now;
						if(!talking) {
						} else if (finalChat < FINALCHATS_NEXT) {
							npcToTalk.talking = 0;
							finalChat ++;
							chatIndex = 3;
						} else {
							npcToTalk.talking = 0;
							finalChat ++;
							chatIndex = 3;
							goExit(now);
						}
					}
				}
				alreadyPressed = true;
			} else if(alreadyPressed && !Keyboard.action.down && !Keyboard.action.cancel) {
				alreadyPressed = false;
			}

		}
	}


	let finalChat = 0;

	function performActions2(now) {
		// if(!hero.gun) {
		// 	hero.gun = now;
		// }
		if(exitedTheBuilding && now - exitedTheBuilding > 2000 ) {
			finalScene(now);
		}


		const scrollGx = (settings.size[0] / 2 - (WORLD_SIZE[0]/2+16)  );
		const scrollGy = (settings.size[1] / 2 - hero.y + (hero.gun ? - hero.face.dy * 60 + 30 : talking && npcToTalk ? 40 : 20));
		if (Math.abs(scrollGx - scroll.x) < 1) {
			scroll.x = scrollGx;
		} else {
			scroll.x += (scrollGx - scroll.x) / 10;
		}
		if (Math.abs(scrollGy - scroll.y) < 1) {
			scroll.y = scrollGy;
		} else {
			scroll.y += (scrollGy - scroll.y) / 10;
		}

		if(!exitedTheBuilding) {
			if (Keyboard.move.dx != hero.move.dx || Keyboard.move.dy != hero.move.dy) {
				const { dx, dy } = Keyboard.move;
				hero.move.dx = dx;
				hero.move.dy = dy;
			}

			const { dx, dy } = hero.move;
			const { face } = hero;

			if(dx || dy) {
				face.dx = dx;
				face.dy = dy;
			}

			const dist = Math.sqrt(dx * dx + dy * dy);
			if (dist) {
				let heroSpeed = shooting(now) ? 0 :  SPEED * 2 * (hero.gun || now - justPutGunDown ? 2 : 1);
				let realDx = heroSpeed * dx / dist;
				let realDy = heroSpeed * dy / dist;
				if (blocked(hero.x + realDx, hero.y + realDy)) {
					if (!blocked(hero.x + heroSpeed * dx, hero.y)) {
						hero.x += heroSpeed * dx;
					} else if(!blocked(hero.x, hero.y + heroSpeed * dy)) {
						hero.y += heroSpeed * dy;
					} else {

					}
				} else {
					hero.x += realDx;
					hero.y += realDy;
					if(exiting(hero.x, hero.y)) {
						goExit(now);
					}
				}
			}
		}
	}

	let garyWhoAreYou = 0;
	let garyMemory = 0;
	let garyGun = 0;
	let garyScared = 0;
	let garyHidden = 0;

	let restarting = false;
	function performActions(now) {
		if(lost) {
			if(Keyboard.action.cancel && !restarting) {
				if(now - lost > 3000) {
					restarting = true;
					location.reload();
				}
			}
			return;
		}
		// if(!hero.gun) {
		// 	hero.gun = now;
		// }
		if(exitedTheBuilding && now - exitedTheBuilding > 2000 && !inHallway) {
			Engine.setData('music', null);
			secondScene(now);
		}


		const scrollGx = (settings.size[0] / 2 - hero.x + (hero.gun ? - hero.face.dx * 70 : talking && npcToTalk ? - hero.face.dx * 20 : 0));
		const scrollGy = (settings.size[1] / 2 - hero.y + (hero.gun ? - hero.face.dy * 60 + 30 : talking && npcToTalk ? 40 : 20));
		if (Math.abs(scrollGx - scroll.x) < 1) {
			scroll.x = scrollGx;
		} else {
			scroll.x += (scrollGx - scroll.x) / 10;
		}
		if (Math.abs(scrollGy - scroll.y) < 1) {
			scroll.y = scrollGy;
		} else {
			scroll.y += (scrollGy - scroll.y) / 10;
		}

		if(!exitedTheBuilding) {
			if(!talking) {
				if (Keyboard.move.dx != hero.move.dx || Keyboard.move.dy != hero.move.dy) {
					const { dx, dy } = Keyboard.move;
					hero.move.dx = dx;
					hero.move.dy = dy;
				}
			} else {
				if (!waitUp && Keyboard.move.dy) {
					chatIndex = Math.max(0, Math.min(3, chatIndex - Keyboard.move.dy)); //(chatIndex % 4 - Keyboard.move.dy + 4) % 4;
					if(whoAreYou() && chatIndex===1) {
						chatIndex = Math.max(0, Math.min(3, chatIndex - Keyboard.move.dy));
					}
					if(memoryLanes() && chatIndex===2) {
						chatIndex = Math.max(0, Math.min(3, chatIndex - Keyboard.move.dy));
					}
					waitUp = true;
				} else if(!Keyboard.move.dy) {
					waitUp = false;
				}
			}

			const { dx, dy } = hero.move;
			const { face } = hero;

			if(dx || dy) {
				face.dx = dx;
				face.dy = dy;
			}

			occupy(hero.x, hero.y, false);
			const dist = Math.sqrt(dx * dx + dy * dy);
			if (dist) {
				let heroSpeed = shooting(now) ? 0 :  SPEED * 2 * (hero.gun || now - justPutGunDown ? 2 : 1);
				let realDx = heroSpeed * dx / dist;
				let realDy = heroSpeed * dy / dist;
				if (blocked(hero.x + realDx, hero.y + realDy)) {
					if (!blocked(hero.x + heroSpeed * dx, hero.y)) {
						hero.x += heroSpeed * dx;
					} else if(!blocked(hero.x, hero.y + heroSpeed * dy)) {
						hero.y += heroSpeed * dy;
					} else {

					}
				} else {
					hero.x += realDx;
					hero.y += realDy;
					if(exiting(hero.x, hero.y)) {
						// justPutGunDown = now;
						// hero.gun = 0;

						goExit(now);
					}
				}
			}
			occupy(hero.x, hero.y, true);

			if(shooting(now)) {
				const shotDx = lastShot.dx * 40;
				const shotDy = lastShot.dy * 40;
				lastShot.x += shotDx;
				lastShot.y += shotDy;
				lastShot.size -= shotDx + shotDy;

				particles.forEach(particle => {
					const [,,dx,dy] = particle;
					particle[0] += dx;
					particle[1] += dy;
				});
			} else if(particles.length) {
				particles.length = 0;
			}


			if(!alreadyPressed && Keyboard.action.down) {
				if (hero.gun) {
					lastShot.time = now;
					Engine.playSound('laser');
					lastShot.target = null;
					lastShot.dx = hero.face.dx;
					lastShot.dy = hero.face.dy;
					if(!lastShot.dx && !lastShot.dy) {
						lastShot.dy = 1;
					}



					lastShot.x = hero.x + (Math.random()-.5)*5 + lastShot.dx * 20;
					lastShot.y = hero.y + (Math.random()-.5)*5 + lastShot.dy * 20;// + (lastShot.dy < 0 ? -20 : 0);

					let size = 8;
					// for(size = 1; size < 10; size++) {
					// 	const x = lastShot.x + size*lastShot.dx;
					// 	const y = lastShot.y + size*lastShot.dy;
					// 	if (blocked(x, y, true)) {
					// 		break;
					// 	}
					// }
					lastShot.size = size * 32;

					for(let i=0; i<10; i++) {
						particles.push([lastShot.x, lastShot.y, (Math.random() -.5) * 3 + lastShot.dx, (Math.random()-.5) * 2 + lastShot.dy]);
					}
				} else {
					if(npcToTalk) {
	//					talking = talking ? 0 : now;
						if(!talking) {
							talking = now;
							hero.move.dx = 0;
							hero.move.dy = 0;
							hero.face = {
								dx: hero.x < npcToTalk.x ? 1 : hero.x > npcToTalk.x ? -1 : 0, dy: 0,
							};
							npcToTalk.face = npcToTalk.lookAtHero;
							npcToTalk.lookAtHero.dx = hero.x < npcToTalk.x ? -1 : hero.x > npcToTalk.x ? 1 : 0;
							npcToTalk.lookAtHero.dy = 0;
							chatIndex = 0;
							discussionTopic = null;
						} else {
							let shouldTalk = npcToTalk.talking && now - npcToTalk.talking < lastMessage.length * SPEECH_SPEED;

							if(!shouldTalk) {
								switch(chatIndex) {
									case 0: // GOODBYE
									{
										discussionTopic = null;
										npcToTalk.move.dx = Math.floor(Math.random() * 3) - 1;
										npcToTalk.move.dy = Math.floor(Math.random() * 3) - 1;		
										npcToTalk.face = npcToTalk.move;	
										talking = 0;		
									}
									break;
									case 1: // WHO ARE YOU?
									{
										if (!whoAreYou()) {
											discussionTopic = "WHO_ARE_YOU";
											npcToTalk.talking = 0;
											chatIndex = 0;
										}
									}
									break;
									case 2: // MEMORY LANE
									{
										if (!memoryLanes()) {
											discussionTopic = "MEMORY";
											npcToTalk.talking = 0;
											chatIndex = 0;
										}
									}
									break;
									case 3: // GUN
									{
										if(!garyGun) {
											garyGun++;
											garyScared++;
										}

										discussionTopic = null;
										hero.gun = now;
										npcToTalk.move.dx = Math.floor(Math.random() * 3) - 1;
										npcToTalk.move.dy = Math.floor(Math.random() * 3) - 1;		
										npcToTalk.face = npcToTalk.move;	
										talking = 0;
										Engine.setData('music', 'vick_n_vorty');
									}
									break;
								}
							}
						}
					} else {
						if(Math.round(hero.x/32) >= 14 && Math.round(hero.x/32) <= 15 && Math.round(hero.y/32)===3
							&& hero.face.dy < 0 && hero.face.dx===0) {
							tv = tv%4 + 1;
							if(tv===4) {
								Engine.dispatchTrigger({trigger:'tv', medal:'Channel Zombie'});
							}
						}
					}
				}
				alreadyPressed = true;
			} else if(!alreadyPressed && Keyboard.action.cancel) {
//				if (ppCount === 0) {
					if(hero.gun) {
						hero.gun = 0;
						justPutGunDown = now;
						Engine.setData('music', 'spring_sprinkle');				
					}
					talking = 0;
//				}
			} else if(alreadyPressed && !Keyboard.action.down && !Keyboard.action.cancel) {
				alreadyPressed = false;
			}

			if(!talking || !npcToTalk) {
				npcToTalk = null;
			} else {
				const dx = npcToTalk.x - (hero.x + hero.face.dx * 40);
				const dy = npcToTalk.y - hero.y;
				if (dx !== 0) {
					if(Math.abs(dx) < 1) {
						npcToTalk.move.dx = 0;
						npcToTalk.x = hero.x + hero.face.dx * 40;
					} else {
						npcToTalk.move.dx = dx > 0 ? -1 : 1;
					}
				}
				if (dy !== 0) {
					if(Math.abs(dy) < 1) {
						npcToTalk.move.dy = 0;
						npcToTalk.y = hero.y;
					} else {
						npcToTalk.move.dy = dy > 0 ? -1 : 1;
					}				
				}
				if(now - talking > 1000 && !npcToTalk.talking) {
					npcToTalk.talking = now;
				}
			}
		}

		const npcSpeed = SPEED * (hero.gun ? 5 : 1);
		const wasShooting = shooting(now);
		const SHOOT_MARGIN_X = 100;
		const SHOOT_MARGIN_Y = 100;
		const SHOOTING_AREA_X = 10;
		const SHOOTING_AREA_Y = 20;
		let shotNpc = null;
		let countParasiteDown = 0;


		parasites.forEach(parasite => {
//			return;
			if(now - parasite.born < 700 || parasite.shot) {
				return;
			}
			{
				const dx = hero.x - parasite.x;
				const dy = hero.y - parasite.y;
				const distHero = Math.sqrt(dx * dx + dy * dy);
				//console.log(distHero);
				if (distHero < 40) {
					if(!hero.lastHit || now - hero.lastHit > IMMUNE_TIME) {
						hero.lastHit = now;
						if(heartCount<= 0) {
				//			console.log('here');
							lost = now;
//							timeFreeze = true;
						}
						heartCount--;
						Engine.playSound('hit');
					}
				} else if (distHero < 60) {
					// if (dx * parasite.move.dx >= 0 && dy * parasite.move.dy >= 0) {
					// 	parasite.move.dx = Math.floor(Math.random() * 3) - 1;
					// 	parasite.move.dy = Math.floor(Math.random() * 3) - 1;
					// }
					// if (dx * parasite.move.dx > 0 && dy * parasite.move.dy > 0) {
					// 	parasite.move.dx *= -1;
					// 	parasite.move.dy *= -1;
					// }
				} else if(distHero < 100 && dx * parasite.move.dx >= 0 && dy * parasite.move.dy >= 0) {
					// parasite.move.dx = Math.floor(Math.random() * 3) - 1;
					// parasite.move.dy = Math.floor(Math.random() * 3) - 1;
				} else if (distHero > 400) {
					// parasite.move.dx = 0;
					// parasite.move.dy = 0;					
				}
			}


			if(wasShooting && !shotNpc && lastShot.target == null && !parasite.shot)
			{
				const { dx, dy } = lastShot;
				const [width, height] = settings.size;
				let shot = false;
				if(dx && dy) {
					if(dy * (parasite.y - lastShot.y) > 0 && dx * (parasite.x - lastShot.x) > 0) {
						//console.log((npc.x -lastShot.x) - (npc.y-lastShot.y));
						if((parasite.x -lastShot.x) - (parasite.y-lastShot.y) < SHOOTING_AREA_X + SHOOT_MARGIN_Y) {
							shot = now;
						}
					}
//					console.log((npc.x -lastShot.x) / (npc.y-lastShot.y));
					// const alignY = npc.y + dx * npc.x;
					// if (dx * (npc.x - lastShot.x) > 0 && Math.abs(alignY- 16 - lastShot.y) < SHOOTING_AREA_Y && onScreen(npc)) {
					// 	shot = now;
					// }					
				} else if(!dx) {	//	SHOOTING VERTICAL
					if (dy * (parasite.y - lastShot.y) > 0 && Math.abs(parasite.x - lastShot.x) < SHOOTING_AREA_X && onScreen(parasite)) {
						shot = now;
					}
				} else if(!dy) {	//	SHOOTING HORIZONTAL
					if (dx * (parasite.x - lastShot.x) > 0 && Math.abs(parasite.y - 16 - lastShot.y) < SHOOTING_AREA_Y && onScreen(parasite)) {
						shot = now;
					}
//					console.log(npc.y, lastShot.y, npc.y - 16 - lastShot.y);
				}
				if(shot) {
					Engine.playSound('parasite_die');
					// lastKilled.time = now;
					// lastKilled.npc = parasite;
					// lastKilled.parasite = npc.parasite;
					shotNpc = parasite;
					parasite.shot = now;
					lastShot.target = parasite;
					ppCount --;
					//timeFreeze = true;
					// for(let i=0; i<10; i++) {
					// 	particles.push([dx===0 ? lastShot.x : npc.x, dy===0 ? lastShot.y : npc.y, (Math.random() -.5) * 3 + lastShot.dx, (Math.random()-.5) * 2 + lastShot.dy]);
					// }

					// if(npc.parasite) {
					// 	parasiteCount--;
					// 	// console.log(totalParasiteCount - parasiteCount);
					// 	for(let i=0; i < totalParasiteCount - parasiteCount; i++) {
					// 		parasites.push(
					// 			{ born: now, x: npc.x, y: npc.y, move: {dx: Math.random()-.5, dy: Math.random()-.5} },
					// 		);
					// 	}
					// }

//					console.log(npc);
				}
			}			

			{
				const speed = 3;
				let { dx, dy } = parasite.move;
				let dist = Math.sqrt(dx * dx + dy * dy);
				if (dist) {
					let realDx = speed * dx / dist;
					let realDy = speed * dy / dist;

					// parasite.x += realDx;
					// parasite.y += realDy;



					if (parasite.blocked < 100) {
						if (blocked(parasite.x + realDx, parasite.y + realDy, false)) {
							if (!blocked(parasite.x + realDx, parasite.y - realDy, false)) {
								realDy = -realDy;
								parasite.move.dy = -dy;
								parasite.blocked++;
							} else if(!blocked(parasite.x - realDx, parasite.y + realDy, false)) {
								realDx = -realDx;
								parasite.move.dx = -dx;
								parasite.blocked++;
							} else {
								parasite.move.dx = -dx;
								parasite.move.dy = -dy;
								parasite.blocked++;
							}
						}
					} else {
						parasite.move.dx = (WORLD_SIZE[0]/2 - parasite.x);
						parasite.move.dy = (WORLD_SIZE[1]/2 - parasite.y);
						const dist = (parasite.move.dx * parasite.move.dx - parasite.move.dy * parasite.move.dy);
						parasite.move.dx /= dist;
						parasite.move.dy /= dist;
						if (!blocked(parasite.x + realDx, parasite.y + realDy, true) && dist < 100) {
							parasite.blocked = 0;
						}
					}

					parasite.x += realDx;
					parasite.y += realDy;
					// if(npc.x < 0 && dx < 0) {
					// 	npc.x = 0;
					// 	npc.move.dx = -dx;
					// }
					// if(npc.x > WORLD_SIZE[0] && dx > 0) {
					// 	npc.x = WORLD_SIZE[0];
					// 	npc.move.dx = -dx;
					// }
					// if(npc.y < 0 && dy < 0) {
					// 	npc.y = 0;
					// 	npc.move.dy = -dy;
					// }
					// if(npc.y > WORLD_SIZE[1] && dy > 0) {
					// 	npc.y = WORLD_SIZE[1];
					// 	npc.move.dy = -dy;
					// }		
				}

					// if(parasite.x < 0 && dx < 0) {
					// 	parasite.x = 0;
					// 	parasite.move.dx = -dx;
					// }
					// if(parasite.x > WORLD_SIZE[0] && dx > 0) {
					// 	parasite.x = WORLD_SIZE[0];
					// 	parasite.move.dx = -dx;
					// }
					// if(parasite.y < 0 && dy < 0) {
					// 	parasite.y = 0;
					// 	parasite.move.dy = -dy;
					// }
					// if(parasite.y > WORLD_SIZE[1] && dy > 0) {
					// 	parasite.y = WORLD_SIZE[1];
					// 	parasite.move.dy = -dy;
					// }		
				// }
			}

		});

		npcs.forEach(npc => {
			if(npc.hidden) {
				return;
			}
			if(wasShooting && !shotNpc && lastShot.target == null && !npc.husband && !npc.shot)
			{
				const { dx, dy } = lastShot;
				const [width, height] = settings.size;
				let shot = false;
				if(dx && dy) {
					if(dy * (npc.y - lastShot.y) > 0 && dx * (npc.x - lastShot.x) > 0) {
						//console.log((npc.x -lastShot.x) - (npc.y-lastShot.y));
						if((npc.x -lastShot.x) - (npc.y-lastShot.y) < SHOOTING_AREA_X + SHOOT_MARGIN_Y) {
							shot = now;
						}
					}
//					console.log((npc.x -lastShot.x) / (npc.y-lastShot.y));
					// const alignY = npc.y + dx * npc.x;
					// if (dx * (npc.x - lastShot.x) > 0 && Math.abs(alignY- 16 - lastShot.y) < SHOOTING_AREA_Y && onScreen(npc)) {
					// 	shot = now;
					// }					
				} else if(!dx) {	//	SHOOTING VERTICAL
					if (dy * (npc.y - lastShot.y) > 0 && Math.abs(npc.x - lastShot.x) < SHOOTING_AREA_X && onScreen(npc)) {
						shot = now;
					}
				} else if(!dy) {	//	SHOOTING HORIZONTAL
					if (dx * (npc.x - lastShot.x) > 0 && Math.abs(npc.y - 16 - lastShot.y) < SHOOTING_AREA_Y && onScreen(npc)) {
						shot = now;
					}
//					console.log(npc.y, lastShot.y, npc.y - 16 - lastShot.y);
				}
				if(shot) {
//					Engine.playSound('parasite_die');
					lastKilled.time = now;
					lastKilled.npc = npc;
					lastKilled.parasite = npc.parasite;
					shotNpc = npc;
					npc.shot = now;
					if(!npc.parasite) {
						if(heartCount<= 0) {
							//console.log('here');
							lost = now;
//							timeFreeze = true;
						}
						heartCount--;
						npcCount --;
						npcShotCount ++;
						Engine.playSound('hit');
					}
					lastShot.target = npc;
					//timeFreeze = true;
					for(let i=0; i<10; i++) {
						particles.push([dx===0 ? lastShot.x : npc.x, dy===0 ? lastShot.y : npc.y, (Math.random() -.5) * 3 + lastShot.dx, (Math.random()-.5) * 2 + lastShot.dy]);
					}

					if(npc.parasite) {
						Engine.playSound('parasite_die');
						parasiteCount--;
						countParasiteDown++;
						if(isCustomDifficulty) {
							Engine.dispatchTrigger({score:"Most parasites killed in custom mode", value:countParasiteDown});
						}
						// console.log(totalParasiteCount - parasiteCount);
						for(let i=0; i < totalParasiteCount - parasiteCount; i++) {
							let dx = Math.random()-.5, dy = Math.random()-.5;
							ppCount++;
							parasites.push(
								{ born: now, x: npc.x, y: npc.y, move: {dx, dy} },
							);
							// if(dx * dy > 0) {
							// 	dx = -dx;
							// } else {
							// 	dy = -dy;
							// }
						}
					}

//					console.log(npc);
				}
			}

			if(timeFreeze || npc.shot) {
				return;
			}
			occupy(npc.x, npc.y, false);

			//	avoid hero
			if (hero.gun && npc.blocked < 100)
			{
				const dx = hero.x - npc.x;
				const dy = hero.y - npc.y;
				const distHero = Math.sqrt(dx * dx + dy * dy);
				if (distHero < 60) {
					if (dx * npc.move.dx >= 0 && dy * npc.move.dy >= 0) {
						npc.move.dx = Math.floor(Math.random() * 3) - 1;
						npc.move.dy = Math.floor(Math.random() * 3) - 1;
					}
					if (dx * npc.move.dx > 0 && dy * npc.move.dy > 0) {
						npc.move.dx *= -1;
						npc.move.dy *= -1;
					}
				} else if(distHero < 100 && dx * npc.move.dx >= 0 && dy * npc.move.dy >= 0) {
					npc.move.dx = Math.floor(Math.random() * 3) - 1;
					npc.move.dy = Math.floor(Math.random() * 3) - 1;
				} else if (distHero > 400) {
					npc.move.dx = 0;
					npc.move.dy = 0;					
				}
			} else if(npc !== npcToTalk) {
				const dx = hero.x - npc.x;
				const dy = hero.y - npc.y;
				const distHero = Math.sqrt(dx * dx + dy * dy);
				if (talking && npcToTalk) {
					if (distHero < 60) {
						if (dx * npc.move.dx >= 0 && dy * npc.move.dy >= 0) {
							npc.move.dx = Math.floor(Math.random() * 3) - 1;
							npc.move.dy = Math.floor(Math.random() * 3) - 1;
						}
						if (dx * npc.move.dx > 0 && dy * npc.move.dy > 0) {
							npc.move.dx *= -1;
							npc.move.dy *= -1;
						}
					}
				} else {
					if (Math.random() < .001) {
						npc.move.dx = Math.floor(Math.random() * 3) - 1;
						npc.move.dy = Math.floor(Math.random() * 3) - 1;
					} else if(Math.random() < .001) {
						npc.move.dx = 0;
						npc.move.dy = 0;
					}				
				}
			}

			if(showGun()) {
				npc.face = npc.lookAtHero;
				npc.lookAtHero.dx = hero.x < npc.x ? -1 : hero.x > npc.x ? 1 : 0;
				npc.lookAtHero.dy = npc.move.dy;				
			} else if(npc !== npcToTalk) {
				npc.face = npc.move;
			}

			//	move
			{
				if(!talking && !npc.shot)
				{
					const dx = hero.x - npc.x + (hero.face ? hero.face.dx * 15 : 0);
					const dy = hero.y - npc.y;
					const distHero = Math.sqrt(dx * dx + dy * dy);
					if(distHero < 30) {
						npcToTalk = npc;
						npcToTalk.talking = 0;

					}
				}

				let { dx, dy } = npc.move;


				const goThroughWall = npc.husband && garyScared>=2 && hero.gun;
				if(goThroughWall) {
					dx = door.x + 10 - npc.x;
					dy = door.y + 50 - npc.y;
				}


				let dist = Math.sqrt(dx * dx + dy * dy);
				if(goThroughWall) {
					if(dist < 10) {
						garyHidden = now;
						npc.hidden = true;
					}
				}
				if (dist) {
					let realDx = npcSpeed * dx / dist;
					let realDy = npcSpeed * dy / dist;
					if (npc.blocked < 100 && !goThroughWall) {
						if (blocked(npc.x + realDx, npc.y + realDy, true)) {
							if (!blocked(npc.x + realDx, npc.y - realDy, true)) {
								realDy = -realDy;
								npc.move.dy = -dy;
								npc.blocked++;
							} else if(!blocked(npc.x - realDx, npc.y + realDy, true)) {
								realDx = -realDx;
								npc.move.dx = -dx;
								npc.blocked++;
							} else {
								npc.move.dx = -dx;
								npc.move.dy = -dy;
								npc.blocked++;
							}
						}
					} else {
						npc.move.dx = (WORLD_SIZE[0]/2 - npc.x);
						npc.move.dy = (WORLD_SIZE[1]/2 - npc.y);
						const dist = (npc.move.dx * npc.move.dx - npc.move.dy * npc.move.dy);
						npc.move.dx /= dist;
						npc.move.dy /= dist;
						if (!blocked(npc.x + realDx, npc.y + realDy, true) && dist < 100) {
							npc.blocked = 0;
						}
					}

					npc.x += realDx;
					npc.y += realDy;
					// if(npc.x < 0 && dx < 0) {
					// 	npc.x = 0;
					// 	npc.move.dx = -dx;
					// }
					// if(npc.x > WORLD_SIZE[0] && dx > 0) {
					// 	npc.x = WORLD_SIZE[0];
					// 	npc.move.dx = -dx;
					// }
					// if(npc.y < 0 && dy < 0) {
					// 	npc.y = 0;
					// 	npc.move.dy = -dy;
					// }
					// if(npc.y > WORLD_SIZE[1] && dy > 0) {
					// 	npc.y = WORLD_SIZE[1];
					// 	npc.move.dy = -dy;
					// }		
				}
			}
			occupy(npc.x, npc.y, true);
		});
	}

	function getSprite(name, x, y, dx, dy, npc, now, option) {
		const OFFSET_X = -16, OFFSET_Y = -32;


		const move = npc.move;
		const moveDist = Math.sqrt(move.dx*move.dx + move.dy*move.dy);
		const character = characters[name];
		const headSprite = npc.head || character.head;

		const faceDx = npc.face ? npc.face.dx : dx;
		const faceDy = npc.face ? npc.face.dy : dy;
		const skinColor = npc.skinColor || character.skinColor || 'default';
		const bodyColor = npc.bodyColor || character.bodyColor || 'default';
		const hairColor = npc.hairColor || character.hairColor || 'default';
		const beard = npc.beard || character.beard || null;
		const hair = npc.hair || character.hair || 'bald';
		const comboColor = skinColor + '-' + bodyColor;
		let face = null;
		let body = null;
		let mouth = null;
		let downThere = null;
		let fronthair = null;
		let backhair = null;
		let beardSprite;
		const size = option ? option.size : null;

		if(npc.shot) {
			return [
				'group', x, y, {}, [
					[npc.parasite ? 'parasite-exit' : 'npc-dead', OFFSET_X, OFFSET_Y, {animated: !lost, color: comboColor, flip: dx>0, animationStart: npc.shot }],
				],
			];
		}


		let head = [headSprite, OFFSET_X, OFFSET_Y +-26, {animated: !DEBUG.freezeBody && !lost && moveDist, color: skinColor, flip: npc.husband ? faceDx>0 : false }];

		// if(npc===hero)
		// 	console.log(dx, dy);
		if (!dx) {
			if (dy < 0) {
				body = [character['body-up'], OFFSET_X, OFFSET_Y, {animated:  !DEBUG.freezeBody && !lost &&moveDist, color: comboColor }];
			} else if(dy > 0) {
				body = [character['body-down'], OFFSET_X, OFFSET_Y, {animated:  !DEBUG.freezeBody && !lost &&moveDist, color: comboColor }];
			} else {
				body = [character['body-down'], OFFSET_X, OFFSET_Y, {animated:  !DEBUG.freezeBody && !lost &&moveDist, color: comboColor }];
			}
		} else {
			if (dx < 0) {
				body = [character['body-left'], OFFSET_X, OFFSET_Y, {animated:  !DEBUG.freezeBody && !lost &&moveDist, color: comboColor }];
			} else {
				body = [character['body-right'], OFFSET_X, OFFSET_Y, {animated: !DEBUG.freezeBody &&  !lost &&moveDist, flip: !showGun() && dx>0, color: comboColor, }];
			}
		}

		if (faceDy >= 0 || npc.husband || inFinalFinal && npc===hero) {
			const faceOffsetX = dy===0 ? (faceDx < 0 ? 4 : 5) : (faceDx < 0 ? 1 : 2);
			face = [character['face'], OFFSET_X + faceDx * faceOffsetX, OFFSET_Y -26 + faceDy, {animated:  !lost, animMove:  !DEBUG.freezeBody && !lost &&moveDist, flip: faceDx>0}];
			let shouldTalk = !memoryLanes() && npc.talking && now - npc.talking < lastMessage.length * SPEECH_SPEED;
			
			if(inFinalFinal && finalChat < FINALCHATS.length) {
				if(FINALCHATS[finalChat][1]) {

					if(npc!==hero) {
						shouldTalk = false;
					} else {
						shouldTalk = gary.talking && now - gary.talking < lastMessage.length * SPEECH_SPEED;
					}
					// shouldTalk = shouldTalk && npc !== hero;
					// console.log("here", shouldTalk, npc===hero);
					// if(shouldTalk && !hero.talking) {
					// 	hero.talking = now;
					// 	console.log("HERE", hero.talking);
					// }
				} else {
					shouldTalk = shouldTalk && npc.type==='gary'
				}
			}

			if(inFinalMoment) {
				shouldTalk = false;
			}

			mouth = [character['mouth'], OFFSET_X + faceDx * faceOffsetX, OFFSET_Y -26 + faceDy, {
				animated:  !lost && shouldTalk, flip: faceDx>0, animMove:  !DEBUG.freezeBody && !lost &&moveDist,
				frame: inFinal ? 2 : (hero.gun || npc!==hero && (justPutGunDown && now - justPutGunDown < 2000 || showGun() || !lastKilled.parasite && lastKilled.time && now - lastKilled.time < 60000) ? (npc===hero ? 2 : npc.id % 3 + 1) : 0),
			}];

			beardSprite = beard ? [beard, OFFSET_X, OFFSET_Y -26 + faceDy, {
				animMove:  !DEBUG.freezeBody && !lost &&moveDist, color: hairColor,
			}] : null;

			fronthair = hair && hair !== 'bald' ? [hair,  OFFSET_X, OFFSET_Y -26 + faceDy, {
				animMove:  !DEBUG.freezeBody && !lost &&moveDist, color: hairColor,
				frame: 0, flip: dx<0, 
			}] : null;

			backhair = hair && hair !== 'bald'  ?  [hair,  OFFSET_X, OFFSET_Y -26 + faceDy, {
				animMove:  !DEBUG.freezeBody && !lost &&moveDist, color: hairColor,
				frame: 1, flip: dx<0, 
			}] : null;

		} else if (faceDy < 0) {
			const faceOffsetX = dy===0 ? (faceDx < 0 ? 4 : 5) : (faceDx < 0 ? 1 : 2);
			fronthair = hair && hair !== 'bald'  ? [hair,  OFFSET_X + faceDx * faceOffsetX, OFFSET_Y -26 + faceDy, {
				animMove:  !DEBUG.freezeBody && !lost &&moveDist, color: hairColor,
				frame: 2,
			}] : null;
			backhair = null;
		}

		if (bodyColor==='nude' && body[0]===character['body-down']) {
			downThere = [(npc.gender || character.gender || 'penis'), OFFSET_X, OFFSET_Y, {animated: !lost && moveDist}];
		}


		const bubble = !inFinalMoment && !hero.gun && npc === npcToTalk && !talking ? ['bubble', OFFSET_X - 5, OFFSET_Y - 30, {}] : 0;

		return [
			'group', x, y, {}, [
				backhair,
				body,
				head,
				fronthair,
				face,
				beardSprite,
				mouth,
				downThere,
				bubble,
			],
		];
	}

	function getRandom(array) {
		return array[Math.floor(Math.random() * array.length)];
	}

	const SPRITE_SIZE = 32;
	function onScreen(object) {
		if(object.hidden) return false;
		if(object.alwaysOnScreen) return true;
		const [ width, height ] = settings.size;
		return object.x + scroll.x > -SPRITE_SIZE && object.x + scroll.x < width + SPRITE_SIZE && object.y + scroll.y > -SPRITE_SIZE && object.y + scroll.y < height + SPRITE_SIZE * 2;
	}

	function shooting(now) {
		return lastShot.time && now - lastShot.time < 150;
	}

	let discussionTopic = null;
	function whoAreYou() {
		return discussionTopic == "WHO_ARE_YOU";
	}

	function memoryLanes() {
		return discussionTopic == "MEMORY";
	}

	// const MENU_SPOTS = [
	// 	[110, 85, 'hair'],
	// 	[110, 85, 'color'],
	// 	[110, 95, 'face'],
	// 	[110, 95, 'color'],
	// 	[110, 120, 'body'],
	// ];

//		const switchers = ['hair', 'hairColor', 'head', 'face', 'skinColor', 'bodyColor'];

	const SPACING = 18;
	const MENUYSTART = 190;
	const CUSTOM_MENU = [
		['NAME', 122, MENUYSTART],
		['CHANGE PLAYER', 122, MENUYSTART + SPACING*1],
		['OPTIONS', 122, MENUYSTART + SPACING*2],
		['START', 122, MENUYSTART + SPACING*3],
	];

	const OPTIONS_MENU = [
		['BACK', 122, MENUYSTART],
		['TEXT SPEED', 122, MENUYSTART + SPACING*1],
		['NUDITY', 122, MENUYSTART + SPACING*2],
		['DIFFICULTY', 122, MENUYSTART + SPACING*3],
		['HOW TO PLAY', 122, MENUYSTART + SPACING*4],
	];

	const TEXT_SPEED_MENU = [
		['NORMAL', 122, MENUYSTART],
		['FAST', 122, MENUYSTART + SPACING*1]
	];

	const NUDITY_MENU = [
		['NO NUDITY', 122, MENUYSTART],
		['ALLOW NUDITY', 122, MENUYSTART + SPACING*1],
	];

	const HOW_TO_PLAY_MENU = [
		['MORE', 122, MENUYSTART],
	];

	const MORE_HOW_TO_PLAY_MENU = [
		['BACK', 122, MENUYSTART],
	];

	const DIFFICULTY_MENU = [
		['NORMAL', 122, MENUYSTART],
		['HARD', 122, MENUYSTART + SPACING*1],
		['CUSTOM', 122, MENUYSTART + SPACING*2],
	];

	let cursor = 0;
	let playerName = localStorage.getItem('playerName') || '';
	let entryMode = false;
	let menuTime = 0;

	let menuType = 0;
	let MENUS = [CUSTOM_MENU, OPTIONS_MENU, TEXT_SPEED_MENU, NUDITY_MENU, HOW_TO_PLAY_MENU, MORE_HOW_TO_PLAY_MENU, DIFFICULTY_MENU];

	function getIntroSprites(now) {
		sprites.length = 0;
//		sprites.push(['text', 60, 70, {text: 'TOTAL RICKALL MASSACRE', color: 'white'}]);

		if(menuType===4) {
			sprites.push(['text', 20, 22, { text: 
				wrapTextWithLimit("This game is based on Rick and Morty's episode 4 of season 2. It may " +
					"contain spoilers. " +
					"Parasites have infiltrated your home, and mixed themselves among " +
					"your family and friends. They also implanted memories of themselves " +
					"in everyone's brain. As a result, you can't tell who's real and who's not. " +
					"To uncover their real identity, " +
					"you must discuss with each person and find out if they are parasite. There " +
					"must be a way to tell them apart. (Of course, if you've watched the Rick and Morty "+
					"episode this is based on, you already know the answer!)."
				, 42), 
				color: '#ddddee', 
				speechSpeed: 1, 
				talkTime: menuTime,
				zOrder: 3, outline: '#221111',
				noCenter: true,
				lineHeight: 14,
			}]);
			return sprites;
		} else if(menuType===5) {
			sprites.push(['text', 20, 72, { text: 
				"ARROW KEYS or WASD to move\n\n" +
				"SPACE BAR or ENTER to talk or shoot.\n\n" +
				"ESC or P to put away the gun.", 
				color: '#ddddee', 
				speechSpeed: 1, 
				talkTime: menuTime,
				zOrder: 3, outline: '#221111',
				noCenter: true,
				lineHeight: 14,
			}]);
			return sprites;
		}

		sprites.push(['total-rickall-massacre', 0, 0, {}]);
		sprites.push(['rect', 0, 90, {width: 320, height: 64, color: '#1b1277'}])
		const INITIAL_SHIFT = -10;

		sprites.push(getSprite('hero', 170 + INITIAL_SHIFT, 150, 0, 0, hero, now, {
			size: [128, 128],
		}));


		const { count, total } = Engine.loadInfo;
		if(count < total * .9) {
			sprites.push(['text', 134 + INITIAL_SHIFT, MENUYSTART, {text:Math.ceil(count/total * 10*100)/10 + "%", color:'white', fontSize: 20 }]);
			return sprites;
		}

		if(isCustomDifficulty && ngio.user && ngio.user.id) {
			sprites.push(['text', 60, 257, {text:"Final ending not available in custom mode", color:'#992222', fontSize: 11 }]);			
		}


		const MENUYSHIFT = menuType===1 ? -10 : 0;
		// const [ menuX, menuY ] = MENU_SPOTS[customMenu];
		if(!entryMode) {
			sprites.push(['pointer', 87 + INITIAL_SHIFT,MENUYSTART - 180 +155+ customMenu * SPACING + MENUYSHIFT, { animated: true, frameRate: 20 }]);
		}
		for(let i=0; i<MENUS[menuType].length; i++) {
			let [ text, x, y ] = MENUS[menuType][i];
			const color = i===customMenu ? 'yellow':'white';
			if(menuType === 0 && i===0 && (playerName || entryMode)) {
				let p = playerName;
				if(entryMode) {
					if(Math.floor(now/100) % 2 === 0) {
						p = p.split("").concat(' ');
						p.splice(cursor, 1, '_');
						p = p.join('');
					} else {
						p = p.split("").concat(' ');
						p = p.join('');						
					}
				}
				text += ': ' + p + "";
			}
			if(menuType===6 && i===2 && customMenu===2) {
				let count = !localStorage.getItem('difficulty') ? 12 : localStorage.getItem('difficulty') === 'hard' ? 16 
					: localStorage.getItem('difficulty');
				text += ': ' + count  + ' PEOPLE';
			}
			sprites.push(['text', x+ INITIAL_SHIFT, y + MENUYSHIFT, { text, color}]);
		}
		return sprites;
	}



	let tv = 1;
	let lost = DEBUG.lost;
	const sprites = [];
	function getSprites(now) {

		sprites.length = 0;
		if(skipOnce) {
			skipOnce = false;
			return sprites;
		}
		if(!exitedTheBuilding || inFinal) {
			let stopShoot = false;
			if(finalEnding==='SHOOT') {
				stopShoot = now - lastShot.time > 3000;
			}
//			window.hero = hero;

			const heroSprite = stopShoot ? 'hero' : shooting(now) ? 'gunshooting' : showGun() ? 'gun' : 'hero';
			const heroDx = finalEnding==='SHOOT' ? 1 : hero.face.dx;
			const heroDy = hero.face.dy;
			//console.log(heroDx, heroDy);
			// const heroDx = hero.gun ? hero.face.dx : hero.move.dx;
			// const heroDy = hero.gun ? hero.face.dy : hero.move.dy;
			if(!hero.lastHit || now - hero.lastHit > IMMUNE_TIME || Math.floor(now / 40) % 3 !==0) {
				sprites.push(getSprite(heroSprite, scroll.x + hero.x, scroll.y + hero.y, heroDx, heroDy, hero, now));
			}
		}

		npcs.forEach(npc => {
			if (onScreen(npc)) {
//				if(!npc.shot || Math.random() > .8) {
					if(npc.husband && finalEnding === 'SHOOT') {
						return;
					}

					sprites.push(getSprite(npc.type, scroll.x + npc.x, scroll.y + npc.y, npc.move.dx, npc.move.dy, npc, now));
//				}
			}
		});

		tiles.forEach(tile => {
			const x = Engine.evaluate(tile.x);
			const y = Engine.evaluate(tile.y);
			if (onScreen(tile) || inFinal) {
				if(tile.door === 'opened') {
					if(canExit() || garyHidden && now - garyHidden < 200) {
						sprites.push([tile.type, scroll.x + x, scroll.y + y, {animated: false, frame: tile.frame, alpha: tile.alpha}]);
					}
				} else if(tile.door === 'closed') {
					if(!canExit()) {
						sprites.push([tile.type, scroll.x + x, scroll.y + y, {animated: false, frame: tile.frame, alpha: tile.alpha}]);						
					}
				} else {
					sprites.push([tile.type, scroll.x + x, scroll.y + y, {animated: false, frame: tile.frame, alpha: tile.alpha}]);
				}
			}
		});

		if (talking && npcToTalk && finalChat < FINALCHATS.length) {
			const LETTER_BOX_SIZE = Math.min(70, (now - talking) / 8);
			if(!inFinal) {
				sprites.push(['rect',0, 0, { width: settings.size[0], height: LETTER_BOX_SIZE, zOrder: 1 }]);
			}
			sprites.push(['rect',0, settings.size[1] - LETTER_BOX_SIZE, { width: settings.size[0], height: LETTER_BOX_SIZE, zOrder: 1 }]);
			if(npcToTalk && npcToTalk.talking) {
				const killed = (now - lastKilled.time) < 60000 ? lastKilled.npc : null;
				const topics = !killed ? HOT_TOPICS.normal : killed.parasite ? HOT_TOPICS.justKilled : HOT_TOPICS.justKilledHuman;
				let text = memoryLanes() ? npcToTalk.memory : whoAreYou() ? npcToTalk.introduction : npcToTalk.husband ? (inFinal?
					(FINALCHATS[finalChat][0]):"Remember our vacation?") 
				: (topics[npcToTalk.id % topics.length]).split("{parasite}").join("" + 
					(NUMBERS[parasiteCount]||parasiteCount)); //'Greetings. What can I do for you?';
				lastMessage = text;
				if (killed) {
					text = text.split("{name}").join(killed.name).split("{occupation}").join(killed.occupation);
				}
				//console.log(npcToTalk.textColor);
				if(memoryLanes()) {
					sprites.push(['text', 20, 42, { text, color: 'white', speechSpeed: SPEECH_SPEED, talkTime: npcToTalk.talking, zOrder: 3, outline: '#222222' }]);
				} else {
					sprites.push(['text', 
						- (inFinalFinal && FINALCHATS[finalChat][1] ? 50 : 0) +
						settings.size[0] / 2 - Math.min(text.length, STRING_LIMIT) * 2 + hero.face.dx * 20 - 10, settings.size[1] / 2 - 30, { text, color: npcToTalk.textColor, speechSpeed: SPEECH_SPEED, talkTime: npcToTalk.talking, zOrder: 3, outline: npcToTalk.outline }]);
				}
			
				let shouldTalk = npcToTalk.talking && now - npcToTalk.talking < lastMessage.length * SPEECH_SPEED;
				if(npcToTalk.talking && !shouldTalk) {
//					sprites.push(['gun', settings.size[0] - 50, settings.size[1] - 40, { size: [20,20], zOrder: 3}]);
					if(!inFinal) {
						sprites.push(getMenu(now));
					} else if(finalChat !== FINALCHATS_NEXT && !inFinalFinal) {
						sprites.push(getFinalMenu(now));
					}
				}
				if(npcToTalk.husband && (memoryLanes() || whoAreYou())) {
					if(whoAreYou()) {
						if(!garyWhoAreYou) {
							garyWhoAreYou++;
							garyScared ++;
						}
					}
					if(memoryLanes()) {
						if(!garyMemory) {
							garyMemory++;
							garyScared ++;
						}
					}
				}
			}
		}
		/////////////////
		/////////////////
		if(!inHallway) {
			sprites.push(['tv-game-jam-'+tv, scroll.x + 434, scroll.y + 10, { animated: true, frameRate: 60}]);
			// sprites.push(['gun', scroll.x + 980, scroll.y + 20, {}]);
		}

		if (hero.gun && (!inFinal && !inHallway || finalChat == FINALCHATS.length)) {
			const LETTER_BOX_SIZE = Math.min(30, (now - hero.gun) / 8);
			if(finalEnding!=='SHOOT') {
				sprites.push(['rect',0, 0, { width: settings.size[0], height: LETTER_BOX_SIZE, zOrder: 2 }]);
				sprites.push(['rect',0, settings.size[1] - LETTER_BOX_SIZE, { width: settings.size[0], height: LETTER_BOX_SIZE, zOrder: 2 }]);
				sprites.push(['gun', settings.size[0] - 50, settings.size[1] - 30, { zOrder: 3}]);
//				if (ppCount === 0) {
					sprites.push(['text', 10, 18, { text: "ESC / P: PUT AWAY THE GUN", zOrder: 3, color: '#FFFFFF'}]);
//				}
				sprites.push(['text', 10, 30, { text: "SPACE: SHOOT", zOrder: 3, color: '#FFFFFF'}]);
			}
			if(!inFinal) {
//				sprites.push(['text', settings.size[0] - 30, 27, {text: npcCount, zOrder: 3, color: '#cc5555', fontSize: 16}])
				// sprites.push(['text', settings.size[0] - 60, 27, {text: parasiteCount, zOrder: 3, color: '#cccccc', fontSize: 16}])
				// if (ppCount) {
				// 	sprites.push(['text', settings.size[0] - 90, 27, {text: ppCount, zOrder: 3, color: '#29b8b8', fontSize: 16}])
				// }
				for(let i=0; i<heartCount; i++) {
					sprites.push(['heart', settings.size[0] - 20 * (i+ 1), 7, { zOrder: 3 }]);			
				}
			}
			if(shooting(now) && lastShot && lastShot.size > 0) {
				sprites.push(makeBullet(lastShot, scroll, lastShot.target));
			}
		}
		particles.forEach(particle => {
			sprites.push(['rect', scroll.x + particle[0], scroll.y + particle[1] - 16, { zOrder: 1, color: 'white', width: 2, height: 2 }]);
		});

		parasites.forEach(parasite => {
			if(now - parasite.born > 700) {
				if(parasite.shot) {
					sprites.push(['parasite-dead', scroll.x + parasite.x, scroll.y + parasite.y, {animated: true, animationStart: parasite.shot }]);
				} else {
					sprites.push(['parasite-run', scroll.x + parasite.x, scroll.y + parasite.y, {animated:  !lost }]);
				}
			}
		});

		if(finalEnding === 'SHOOT') {
			if(npcToTalk) {
				sprites.push(['gary-shot', scroll.x + npcToTalk.x - 47, scroll.y + npcToTalk.y - 63, {animated: true, animationStart: gameOver}]);
			}
			if(now - gameOver > 10000) {
				sprites.push(['the-end', 0, 0, {zOrder: 1}]);
			}			
		}

		if(finalEnding === 'LEAVE' && gameOver) {
			sprites.push(['text', 0, 1000-(now - gameOver - 9000) / 120, {text: 				
				'    This game was produced for\n\n'+
				'        TV Game Jam 2019\n'+
				'\n'+
				'\n'+
				'    based on the television show\n'+
				'\n'+
				'          RICK and MORTY\n'+
				'\n'+
				'        Season 2, Episode 4\n'+
				'\n'+
				'          Total Rickall\n'+
				'\n'+
				'\n'+
				'\n'+
				'   Programming and character art:\n'+
				'\n'+
				'            jacklehamster\n'+
				'\n'+
				'\n'+
				'             Decor art:\n'+
				'\n'+
				'          snowflakestudios\n'+
				'\n'+
				'\n'+
				'          Music and sounds:\n'+
				'\n'+
				'             cheesymoo\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'    We all thank you for playing\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'             You are still here! \n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'         Nice scenery isn\'t it?! \n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'       Why don\'t you go home? \n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				'\n'+
				" Trust me there's nothing left to read.\n"+
				""

				,
				zOrder: 3, color: '#ffffff', outline: '#000000', fontSize: 20}]);
		}

		if(lost) {
			sprites.push(
				['text', 30, 120, {text: "GAME OVER" ,color: "white", outline: 'black', fontSize: 40, zOrder: 3}],
			);
			if(now - lost > 3000 && Math.floor(now / 200) % 3 !== 0) {
				sprites.push(
					['text', 65, 160, {text: "ESC TO RESTART" ,color: "white", outline: 'black', fontSize: 20, zOrder: 3}],
				);				
			}
		}



		return sprites;
	}


	const FINALCHATS_NEXT = 3;

	//finalChat



	let FINALCHATS = [
		["I don't care what's happening out there. You and I, we're going to survive this."],
		["Wait, can you be so sure that I'm a parasite? After all we've been through together."],
		["Oh please don't kill me. You must have a bad memory of me hidden somewhere."],
		["No! Wait! There's this one time... you know?... Please try to remember..."],
		["--1-"],
		["I do remember now.", true],
		["I was supposed to leave for Europe but my flight got cancelled. So I came back home...", true],
		["...and found you in bed with my " + getRandom(OCCUPATIONS) + '.', true],
		["I was drunk that night! And lonely! I just made a stupid mistake and I regret."],
		["Well I guess, you're human after all, Slurpy Gary", true],
		["So very human....", true],
		["Yes, I am your real husband Slurpy Gary. Now can we stop this nonsense?"],
		["Please put away the gun and let's go home."],
	].map(([chat, heroTalk]) => [wrapText(chat), heroTalk]);

	function getSprites2(now) {
		sprites.length = 0;
		const heroSprite = shooting(now) ? 'gunshooting' : showGun() ? 'gun' : 'hero';
		const heroDx = hero.face.dx;
		const heroDy = hero.face.dy;
		if(!exitedTheBuilding) {
			sprites.push(getSprite(heroSprite, scroll.x + hero.x, scroll.y + hero.y, heroDx, heroDy, hero, now));
		}

		tiles.forEach(tile => {
			if (onScreen(tile)) {
				if(tile.door === 'opened') {
					if(canExit()) {
						sprites.push([tile.type, scroll.x + tile.x, scroll.y + tile.y, {animated: false, frame: tile.frame}]);
					}
				} else if(tile.door === 'closed') {
					if(!canExit()) {
						sprites.push([tile.type, scroll.x + tile.x, scroll.y + tile.y, {animated: false, frame: tile.frame}]);						
					}
				} else {
					sprites.push([tile.type, scroll.x + tile.x, scroll.y + tile.y, {animated: false, frame: tile.frame}]);
				}
			}
		});



		return sprites;
	}	

	const parasites = [
	];

	function showGun() {
		return hero.gun || (talking && chatIndex===3 && !inFinalFinal);
	}

	const particles = [
	];

	function makeBullet(lastShot, scroll, target) {
		const { dx, dy } = lastShot;
		let size = lastShot.size;
		// if(target) {
		// 	size = Math.min(Math.abs(lastShot.x - target.x), Math.abs(lastShot.y - target.y));
		// }
		if(dx && dy) {
			return ['line', scroll.x + lastShot.x, scroll.y + lastShot.y - 16, {
				zOrder: 1,
				xMove: size * dx, yMove: size * dy, color: 'white', lineWidth: 3,
			}];
		}
		return ['rect', scroll.x + lastShot.x  + (dx<0 ? -size : 0), scroll.y + lastShot.y -16 + (dy<0 ? -size:0), {
			zOrder: 1,
			width: dy == 0 ? size : 3,
			height: dx == 0 ? size : 3,
			color: 'white',
		}];
	}

	let chatIndex = 0;

	const FINALMENUS = [
		[
			['text', 20, -15, { text: "I know I'll survive this. Don't know about you.", speechSpeed: SPEECH_SPEED, color: 'white', outline: '#222222'}],
			['text', 20, 0, { text: "You're a parasite, Slurpy Gary.", speechSpeed: SPEECH_SPEED, color: 'white', outline: '#222222'}],
			['text', 20, 15, { text: "Slurpy Gary, you've been a bad, bad boy.", speechSpeed: SPEECH_SPEED, color: 'white', outline: '#222222'}],
			['text', 20, 30, { text: 'Goodbye Spleepy Gary. I will miss you.', speechSpeed: SPEECH_SPEED, color: 'white', outline: '#222222'}],
		],
		[
			['text', 20, -15, { text: "Parasites can't implant bad memories.", speechSpeed: SPEECH_SPEED, color: 'white', outline: '#222222'}],
			['text', 20, 0, { text: "I don't have a single bad memory of you.", speechSpeed: SPEECH_SPEED, color: 'white', outline: '#222222'}],
			['text', 20, 15, { text: "You are my best memories, Slurpy Gary.", speechSpeed: SPEECH_SPEED, color: 'white', outline: '#222222'}],
			['text', 20, 30, { text: "You're too good to be real, Slurpy Gary.", speechSpeed: SPEECH_SPEED, color: 'white', outline: '#222222'}],
		],
		[
			['text', 20, -15, { text: "That nice vacation on our yatch?", speechSpeed: SPEECH_SPEED, color: 'white', outline: '#222222'}],
			['text', 20, 0, { text: "That memorable wedding?", speechSpeed: SPEECH_SPEED, color: 'white', outline: '#222222'}],
			['text', 20, 15, { text: "Our first kiss?", speechSpeed: SPEECH_SPEED, color: 'white', outline: '#222222'}],
			['text', 20, 30, { text: 'Our ménage à trois with Jerry?', speechSpeed: SPEECH_SPEED, color: 'white', outline: '#222222'}],
		],
		[
			['text', 20, -15, { text: "1---", speechSpeed: SPEECH_SPEED, color: 'white', outline: '#222222'}],
			['text', 20, 0, { text: "---", speechSpeed: SPEECH_SPEED, color: 'white', outline: '#222222'}],
			['text', 20, 15, { text: "---", speechSpeed: SPEECH_SPEED, color: 'white', outline: '#222222'}],
			['text', 20, 30, { text: '---', speechSpeed: SPEECH_SPEED, color: 'white', outline: '#222222'}],
		],
		[
			['text', 20, -15, { text: "2---", speechSpeed: SPEECH_SPEED, color: 'white', outline: '#222222'}],
			['text', 20, 0, { text: "---", speechSpeed: SPEECH_SPEED, color: 'white', outline: '#222222'}],
			['text', 20, 15, { text: "---", speechSpeed: SPEECH_SPEED, color: 'white', outline: '#222222'}],
			['text', 20, 30, { text: '---', speechSpeed: SPEECH_SPEED, color: 'white', outline: '#222222'}],
		],
		[
			['text', 20, -15, { text: "3---", speechSpeed: SPEECH_SPEED, color: 'white', outline: '#222222'}],
			['text', 20, 0, { text: "---", speechSpeed: SPEECH_SPEED, color: 'white', outline: '#222222'}],
			['text', 20, 15, { text: "---", speechSpeed: SPEECH_SPEED, color: 'white', outline: '#222222'}],
			['text', 20, 30, { text: '---', speechSpeed: SPEECH_SPEED, color: 'white', outline: '#222222'}],
		],
	];


	function getFinalMenu(now) {
		return [
			'group', 20, settings.size[1] - 35, { zOrder: 3}, FINALMENUS[finalChat]
				.concat([['pointer', -16, 8 - chatIndex * 15, { animated: false, frame: 5 }]]),
		];
	}


	function getMenu(now) {
		return [
			'group', 20, settings.size[1] - 35, { zOrder: 3}, [
//				['gun',  20, -40, { size: [25, 25] }],
				['text', 20, -15, { text: 'I\'s time to take out the big gun.', speechSpeed: SPEECH_SPEED, color: '#EE5555', outline: '#222222'}],
				// ['text', 20, 0, { text: 'Will you take me back to memory lanes?', speechSpeed: SPEECH_SPEED, color: '#AAEEFF', outline: '#222222'}],
				['text', 20, 0, { text: 'Will you take me down memory lane?', speechSpeed: SPEECH_SPEED, color: memoryLanes() ? '#444444' : 'white', outline: '#222222'}],
				['text', 20, 15, { text: 'Who are you again?', speechSpeed: SPEECH_SPEED, color: whoAreYou() ? '#444444' : 'white', outline: '#222222'}],
				['text', 20, 30, { text: 'Goodbye', speechSpeed: SPEECH_SPEED, color: 'white', outline: '#222222'}],
				['pointer', -16, 8 - chatIndex * 15, { animated:  !lost }],
			],
		];
	}

	let lastMessage = "";

	function comboColors(faceColors, bodyColors) {
		const colors = [];
		faceColors.forEach(faceColor => {
			bodyColors.forEach(bodyColor => {
				const newColor = {};
				for (let p in faceColor) {
					if (p !== 'name') {
						newColor[p] = faceColor[p];
					}
				}
				for (let p in bodyColor) {
					if (p !== 'name') {
						if (bodyColor[p] === 'nude') {
							newColor[p] = faceColor[0xFFFFFF];
						} else {
							newColor[p] = bodyColor[p];
						}
					}
				}
				newColor.name = faceColor.name + '-' + bodyColor.name;
				colors.push(newColor);
			});
		});
		return colors;
	}

	const ABCD = " ABCDEFGHIJKLMNOPQRSTUVWXYZ";

	function getFinalSprites() {
		if(skipOnce) {
			skipOnce = false;
			return [];
		}
		return [
			['sex', 0, 50, {animated: true}],
			['sex-caught', 0, 50, {animated: true, after: 7000, animationStart: 7000}],
			['text', 200, 82, {text: playerName && playerName.length ? playerName + "!" : '', color : "#cccccc", speechSpeed: 100, talkTime: 8000, zOrder: 3, outline: "#222222"}],
			['text', 20, 42, { text: "Slurpy Gary! how could you?           \n\nAnd with...              YOU.", color: '#cccccc', speechSpeed: 100, talkTime: 11000, zOrder: 3, outline: '#222222' }],

		];

	}

	const WALK_ANIM_OFFSET = [
		[0, 0],
		[1, -1],
		[0, 0],
		[-1, -1],
	];


	let customMenu = 0;



	return {
		settings,
		assets: [
			['npc-body-left.png', 32, 32, {
				colors: comboColors(FACE_COLORS, BODY_COLORS),				
			}],
			['npc-body-up.png', 32, 32, {
				colors: comboColors(FACE_COLORS, BODY_COLORS),				
			}],
			['npc-body.png', 32, 32, {
				colors: comboColors(FACE_COLORS, BODY_COLORS),				
			}],
			['npc-body-left-gun.png', 32, 32, {
				colors: comboColors(FACE_COLORS, BODY_COLORS),				
			}],
			['npc-body-right-gun.png', 32, 32, {
				colors: comboColors(FACE_COLORS, BODY_COLORS),				
			}],
			['npc-body-up-gun.png', 32, 32, {
				colors: comboColors(FACE_COLORS, BODY_COLORS),				
			}],
			['npc-body-gun.png', 32, 32, {
				colors: comboColors(FACE_COLORS, BODY_COLORS),	
			}],
			['npc-body-left-gun-shoot.png', 32, 32, {
				colors: comboColors(FACE_COLORS, BODY_COLORS),				
				count: 3,			
				frameRate: 30,
				repeat: 1,
			}],
			['npc-body-right-gun-shoot.png', 32, 32, {
				colors: comboColors(FACE_COLORS, BODY_COLORS),				
				count: 3,			
				frameRate: 30,
				repeat: 1,
			}],
			['npc-body-up-gun-shoot.png', 32, 32, {
				colors: comboColors(FACE_COLORS, BODY_COLORS),				
				count: 3,			
				frameRate: 30,
				repeat: 1,
			}],
			['npc-body-gun-shoot.png', 32, 32, {
				colors: comboColors(FACE_COLORS, BODY_COLORS),				
				count: 3,			
				frameRate: 30,
				repeat: 1,
			}],
			['gun.png', 32, 32, {
			}],
			['bullet.png', 32, 32, {
			}],
			['npc-dead.png', 40, 32, {
				colors: comboColors(FACE_COLORS, BODY_COLORS),				
				frameRate: 5,
				repeat: 1,
			}],
			['parasite-exit.png', 32, 32, {
				colors: comboColors(FACE_COLORS, BODY_COLORS),				
				repeat: 1,
				count: 8,
			}],
			['parasite-run.png', 40, 40, {
				offset: {x:-20, y:-40}
			}],
			['pointer.png', 32, 32, {
				count: 11,
				frameRate: 60,
			}],

			['penis.png', 32, 32, {
			}],
			['vagina.png', 32, 32, {
			}],
			['bubble.png', 32, 32, {
			}],
			['npc-face.png', 32, 32, {
				animOffset: WALK_ANIM_OFFSET,
			}],
			['gary-face.png', 32, 32, {
				animOffset: WALK_ANIM_OFFSET,
			}],
			['mad-face.png', 32, 32, {
				count: 20,
				animOffset: WALK_ANIM_OFFSET,
			}],
			['smart-face.png', 32, 32, {
				count: 20,
				animOffset: WALK_ANIM_OFFSET,
			}],
			['pixie-face.png', 32, 32, {
				count: 20,
				animOffset: WALK_ANIM_OFFSET,
			}],
			['femme-face.png', 32, 32, {
				count: 20,
				animOffset: WALK_ANIM_OFFSET,
			}],
			['morty-face.png', 32, 32, {
				animOffset: WALK_ANIM_OFFSET,
			}],
			['npc-head.png', 32, 32, {
				animOffset: WALK_ANIM_OFFSET,
				colors: FACE_COLORS,
			}],
			['round-head.png', 32, 32, {
				animOffset: WALK_ANIM_OFFSET,
				colors: FACE_COLORS,
			}],
			['gary-head.png', 32, 32, {
				animOffset: WALK_ANIM_OFFSET,
				colors: FACE_COLORS,
			}],
			['v-head.png', 32, 32, {
				animOffset: WALK_ANIM_OFFSET,
				colors: FACE_COLORS,
			}],
			['cone-head.png', 32, 32, {
				animOffset: WALK_ANIM_OFFSET,
				colors: FACE_COLORS,
			}],
			['npc-mouth.png', 32, 32, {
				animOffset: WALK_ANIM_OFFSET,				
			}],
			['beard.png', 32, 32, {
				animOffset: WALK_ANIM_OFFSET,	
				colors: HAIR_COLORS,			
			}],
			['orange-hair.png', 32, 32, {
				animOffset: WALK_ANIM_OFFSET,
				colors: HAIR_COLORS,
			}],
			['pony-tail.png', 32, 32, {
				animOffset: WALK_ANIM_OFFSET,
				colors: HAIR_COLORS,
			}],
			['bowl-hair.png', 32, 32, {
				animOffset: WALK_ANIM_OFFSET,
				colors: HAIR_COLORS,
			}],
			['spike-hair.png', 32, 32, {
				animOffset: WALK_ANIM_OFFSET,
				colors: HAIR_COLORS,
			}],
			['rick-hair.png', 32, 32, {
				animOffset: WALK_ANIM_OFFSET,
				colors: HAIR_COLORS,
				offset: {x: 0, y:-10},
			}],
			['skin-head.png', 32, 32, {
				animOffset: WALK_ANIM_OFFSET,
				colors: HAIR_COLORS,
			}],
			['floor-tile.png', 32, 32, {
			}],
			['bricks.png', 32, 32, {
			}],
			['the-door.png', 32, 64, {
				offset: {x:0, y:-32},
			}],
			['sex.png', 320, 150, {
				count: 4,
				frameRate: 4,
			}],
			['sex-caught.png', 320, 150, {
				count: 8,
				frameRate: 8,
				repeat: 1,
			}],
			['moonlight.png'],
			['house-background.png'],
			['couch.png', 160, 64, {
				offset: {x: 0, y: -64},
			}],
			['gary-shot.png', 64, 64, {
				count: 5,
				repeat: 1,
			}],
			['the-end.png', 320, 256],
			['parasite-dead.png', 40, 40, {
				count: 6,
				repeat: 1,
				offset: {x:-20, y:-40},
			}],
			['heart.png', 32, 32],
			// ['tv-game-jam.png', 420, 333, {
			// 	static: .2,
			// 	count: 10,
			// }],
			['tv-game-jam-1.png', 60, 30, {
				static: .2,
				count: 10,
			}],
			['tv-game-jam-2.png', 60, 30, {
				static: .2,
				count: 10,
			}],
			['tv-game-jam-3.png', 60, 30, {
				static: .2,
				count: 10,
			}],
			['tv-game-jam-4.png', 60, 30, {
				static: .2,
				count: 10,
			}],
			['total-rickall-massacre.png'],


			["spring_sprinkle.mp3", 1, loop],
			["vick_n_vorty.mp3", 1, loop],
			["evil_vortman.mp3", 1, loop],
			["parasite_die.wav", 1],
			["laser.wav", 0.4],
			["ui_yes.wav", 1],
			["ui_no.wav", 1],
			["hit.wav", 0.4],
		],
		scenes: [
			{
				actions: [
					now => {
						if(Keyboard.action.down) {
							menuTime = now;
							if(menuType == 0) {
								if(customMenu===MENUS[menuType].length-1) {
									gameStarts(localStorage.getItem('nudity')==='allow' && NPC_COUNT === 69 && characters.hero.bodyColor==='nude');
									Engine.nextScene(now);
								} else if(customMenu === 1) {
									if(!waitUp) {
										randomi++;
										randomHero(randomi === 0 ? 0 : randomi === 1? initialHero : randomi ^ randomo);									
										waitUp = true;
									}
								} else if(customMenu===0) {
									if(!waitUp) {
										entryMode = !entryMode
										waitUp = true;
									}
								} else if(customMenu===2) {
									if(!waitUp) {
										menuType = 1;
										customMenu = 0;
										waitUp = true;
									}
								}
							} else if(menuType == 1) {
								if(customMenu==0) {
									if(!waitUp) {
										menuType = 0;
										customMenu = 0;
										waitUp = true;
									}									
								} else if(customMenu==1) {
									if(!waitUp) {
										menuType = 2;
										customMenu = localStorage.getItem('textSpeed')==='fast' ? 1 : 0;
										waitUp = true;
									}
								} else if(customMenu==2) {
									if(!waitUp) {
										menuType = 3;
										customMenu = localStorage.getItem('nudity')==='allow' ? 1 : 0;
										waitUp = true;
									}									
								} else if(customMenu==3) {
									if(!waitUp) {
										menuType = 6;
										customMenu = localStorage.getItem('difficulty')==='hard' ? 1 
											: !localStorage.getItem('difficulty') ? 0 : 2;
										waitUp = true;
									}									
								} else if(customMenu==4) {
									if(!waitUp) {
										menuType = 4;
										customMenu = 0;
										waitUp = true;
									}									
								}
							} else if(menuType == 2) {
								if(customMenu==0) {
									if(!waitUp) {
										menuType = 1;
										customMenu = 1;
										SPEECH_SPEED = DEFAULT_SPEECH_SPEED;
										localStorage.removeItem('textSpeed');
										waitUp = true;
									}									
								} else if(customMenu==1) {
									if(!waitUp) {
										menuType = 1;
										customMenu = 1;
										SPEECH_SPEED = DEFAULT_SPEECH_SPEED / 10;
										localStorage.setItem('textSpeed', 'fast');
										waitUp = true;
									}
								}								
							} else if(menuType == 3) {
								if(customMenu==0) {
									if(!waitUp) {
										menuType = 1;
										customMenu = 2;
										nudity = null;
										localStorage.removeItem('nudity');
										if(characters.hero.bodyColor==='nude') {
											changeHero('bodyColor', 0);
										}
										waitUp = true;
									}									
								} else if(customMenu==1) {
									if(!waitUp) {
										menuType = 1;
										customMenu = 2;
										nudity = "allow";
										localStorage.setItem('nudity', 'allow');
										waitUp = true;
									}
								}								
							} else if(menuType == 4) {
								if(customMenu==0) {
									if(!waitUp) {
										menuType = 5;
										customMenu = 0;
										waitUp = true;
									}
								}
							} else if(menuType == 5) {
								if(customMenu==0) {
									if(!waitUp) {
										menuType = 1;
										customMenu = 4;
										waitUp = true;
									}
								}
							} else if(menuType == 6) {
								if(customMenu==0) {
									if(!waitUp) {
										menuType = 1;
										customMenu = 3;
										// if(NPC_COUNT!==12) {
											// NPC_COUNT = 12;
											localStorage.removeItem('difficulty');
											updateNpcCount();
//											location.reload();
										// }
										waitUp = true;
									}									
								} else if(customMenu==1) {
									if(!waitUp) {
										menuType = 1;
										customMenu = 3;
										// if(NPC_COUNT!==16) {
											// NPC_COUNT = 16;
											localStorage.setItem('difficulty', 'hard');
											updateNpcCount();
//											location.reload();
										// }
										waitUp = true;
									}
								} else if(customMenu===2) {
									if(!waitUp) {
										menuType = 1;
										customMenu = 3;
										const count = !localStorage.getItem('difficulty') ? 12 : localStorage.getItem('difficulty')==='hard' ? 16 
											: parseInt(localStorage.getItem('difficulty'));
										localStorage.setItem('difficulty', count);
										// if(NPC_COUNT !== count) {											
											// location.reload();
											updateNpcCount();
										// }
										waitUp = true;
									}
								}
							}

						} else if(Keyboard.move.dx < 0) {
							if(!waitUp) {
//								changeHero(switchers[customMenu], -1);
								if(entryMode) {
									waitUp = true;
									cursor = Math.max(0, cursor - 1);
//									console.log(playerName);
								} else if(menuType===0 && customMenu===1) {
									randomi--;
										randomHero(randomi === 0 ? 0 : randomi === 1? initialHero : randomi ^ randomo);									
									waitUp = true;
								} else if(menuType===6 && customMenu===2) {
									const count = !localStorage.getItem('difficulty') ? 12 : localStorage.getItem('difficulty')==='hard' ? 16 
										: parseInt(localStorage.getItem('difficulty'));
									localStorage.setItem('difficulty', Math.max(0, count-1));
									waitUp = true;
								}
							}
						} else if(Keyboard.move.dx > 0) {
							if(!waitUp) {
//								changeHero(switchers[customMenu], 1);							
								if(entryMode) {
									waitUp = true;
									cursor = Math.min(cursor + 1, playerName.length, 12);
								} else if(menuType===0 && customMenu===1) {
									randomi++;
									randomHero(randomi === 0 ? 0 : randomi === 1? initialHero : randomi ^ randomo);									
									waitUp = true;
								} else if(menuType===6 && customMenu===2) {
									const count = !localStorage.getItem('difficulty') ? 12 : localStorage.getItem('difficulty')==='hard' ? 16 
										: parseInt(localStorage.getItem('difficulty'));
									localStorage.setItem('difficulty', Math.max(0, count+1));
									waitUp = true;
								}
							}
						} else if(Keyboard.move.dy < 0) {
							if(!waitUp) {
								if(entryMode) {
									let p = playerName;
									p += ' ';
									let letter = playerName.charAt(cursor);
									let index = ABCD.indexOf(letter);
									index = (index + 1 + ABCD.length) % ABCD.length;
									letter = ABCD[index];
									p = p.split("");
									p.splice(cursor, 1, letter);
									p = p.join("");
									playerName = p.trim();
									localStorage.setItem('playerName', playerName);
								} else {
									customMenu = Math.max(0, customMenu-1);
								}
								waitUp = true;
							}
						} else if(Keyboard.move.dy > 0) {
							if(!waitUp) {
								if(entryMode) {
									let p = playerName;
									p += ' ';
									let letter = playerName.charAt(cursor);
									let index = ABCD.indexOf(letter);
									index = (index - 1 + ABCD.length) % ABCD.length;
									letter = ABCD[index];
									p = p.split("");
									p.splice(cursor, 1, letter);
									p = p.join("");
									playerName = p.trim();
									localStorage.setItem('playerName', playerName);
								} else {
									customMenu = Math.min(MENUS[menuType].length-1, customMenu+1);
								}
								waitUp = true;
							}
						} else {
							waitUp = false;
						}
					},
					['setMusic', ['music']],
				],
				init: [
					[ '=>', 'music', 'vick_n_vorty' ],
				],
				sprites: getIntroSprites,
			},
			{
				fadeStart: ['exitTime'],
				objects: {

				},
				init: [
					initScene,
					[ '=>', 'back.x', -64],
					[ '=>', 'back.y', -112],
					[ '=>', 'couch.x', -64 + 32*15],
					[ '=>', 'couch.y', -112 + 32*10],
					[ '=>', 'music', 'spring_sprinkle' ],
				],
				actions: [
					['setMusic', ['music']],
					performActions,
				],
				sprites: getSprites,
			},
			{
				fadeStart: ['exitTime'],
				objects: {
				},
				init: [
					[ '=>', 'music', 'evil_vortman' ],
				],
				actions: [
					['setMusic', ['music']],
					performActions2,
				],
				sprites: getSprites,
			},
			{
				fadeStart: ['exitTime'],
				objects: {
				},
				init: [
					[ '=>', 'music', 'evil_vortman' ],
				],
				actions: [
					['setMusic', ['music']],
					performActions3,
				],
				sprites: getSprites,
			},
			{
				fadeStart: ['exitTime'],
				backgroundColor: 'black',
				init: [
					[ '=>', 'music', 'evil_vortman' ],
				],
				actions: [
					['setMusic', ['music']],
					performActions4,
				],
				sprites: getFinalSprites,
			},
			{
				fadeStart: ['exitTime'],
				objects: {
				},
				init: [
					[ '=>', 'music', 'evil_vortman' ],
				],
				actions: [
					['setMusic', ['music']],
					performActions5,
				],
				sprites: getSprites,
			},
			{
				fadeStart: ['exitTime'],
				objects: {

				},
				init: [
					initScene,
					[ '=>', 'back.x', -64],
					[ '=>', 'back.y', -112],
					[ '=>', 'couch.x', -64 + 32*15],
					[ '=>', 'couch.y', -112 + 32*10],
					[ '=>', 'music', 'spring_sprinkle' ],
				],
				actions: [
					performActions,
				],
				sprites: getSprites,
			},
		],
	};
}();
