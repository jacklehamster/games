const Game = (function() {

	const leftShift = 50;

	const HEROES = {
		father: {
			name: "Maximus",
			sprite: "assets/father.gif",
			note: "Cannot defeat if Camilla perished. Can survive one combat if healer alive",
			attackResult: (hero, foe, heroes, round) => {
				if(heroes.mother.ko) {
					return [ false, true, hero.name + " fought bravely, but " +
						"it was all in vain. Somehow, the thought of losing " + heroes.mother.name +
						" must have affected him deeply.",
						[
							"Oh " + heroes.mother.name + ", I can't go on without you",
							"I have no reason to live",
							"Why did you have to die, my dear " + heroes.mother.name,	
						],
					 ];	// hero defeat, foe survive
				}
				
				const foeSurvive = foe.dragon && !foe.combats;
				if(!heroes.healer.ko && !hero.combats) {
					if (foeSurvive) {
						return [ true, true, hero.name + " fought with all his strength. "
							+ "In this magnificent fight, he showed himself as a true warrior.",
							[
								"I am confident, this is going to be a hell of a fight.",
								"I am up for the challenge.",
							],
						];
					} else {
						return [ true, false, hero.name + " fought with all his strength, to "
						+ "obliterate his opponent",
							[
								"You will be crushed, I can guarantee.",
								"Noone dares to fight me.",
								"I am unbeatable.",
							]
						];
					}
				}
				if(foeSurvive) {
					return [ false, true, hero.name + " fought with all his strength, but "
					 + "only managed to injure his opponent. His sacrifice will be remembered.",
						[
							"I'm not sure I can defeat this beast, but it's worth trying.",
							"Perhaps I can weaken the " + foe.id + ", at least.",
						]
					];
				} else {
					return [ false, false, hero.name + " fought like a brave warrior. "
				+ "Despite his injury, he was able to crush his opponent.",
						[
							"I might not survive, but I must do what's necessary.",
							"I will protect others, with my life if that's what it takes.",
						]
					 ];
				}
			},
		},
		mother: {
			name: "Camilla",
			sprite: "assets/mother.gif",
			gender: "she",
			note: "Will always defeat in one round",
			attackResult: (hero, foe, heroes, round) => {
				return [ false, false, hero.name + " used up all her energy to cast a spell, sending her opponent into the underworld.",
					[
						"I can only guarantee one thing. You will be defeated.",
						"Noone can survive my power, not even me.",
						"Mutual destruction is inevitable.",
					]
			 ];	// will always defeat. Will always perish
			},
		},
		villain: {
			name: "Drake",
			sprite: "assets/villain.gif",
			gender: "he",
			note: "Can survive one combat vs villain",
			attackResult: (hero, foe, heroes, round) => {
				if(foe.bandit && !hero.combats) {
					return [ true, false, "The " + foe.id + " was fierce, but no one is " +
					 "a greater scoundrel than " + hero.name + ".",
					[
						"It takes a bandit to know another bandit.",
						"You call yourself a bandit?",
					],
				 ];
				}
				const foeSurvive = foe.dragon && !foe.combats;
				
				if(foeSurvive) {
					return [ false, true, hero.name + " fought bravely, but was only " +
					 "able to injure the " + foe.id + ". Even as a scoundrel, he will be remembered.",
						[
							"I might not be able to kill the beast, but I won't let go that easily.",
							"I should be able to injure the beast.",
						],
				];					
				} else {
					return [ false, false, hero.name + " sacrificed himself to fight the " + foe.id +". "+
					 "Even as a scoundrel, he will be remembered.",
						[
							"Perhaps I deserve to die, but I won't go down alone!",
							"I will take you with me to hell!",
						]
					];					
				}
			},
		},
		boy: {
			name: "Tristan",
			sprite: "assets/boy.gif",
			scale: .7,
			gender: "he",
			note: "Cannot defeat until round 4. Can survive once starting round 6 if healer alive. Can defeat any foe and survive the round after father died",
			attackResult: (hero, foe, heroes, round) => {
				if (round < 4) {
					return [ false, true, hero.name + " fought bravely, but was no match for the " + foe.id,
						[
							"I'm scared.",
							"How do you hold this sword?",
							"Perhaps I'm not quite ready yet",
						]
					 ];
				}
				if (heroes.father.ko === round - 1) {
					return [ true, false, "Filled with rage after witnessing the defeat of "
					 + "his father " + heroes.father.name + ", " + hero.name + " fought with all his strength.",
						[
							"You will pay for what you did to my father!",
							"I will revenge you father.",
							"Know that I am the son of " + heroes.father.name + " the greatest warrior that ever lived.",
						]
					 ];
				}
				const foeSurvive = foe.dragon && !foe.combats;
				if (round >= 6 && !heroes.healer.ko && !hero.combats) {
					if(foeSurvive) {
						return [ true, true, hero.name + " injured the enemy, and lived to fight another day.",
							[
								"I feel strong. I can survive this fight.",
								"This won't be easy, but I'm confident I can handle.",
							],
						 ];
					} else {
						return [ true, false, hero.name + " fought the enemy, and lived to fight another day.",
							[
								"I will crush this " + foe.id,
								"This " + foe.id + " is no match for me.",
								"I've learned to fight. Now I'm ready.",
							],
						 ];
					}
				}
				
				if (foeSurvive) {
					return [ false, true, hero.name + " did all he could. But was only able to cause an injury.",
						[
							"Perhaps I can harm the beast, but will I survive this fight?",
							"If only I was stronger.",
							"This won't be a walk in the park.",
						]
					 ];					
				} else {
					return [ false, false, hero.name + " did the ultimate sacrifice to defeat the " + foe.id,
						[
							"This " + foe.id + " will fall, but so will I.",
							"I cannot promise I'll live, but I'll do what it takes to defeat this " + foe.id,
						]
					 ];					
				}
			},
		},
		girl: {
			name: "Zoe",
			sprite: "assets/girl.gif",
			scale: .6,
			gender: "she",
			note: "Cannot defeat until round 6 except robots. Can survive vs robots if healer alive",
			attackResult: (hero, foe, heroes, round) => {
				if (foe.robot) {
					if (!heroes.healer.ko) {
						return [ true, false, hero.name +  " hacked the " + foe.id + ".",
							[
								"Robots are my specialty",
								"I can hack this system easily, it will be a piece of cake.",
							],
						 ];
					} else {
						return [ false, false, hero.name + " hacked the " + foe.id + ". Unfortunately, she could not sustain her injury.",
							[
								"I can defeat this robot. But I'm not sure about the aftermath.",
								"I will need to get close to hack this robot. I might get hurt.",
							],
						 ];						
					}
				}
				if (round < 6) {
					return [ false, true, hero.name + " is still too inexperience to fight the " + foe.id + ". She will be remembered.",
						[
							"I have never fought a " + foe.id + " before. Not sure if I'll do well.",
							"Someone teach me how to handle a sword first?",
							"I'm good with computers, not weapons.",
						],
					 ];
				}
				const foeSurvive = foe.dragon && !foe.combats;
				if (foeSurvive) {
					return [ false, true, hero.name + " did not make it. But she fought bravely to injure the " + foe.id,
						[
							"I might not do much, but I will do my best.",
							"I should be able to injure this beast. I'll use all that I've learned.",
						],
					 ];					
				} else {
					return [ false, false, hero.name + " fought with all her might, and sacrificed herself to fight the " + foe.id,
						[
							"Yes I can fight, but at what cost?",
							"I will do what it takes to protect others.",
							"Is this the end for me? I don't know but it will be the end for you!",
						],
					 ];					
				}
			},
		},
		healer: {
			name: "Amethyst",
			sprite: "assets/healer.gif",
			gender: "she",
			scale: .7,
			note: "Can survive once vs undead. Cannot defeat anyone else. ",
			attackResult: (hero, foe, heroes, round) => {
				if (foe.undead) {
					if (hero.combats) {
						return [ false, false, hero.name + " could not sustain her previous injury. She sacrificed herself to banish the " + foe.id,
							[
								"I will leave my life in this fight, but so will you.",
								"I will send you back into the underworld, then join the lord.",
							]
						 ];
					} else {
						return [ true, false, hero.name + " used her holy power to send back the " + foe.id + " into the realm of the dead.",
							[
								"The light will shine upon your wicked soul",
								"With the power of the lord, you will be destroyed",
								"The power of the lord flows into my veins.",
							]
						 ];
					}
				}
				return [ false, true, hero.name + " fought bravely, but was no match for the " + foe.id,
					[
						"I am not experienced in fighting " + foe.id + "s.",
						"I am a lover, not a fighter.",
						"If this is what it takes, I try my best.",
					],
				];
			},
		},
		tiger: {
			name: "Felix",
			sprite: "assets/tiger.gif",
			gender: "he",
			note: "Cannot defeat once boy is dead. Cannot defeat dragon",
			attackResult: (hero, foe, heroes, round) => {
				if (heroes.boy.ko) {
					return [ false, true, "Without his companion "+heroes.boy.name+", " + hero.name + " could not fight with his full potential.",
						["Meww...."],
					 ];
				}
				if (foe.dragon) {
					return [ false, true, "Unfortunately, " + hero.name + " is no match for the " + foe.id ,
						["..."],
					];					
				}
				return [ false, false, hero.name + " fought savagely against the " + foe.id,
					["Grrr....."],
				 ];
			},
		},
	};
	
	const FOES = [
		{
			id: "undead",
			undead: true,
			sprite: "assets/undead.gif",
		},
		{
			id: "goblin",
			goblin: true,
			sprite: "assets/goblin.gif",
		},
		{
			id: "robot",
			robot: true,
			sprite: "assets/robot.gif",
		},
		{
			id: "bandit",
			bandit: true,
			sprite: "assets/bandit.gif",
		},
		{
			id: "fountain",
			sprite: "assets/fountain.gif",
			fountain: true,
		},
		{
			id: "dragon",
			dragon: true,
			sprite: "assets/dragon.gif",
			note: "survive at least 1 turn, except vs Camilla",
		},
	];

	function step(round) {
		const hero = heroes[frontHero];
		const foe = foes[0];
		let msgs = [];
		
		if (foe.fountain) {
			delete hero.combats;
			foes.shift();
			msgs.push(
				"The " + foe.id + " replenished " + hero.name + "'s health."
			);
		} else {
			const [ heroSurvive, foeSurvive, m ] = hero.attackResult(hero, foe, heroes, round);
			if(m) msgs.push(m);
			if (!heroSurvive) {
				hero.ko = round;
			} else {
				hero.combats = (hero.combats || 0) + 1;			
			}
			if (!foeSurvive) {
				foes.shift();
				if(foes.filter(f => f.id === foe.id).length === 0) {
					msgs.push("The last " + foe.id + " was defeated.");
				} else {
					msgs.push("The " + foe.id + " was defeated.");
				}
			} else {
				foe.combats = (foe.combats || 0) + 1;
				msgs.push("The " + foe.id + " was not defeated.");
			}
			
			if (heroSurvive) {
				msgs.push(hero.name + " survived.");
			} else {
				msgs.push(hero.name + " did not survive.");		
			}
		}
				
		if(hero.ko) {
			frontHero = null;
		}
		refresh(msgs.map(m => m.split("").pop()==='.'?m:m+"." ));
	}
	
	function vanish(callback) {
		const div = document.getElementById('hero');
		if(!div) {
			callback();
			return;
		}
		const vals = [0];
		let val = 0; dx = 5;
		for(let i=0; i<50; i++) {
			val += dx;
			dx-=3;
			vals.push(val);
		}
		vals.reverse();
		
		const fightArea = document.getElementById("fightArea");
		const dest = fightArea.offsetLeft + leftShift + 50;
		div.style.left = (dest + vals.pop()) + "px";
		const interval = setInterval(() => {
			if(vals.length===0) {
				clearInterval(interval);
				callback();
				return;
			}
			div.style.left = (dest + vals.pop()) + "px";
			val ++;
		},10);
		
	}
	
	function refresh(msgs, theEnd) {
		const stats = document.getElementById('stats');
		
		{
			stats.innerHTML = "";
			stats.style.display = "flex";
			stats.style.display = "none";
			stats.style.flexDirection = "row";
			const div = stats.appendChild(document.createElement('div'));
			const rnd = div.appendChild(document.createElement('div'));
			rnd.innerText = "Round " + round;
			let index = 0;
			for(let h in heroes) {
				const hero = heroes[h];
				if(hero.ko) {
					continue;
				}
				const note = isGameWon() ? " - " + HEROES[h].note : "";
				const bar = div.appendChild(document.createElement('div'));
				bar.style.width = "100px"
				bar.style.backgroundColor = "#" + parseInt(0x00FF | (parseInt("0xFF0000", 16) / (index+2))).toString(16);
				bar.style.border = hero.combats && frontHero === h ? "2px solid red" : frontHero === h ? "2px solid black" : "2px solid " + bar.style.backgroundColor;
				bar.style.color = isGameWon() ? "yellow" : hero.combats ? "red" : frontHero === h ? 'white':'black';
				bar.innerText = h + note;
				index++;
			}			
		}
		
		{
			const div = stats.appendChild(document.createElement('div'));
			div.appendChild(document.createElement("br"));
			foes.forEach((foe, index) => {
				const bar = div.appendChild(document.createElement('div'));
				bar.style.width = "100px"
				bar.style.backgroundColor = "#" + parseInt(0xFF0000 | (parseInt("0xFF0000", 16) / (foes.length - index+2))).toString(16);
				bar.style.border = index === 0 ? "2px solid black" : "2px solid " + bar.style.backgroundColor;
				bar.style.color = foe.combats ? "red" : index === 0 ? 'white':'black';
				bar.style.margin = "1px";
				bar.innerText = index < 2 ? foe.id : '???';
			});			
			if(msgs && msgs.length) {
				const message = document.getElementById('msg');
				message.style.display = "none";
				message.innerText = msgs.join("\n");
			}	
		}
		
		vanish(() => {
			{
				const fightArea = document.getElementById("fightArea");
				fightArea.innerHTML = "";
				fightArea.style.flex = "1";
				fightArea.flexDirection = "row";
				if(frontHero) {
					const hero = heroes[frontHero]				
					const heroImg = document.createElement('img');
					heroImg.addEventListener('load', e => {
						const img = e.currentTarget;
						const div = fightArea.appendChild(document.createElement('div'));
						div.id = "hero";
						div.style.position = "absolute";
						div.style.left = (200-200*hero.scale + fightArea.offsetLeft + leftShift + 50) + "px";
						div.style.top = (300-300*hero.scale + fightArea.offsetTop + 100) + "px";
						div.style.backgroundImage = "url(" + img.src + ")";
						div.style.width = (200*hero.scale)+"px";
						div.style.height = (300*hero.scale)+"px";
						div.style.backgroundSize = "contain";
						div.style.backgroundRepeat = "no-repeat";
						div.style.backgroundPosition = "center bottom";
					
						const vals = [0];
						let val = 0; dx = 5;
						for(let i=0; i<50; i++) {
							val += dx;
							dx--;
							vals.push(val);
						}
					
						const dest = fightArea.offsetLeft + leftShift + 50;
						div.style.left = (dest + vals.pop()) + "px";
						const interval = setInterval(() => {
							if(vals.length===0) {
								clearInterval(interval);
								return;
							}
							div.style.left = (dest + vals.pop()) + "px";
							val ++;
						},10);
					});
					heroImg.src = hero.sprite;
				}
				const foe = foes[0];
				if(foe) {
					const foeImg = document.createElement('img');
					foeImg.addEventListener('load', e => {
						const img = e.currentTarget;
						const div = fightArea.appendChild(document.createElement('div'));
						div.style.position = "absolute";
						div.style.left = (fightArea.offsetLeft + leftShift + 350) + "px";
						div.style.top = (fightArea.offsetTop + 100) + "px";
						div.style.backgroundImage = "url(" + img.src + ")";
						div.style.width = "200px";
						div.style.height = "300px";
						div.style.backgroundSize = "contain";
						div.style.backgroundRepeat = "no-repeat";
						div.style.backgroundPosition = "center bottom";
					});
					foeImg.src = foe.sprite;
					
					let count = 0;
					for(let h in heroes) {
						if(heroes[h].ko) {
							count++;
						}
					}
					
					let index = 0;
					for(let h in heroes) {
						if(heroes[h].ko) {
							continue;
						}
						const ii = index + count/2;
						const thumbSize = 60;
						getImg(heroes[h].sprite, img => {
							const div = fightArea.appendChild(document.createElement('div'));
							div.classList.add("thumb");
							div.style.position = "absolute";
							div.style.left = (fightArea.offsetLeft + leftShift + 50 + ii*(thumbSize+10)) + "px";
							div.style.top = (fightArea.offsetTop + 450) + "px";
							div.style.backgroundImage = "url(" + img.src + ")";
							div.style.width = thumbSize + "px";
							div.style.height = thumbSize + "px";
							div.style.backgroundSize = "cover";
							div.style.backgroundRepeat = "no-repeat";
							div.style.backgroundPosition = "center top";
							div.style.borderRadius = "5px";
							if (h===frontHero) {
								div.style.border = "2px solid white";							
							}
							if (heroes[h].combats && h!='girl') {
								const red = div.appendChild(document.createElement('img'));
								red.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAYAAAA6/NlyAAAAVUlEQVR42u3PgQAAAAgDsOeXv04ZJNBmsJqk80gJCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLXxZxJk3RjvogtwAAAABJRU5ErkJggg==";
							}
							div.setAttribute("hero", h);
							div.addEventListener("click", e => {
								const div = e.currentTarget;
								div.style.border = "2px solid white";							
								const heroType = div.getAttribute("hero");
								if(frontHero !== heroType) {
									frontHero = heroType;
									refresh();								
								}
							});
							div.addEventListener("mouseover", e => {
								const div = e.currentTarget;
								const hero = heroes[div.getAttribute("hero")];
								if (foe.fountain) {
									const msg = div.getAttribute('hero')==='tiger' ? "..." : hero.combats && div.getAttribute("hero")!=='girl' ? "This fountain could replenish my health!" : "I'm not thirsty.";
									document.getElementById('desc').innerText = hero.name + ": \""+  msg + "\"";									
								} else {
									const [ heroSurvive, foeSurvive, m, msgs ] = hero.attackResult(hero, foe, heroes, round + 1);
									const msg = msgs[Math.floor(msgs.length * Math.random())];
									document.getElementById('desc').innerText = hero.name + ": \""+  msg + "\"";									
								}
							});
							div.addEventListener("mouseout", e => {
								const div = e.currentTarget;
								document.getElementById('desc').innerText = '';
							});
					    });
					    index++;
				    }
						//  <div class="msg" style="font-size: 16pt" id="desc"></div>
					const msgDiv = fightArea.appendChild(document.createElement('div'));
					msgDiv.classList.add("msg");
					msgDiv.style.position = "absolute";
					msgDiv.id = "desc";
					msgDiv.style.left = (fightArea.offsetLeft + leftShift + 50) + "px";
					msgDiv.style.top = (fightArea.offsetTop + 520) + "px";
					msgDiv.style.fontSize = "12pt";
					msgDiv.style.color = "#888888";
					
				
					const fightButton = fightArea.appendChild(document.createElement('button'));
					fightButton.id = "fight-button";
					fightButton.classList.add("msg");
					fightButton.classList.add("fightbutton");
					fightButton.style.position = "absolute";
					fightButton.style.left = (fightArea.offsetLeft + leftShift + 250) + "px";
					fightButton.style.top = (fightArea.offsetTop + 400) + "px";
					fightButton.style.width = "100px";
					
					fightButton.innerText = foe.fountain ? "HEAL" : "FIGHT";
					fightButton.addEventListener("click", e => {
						if(!isGameOver() && !isGameWon() && frontHero) {
							fightButton.disabled = true;
							next();
						}						
					});
				}
				{
					const div = fightArea.appendChild(document.createElement('div'));
					div.classList.add("msg");
					div.style.position = "absolute";
					div.style.left = (fightArea.offsetLeft + leftShift + 230) + "px";
					div.style.top = (fightArea.offsetTop + 50) + "px";
					div.style.color = "#cccccc";
					div.style.fontSize = "24pt";
					div.innerText = "Round " + round;
				}
				
				if(foes.length > 1) {
					const div = fightArea.appendChild(document.createElement('div'));
					div.classList.add("msg");
					div.style.position = "absolute";
					div.style.left = (fightArea.offsetLeft + leftShift + 430) + "px";
					div.style.top = (fightArea.offsetTop + 410) + "px";
					div.style.color = "#AAAAAA";
					div.style.fontSize = "12pt";
					div.innerText = (foes.length-1) + " left.";
					if(foes.length>2) {
						div.innerText += "\nNext: " + foes[1].id;
					}
				}
			}			
		});
		
		if(msgs && msgs.length) {
			const overlay = document.getElementById('overlay');
			overlay.innerHTML = "";
			const msgDiv = overlay.appendChild(document.createElement("div"));
			msgDiv.style.color = "silver";
			msgDiv.style.textAlign = "center";
			msgDiv.style.padding = "50px";
			const fullMsg = msgs.join("\n      \n").split("").map(a => a==='\n'?'<br>':a);
			setTimeout(() => {
				let n = 0;
				let revealInterval = setInterval(() => {
					msgDiv.innerHTML = fullMsg.slice(0,n).join("")
					+ "<font color='#111111'>" + fullMsg.slice(n).join("") + "</font>";
					if(n>=fullMsg.length) {
						clearInterval(revealInterval);
						if(theEnd) {
							return;
						}
						setTimeout(() => {
							if (isGameOver() && isGameWon()) {
								refresh([
									"All heroes sacrificed their life.",
									"But they defeated the dragon.",
									"Their sacrifice will be remembered.",
									"",
									"[ESC to restart]",
								], true);								
							} else if(isGameOver()) {
								refresh([
									"All heroes sacrificed their life.",
									"It was all in vain.",
									"",
									"[ESC to restart]",
								], true);
							} else if(isGameWon()) {
								const names = survivors();
								refresh([
									"You have defeated the dragon.",
									names.join("") + (names.length>1 ? " have": " has") + " survived.",
									"",
									"[ESC to restart]",
								], true);
							} else {
								fade("in");								
							}
						}, 1500);
					}
					n++;
				}, 70);				
			}, 1500);
		}
	}
	
	function survivors() {
		const names = [];
		for(let h in heroes) {
			if (!heroes[h].ko) {
				names.push(heroes[h].name);				
			}
		}
		const names2 = [];
		for(let i=0; i<names.length; i++) {
			names2[i*2] = names[i];
			names2[i*2 + 1] = ", ";
		}
		names2.pop();
		if(names2.length > 2) {
			names2[names2.length-2] = ' and ';
		}
		return names2;
	}
	
	function isGameOver() {
		for(let h in heroes) {
			if(!heroes[h].ko) {
				return false;
			}
		}
		return true;
	}
	
	function isGameWon() {
		return foes.length===0;
	}

	let round;
	let frontHero;
	let heroes;
	let foes;
	let lastDefeat;
	function start() {
		heroes = {};
		for(let h in HEROES) {
			heroes[h] = {
				name: HEROES[h].name,
				sprite: HEROES[h].sprite,
				scale: HEROES[h].scale||1,
				note: HEROES[h].note||"",
				attackResult: HEROES[h].attackResult,
			};
		}
		frontHero = "father";
		lastDefeat = null;
		foes = JSON.parse(JSON.stringify(FOES));
		for(let l = 0; l < 7; l++) {
			foes.unshift(FOES[Math.floor(Math.random() * (FOES.length-2))]);
		}
		for(let l = 0; l < foes.length-1; l++) {
			const index = Math.floor(Math.random() * (foes.length-1));
			const tmp = foes[l];
			foes[l] = foes[index];
			foes[index] = tmp;
		}
		for(let l = 0; l < foes.length-1; l++) {
			if(foes[l].fountain) {
				const index = Math.floor(3 + Math.random() * (foes.length-1 - 3));
				const tmp = foes[l];
				foes[l] = foes[index];
				foes[index] = tmp;				
			}
		}
		round = 1;
		
		document.addEventListener("keydown", onKey);
		refresh([
			"A caravan of heroes moves towards the dark castle to meet its destiny.",
			"Some creatures try to block the way.",
			"The heroes must do what it takes, to keep moving forward.",
			"And save the caravan.",
		]);
	}
	
	function fade(dir) {
		const overlay = document.getElementById('overlay');
		switch(dir) {
		case "in":
			overlay.classList.add("fade-in-overlay");
			overlay.classList.remove("fade-out-overlay");
			break;
		case "out":
			overlay.innerHTML = "";
			overlay.classList.add("fade-out-overlay");
			overlay.classList.remove("fade-in-overlay");
			break;
		}
	}
	
	function next() {
		fade("out");
		setTimeout(() => {
			step(++round);			
		}, 2500);
	}
	
	const imgCache = {};
	function getImg(src, callback) {
		let img = imgCache[src];
		if(!img) {
			img = imgCache[src] = document.createElement('img');
			img.src = src;
		}
		
		if(img.naturalWidth && img.naturalHeight) {
			callback(img);
		} else {
			img.addEventListener('load', e => {
				callback(img);
			});
		}
	}
	
	function onKey(e) {
//		console.log(e.keyCode);
		switch(e.keyCode) {
			case 27:
				start();
				break;
			// case 73:
			// 	fade("in");
			// 	break;
			// case 79:
			// 	fade("out");
			// 	break;
			// case 78:
			// 	if(!isGameOver() && !isGameWon() && frontHero) {
			// 		next();
			// 	}
			// 	break;
			// default:
			// 	for(let h in heroes) {
			// 		if(h===frontHero) {
			// 			continue;
			// 		}
			// 		if(String.fromCharCode(e.keyCode).toLowerCase() === h.charAt(0)) {
			// 			frontHero = h;
			// 			refresh();
			// 			break;
			// 		}
			// 	}
		}
	}

	return {
		start,
	};
})(document);