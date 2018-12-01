const Game = (function() {

	const HEROES = [
		{
			id: "father",
			name: "Maximus",
			life: 200,
			sacrifice: {
				mother: {
					damage: .8,
				},
				boy: {
					damage: 1.4,
				},
			}
		},
		{
			id: "mother",
			name: "Camilla",
			life: 100,
			damage: 2,
			sacrifice: {
				father: {
					damage: .8,
				},
				girl: {
					damage: .8,
				},
			},
		},
		{
			id: "villain",
			name: "Drake",
			life: 100,
			counter: {
				bandit: 2,
			},
			resist: {
				bandit: 2,
			},
			sacrifice: {
				all: {
					damage: 1.2,
				},
				healer: {
					heal: 1.2,
				},
			},
		},
		{
			id: "boy",
			name: "Tristan",
			life: 100,
			grow: 1.2,
			factor: .5,
			sacrifice: {
				tiger: { damage: .8 },
				mother: { damage: .8 },
				father: { damage: .8 },
			},
		},
		{
			id: "girl",
			name: "Zoe",
			life: 100,
			grow: 1.1,
			factor: .7,
			counter: {
				robot: 2,
			},
			sacrifice: {
				mother: { damage: .8 },
				father: { damage: .8 },
			},
		},
		{
			id: "healer",
			name: "Amethyst",
			life: 100,
			heal: 10,
			counter: {
				undead: 2,
			},
		},
		{
			id: "tiger",
			name: "Felix",
			life: 75,
			carry: 1,
			counter: {
				all: 1.5,
			},
		},
	];

	function step() {
		//	damage
		heroes[0].life -= 10;

		// heal
		const needHeal = heroes.slice(1).filter(hero => hero.life < hero.maxLife);

		if(needHeal.length) {
			heroes.forEach((hero, index) => {
				if(hero.id=='healer' && index !==0) {
					const { heal } = hero;
					heroes.forEach((target, index2) => {
						if(index2 !== 0 && index2 !== index) {
							heroes[index2].life = Math.min(target.life + (hero.heal / needHeal.length), target.maxLife);
						}
					});
				}
			});
		}
		refresh();
	}	

	function refresh() {
		const stats = heroes.map(hero => {
			const { name, life } = hero;
			return {
				name,
				life,
			};
		});

		heroes = heroes.filter(hero => {
			return hero.life > 0;
		});
		
		const div = document.getElementById('stats');
		div.innerHTML = "";
		heroes.forEach((hero, index) => {
			const bar = div.appendChild(document.createElement('div'));
			bar.style.height = "16px";
			bar.style.width = hero.life + "px"
			bar.style.backgroundColor = "#" + parseInt(parseInt("0xFFFFFF", 16) / (index+2)).toString(16);
			bar.innerText = hero.id;
		});
	}

	function stopGame() {
		clearInterval(interval);
	}

	let interval;
	let heroes;
	function start() {
		heroes = HEROES.map(HERO => {
			const hero = JSON.parse(JSON.stringify(HERO));
			hero.maxLife = HERO.life;
			return hero;
		});
		interval = setInterval(step, 1000, heroes);
		document.addEventListener("keydown", onKey);
		refresh();
	}

	function onKey(e) {
		console.log(e);
		switch(e.keyCode) {
			case 32://space
				step();
				break;
			default:
				for(var i=0; i<heroes.length; i++) {
					if(String.fromCharCode(e.keyCode).toLowerCase() == heroes[i].id.charAt(0)) {
						const elem = heroes[i];
						heroes.splice(i, 1);
						heroes.unshift(elem);
						refresh();
						break;
					}
				}
		}
	}



	return {
		start,
	};
})(document);