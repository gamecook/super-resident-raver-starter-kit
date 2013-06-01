ig.module(
    'game.plugins.stats'
)
    .requires(
    'impact.game',
    'bootstrap.plugins.menu',
    'bootstrap.plugins.pause',
    'bootstrap.plugins.utils',
    'plugins.impact-storage',
    'game.entities.person',
    'game.entities.weapon-pickup',
    'game.entities.zombie-a',
    'game.entities.zombie-b',
    'game.entities.zombie-c',
    'game.entities.zombie-d',
    'game.entities.zombie-d',
    'game.entities.zombie-f'
)

    .defines(function () {

        StatDisplay = ig.Class.extend({
            scoreTextLine1Obj: { x: 0, y: 0, w: 235, h: 31 },
            scoreTextLine2Obj: { x: 0, y: 0, w: 235, h: 31 },
            statsTextLine1Obj: { x: 0, y: 0, w: 258, h: 54 },
            statsTextLine2Obj: { x: 0, y: 0, w: 258, h: 54 },
            statsTextLine3Obj: { x: 0, y: 0, w: 258, h: 54 },
            statsTrayObj: { x: 0, y: 0, w: 509, h: 98 },
            overTextLine1Obj: { x: 0, y: 0, w: 767, h: 34 },
            restartTextObj: { x: 0, y: 0 },
            highScore: 0,
            score: 0,
            scoreBuffer: 0,
            delayTimer: new ig.Timer(),
            init: function () {

                this.textureFont = new ig.TextureAtlasFont(ig.nokia36WhiteShadowTextureAtlas, 2, 10);
                this.caption2Font = new ig.TextureAtlasFont(ig.nokia24WhiteShadowTextureAtlas, 2, 5);
                this.screenTextures = ig.screensTextureAtlas;

                // Set and get highscore from storage
                this.storage = new ig.Storage();

                // Use for debugging
                //this.storage.clear();
                
                if (this.storage.isSet("highScore"))
                    this.storage.setHighest("highScore", this.score);
                else
                    this.storage.set("highScore", this.score);

                this.highScore = this.storage.getInt("highScore");

                this.updateStats();

            },
            updateStats: function () {
                // Get Score
                this.score = ig.game.getStat("score") ? ig.game.getStat("score") : 0;


                if (ig.game.gameOver) {
                    // Initialize high score as 0 if 'highScore' does not exist
                    this.storage.setHighest('highScore', this.score);

                    this.highScore = this.storage.getInt("highScore");
                    
                }
                

                var tmpLength = ig.stats.totals.people.toString().length;
                this.statsLine1Text = ig.stats.people.toString().pad(tmpLength, "0", tmpLength) + "/" + ig.stats.totals.people;

                tmpLength = ig.stats.totals.backpacks.toString().length;
                this.statsLine2Text = ig.stats.backpacks.toString().pad(tmpLength, "0", tmpLength) + "/" + ig.stats.totals.backpacks;

                tmpLength = ig.stats.totals.zombies.toString().length;
                this.statsLine3Text = ig.stats.zombies.toString().pad(tmpLength, "0", tmpLength) + "/" + ig.stats.totals.zombies;

                
            },
            setupTweens: function (x, y, width, height) {

                var centerX = (width * .5);
                this.statsImg = this.screenTextures.getFrameData("stats-0.png").frame;


                this.statsTrayObj.x = -(this.statsTrayObj.w + 100);
                this.statsTrayObj.y = y;
                this.statsTrayTween = TweenLite.fromTo(this.statsTrayObj, .5, { x: this.statsTrayObj.x }, { x: (ig.system.width - 550) * .5, ease: Strong.easeOut });
                this.statsTrayTween.pause();


                // score line 1
                this.scoreTextLine1Obj.x = -(this.scoreTextLine1Obj.w + 100);
                this.scoreTextLine1Obj.y = y;
                this.scoreTextLine1Tween = TweenLite.fromTo(this.scoreTextLine1Obj, .5, { x: this.scoreTextLine1Obj.x }, { x: (ig.system.width - 550) * .5, ease: Strong.easeOut });
                this.scoreTextLine1Tween.pause();

                // score line 2
                this.scoreTextLine2Obj.x = -(this.scoreTextLine2Obj.w + 100);
                this.scoreTextLine2Obj.y = this.scoreTextLine1Obj.y + ((this.scoreTextLine1Obj.h + 5) * 3);
                this.scoreTextLine2Tween = TweenLite.fromTo(this.scoreTextLine2Obj, .5, { x: this.scoreTextLine2Obj.x }, { x: (ig.system.width - 550) * .5, ease: Strong.easeOut });
                this.scoreTextLine2Tween.pause();

                var statTargetX = (ig.system.width - (centerX + this.statsImg.w)) * .5 + centerX;// + 50;//centerX - (width * .5) + this.overTextLine1Obj.w - this.statsImg.width - 50;

                this.statsTextLine1Obj.x = this.statsTextLine2Obj.x = this.statsTextLine3Obj.x = ig.system.width + (this.statsTextLine1Obj.w + 100);

                // Stats Line 1
                this.statsTextLine1Obj.y = this.scoreTextLine1Obj.y - 20;
                this.statsTextLine1Tween = TweenLite.fromTo(this.statsTextLine1Obj, .5, { x: this.statsTextLine1Obj.x }, { x: statTargetX, ease: Strong.easeOut });
                this.statsTextLine1Tween.pause();

                // Stats Line 2
                this.statsTextLine2Obj.y = this.statsTextLine1Obj.y + this.statsTextLine1Obj.h + 40;
                this.statsTextLine2Tween = TweenLite.fromTo(this.statsTextLine2Obj, .5, { x: this.statsTextLine2Obj.x }, { x: statTargetX - 10, ease: Strong.easeOut });
                this.statsTextLine2Tween.pause();

                // Stats Line 3
                this.statsTextLine3Obj.y = this.statsTextLine2Obj.y + this.statsTextLine1Obj.h + 10;
                this.statsTextLine3Tween = TweenLite.fromTo(this.statsTextLine3Obj, .5, { x: this.statsTextLine3Obj.x }, { x: statTargetX, ease: Strong.easeOut });
                this.statsTextLine3Tween.pause();
                
                this.overTextImg = this.screenTextures.getFrameData("over-text.png").frame;
                this.restartTextImg = this.screenTextures.getFrameData("restart-text.png").frame;

                var centerX = (ig.system.width * .5);

                // Over Text Line 1 Text
                this.overTextLine1Obj.x = -(this.overTextLine1Obj.w + 100);
                this.overTextLine1Obj.y = 30;
                this.overTextLineTween = TweenLite.fromTo(this.overTextLine1Obj, .5, { x: this.overTextLine1Obj.x }, { x: centerX - (this.overTextImg.w * .5), ease: Strong.easeOut });
                this.overTextLineTween.pause();

                // Restart Text - no animation but set it up here
                this.restartTextObj.x = (ig.system.width - this.restartTextImg.w) * .5;
                //TODO need to relay this out where I put 0 in
                this.restartTextObj.y = (this.overTextLine1Obj.y + 70);

            },
            animateIn: function () {
               // this.animationDone = false;
                this.statsTrayTween.play();
                this.scoreTextLine1Tween.play();
                this.scoreTextLine2Tween.play();
                this.statsTextLine1Tween.play();
                this.statsTextLine2Tween.play();
                this.statsTextLine3Tween.play();
                this.overTextLineTween.play().delay(.5);

                this.scoreBuffer = 0;

                TweenLite.to(this, .3, { scoreBuffer: this.score, delay: .5 });
            },
            animateOut: function () {
                //this.animationDone = this.showStartText = false;
                this.statsTrayTween.reverse();
                this.scoreTextLine1Tween.reverse();
                this.scoreTextLine2Tween.reverse();
                this.statsTextLine1Tween.reverse();
                this.statsTextLine2Tween.reverse();
                this.statsTextLine3Tween.reverse();
                this.overTextLineTween.reverse();
            },
            draw: function () {

                this.textureFont.draw("  " + Math.round(this.scoreBuffer).toString().pad(9, "0"), this.scoreTextLine1Obj.x - 30, this.scoreTextLine1Obj.y + this.scoreTextLine1Obj.h + 8, ig.Font.ALIGN.LEFT);
                this.textureFont.draw("  " + Math.round(this.highScore).toString().pad(9, "0"), this.scoreTextLine2Obj.x - 30, this.scoreTextLine2Obj.y + this.scoreTextLine2Obj.h + 8, ig.Font.ALIGN.LEFT);

                // Score Text Line 1
                this.screenTextures.drawFrame("score-text-0.png", this.scoreTextLine1Obj.x, this.scoreTextLine1Obj.y);
                // Score Text Line 2
                this.screenTextures.drawFrame("score-text-1.png", this.scoreTextLine2Obj.x, this.scoreTextLine2Obj.y);

                // Stats
                this.screenTextures.drawFrame("stats-0.png", this.statsTextLine1Obj.x, this.statsTextLine1Obj.y);
                this.caption2Font.draw(this.statsLine1Text, this.statsTextLine1Obj.x + 80, this.statsTextLine1Obj.y + 45);

                this.screenTextures.drawFrame("stats-1.png", this.statsTextLine2Obj.x, this.statsTextLine2Obj.y);
                this.caption2Font.draw(this.statsLine2Text, this.statsTextLine2Obj.x + 78, this.statsTextLine2Obj.y + 32);

                this.screenTextures.drawFrame("stats-2.png", this.statsTextLine3Obj.x, this.statsTextLine3Obj.y);
                this.caption2Font.draw(this.statsLine3Text, this.statsTextLine3Obj.x + 78, this.statsTextLine3Obj.y + 47);


                if (ig.game.gameOver) {
                    // Over Text Line 1
                    this.screenTextures.drawFrame("over-text.png", this.overTextLine1Obj.x, this.overTextLine1Obj.y);

                    this.showStartText = Math.round(this.delayTimer.delta()) % 2 ? true : false;

                    if (this.showStartText)
                        this.screenTextures.drawFrame("restart-text.png", this.restartTextObj.x, this.restartTextObj.y);

                }

            }

        })

        ig.Game.inject({
            stats: null,
            showStats: true,
            comboCounter: 0,
            comboTimer: new ig.Timer(),
            comboDelay: 2,
            loadLevel: function (data) {
                this.resetStats();
                this.parent(data);
            },
            resetStats: function () {
                ig.stats = null;
                ig.stats = { "score": 0, "time": 0, "people": 0, "backpacks": 0, "zombies": 0 };
                ig.stats.totals = { "people": 0, "backpacks": 0, "zombies": 0 };
            },
            levelUp: function() {
                
                this.parent();
                
                if (this.level == 2)
                    this.resetStats();
            },
            updateStat: function (key, value) {
                ig.stats[key] = value;
            },
            addStat: function (key, value) {
                if (!ig.stats[key])
                    ig.stats[key] = 0;

                ig.stats[key] += value;
            },
            addStreakStat: function (key, value) {
                if (!ig.stats[key])
                    ig.stats[key] = 0;

                if (ig.stats[key] < value)
                    ig.stats[key] = value;
            },
            getStat: function (key) {
                return ig.stats[key];
            },
            increaseComboCounter: function (value) {
                if (this.comboTimer.delta() < this.comboDelay) {
                    this.comboCounter += value;
                } else {
                    this.comboCounter = value;
                }
                //TODO need to reset this after a while
                this.comboTimer.reset();

                if (this.comboCounter > 1) {
                    ig.game.spawnEntity(EntityComboDisplay, this.player.pos.x, this.player.pos.y - 40, { value: this.comboCounter });
                    ig.game.addStreakStat("best combo", this.comboCounter);
                }
            },
            increaseScore: function (value) {
                this.addStat("score", value);
            }
        })

        EntityPerson.inject({
            value: 100,
            init: function(x, y, settings) {
                this.parent(x, y, settings);
                ig.stats.totals.people++;
            },
            outOfBounds: function () {
                this.parent();
                ig.game.addStat("people", 1);
                ig.game.increaseScore(this.value);
            }
        });

        EntityWeaponPickup.inject({
            value: 50,
            init: function (x, y, settings) {
                this.parent(x, y, settings);
                ig.stats.totals.backpacks++;
            },
            onPickup: function (target) {
                this.parent(target);
                ig.game.addStat("backpacks", 1);
                ig.game.increaseScore(this.value);
            }
        })
        
        EntityZombieA.inject({
            value: 10,
            init: function (x, y, settings) {
                this.parent(x, y, settings);
                ig.stats.totals.zombies++;
            },
            kill: function (noAnimation) {
                this.parent(noAnimation);
                if (!noAnimation) {
                    ig.game.addStat("zombies", 1);
                    ig.game.increaseScore(this.value * (ig.game.comboCounter == 0 ? 1 : ig.game.comboCounter));
                }
            }
        })
        
        EntityZombieB.inject({
            value: 20,
            init: function (x, y, settings) {
                this.parent(x, y, settings);
                ig.stats.totals.zombies++;
            },
            kill: function (noAnimation) {
                this.parent(noAnimation);
                if (!noAnimation) {
                    ig.game.addStat("zombies", 1);
                    ig.game.increaseScore(this.value * (ig.game.comboCounter == 0 ? 1 : ig.game.comboCounter));
                }
            }
        })
        
        EntityZombieC.inject({
            value: 30,
            init: function (x, y, settings) {
                this.parent(x, y, settings);
                ig.stats.totals.zombies++;
            },
            kill: function (noAnimation) {
                this.parent(noAnimation);
                if (!noAnimation) {
                    ig.game.addStat("zombies", 1);
                    ig.game.increaseScore(this.value * (ig.game.comboCounter == 0 ? 1 : ig.game.comboCounter));
                }
            }
        })
        
        EntityZombieD.inject({
            value: 40,
            init: function (x, y, settings) {
                this.parent(x, y, settings);
                ig.stats.totals.zombies++;
            },
            kill: function (noAnimation) {
                this.parent(noAnimation);
                if (!noAnimation) {
                    ig.game.addStat("zombies", 1);
                    ig.game.increaseScore(this.value * (ig.game.comboCounter == 0 ? 1 : ig.game.comboCounter));
                }
            }
        })
        
        EntityZombieE.inject({
            value: 50,
            init: function (x, y, settings) {
                this.parent(x, y, settings);
                ig.stats.totals.zombies++;
            },
            kill: function (noAnimation) {
                this.parent(noAnimation);
                if (!noAnimation) {
                    ig.game.addStat("zombies", 1);
                    ig.game.increaseScore(this.value * (ig.game.comboCounter == 0 ? 1 : ig.game.comboCounter));
                }
            }
        })
        
        EntityZombieF.inject({
            value: 50,
            init: function (x, y, settings) {
                this.parent(x, y, settings);
                ig.stats.totals.zombies++;
            },
            kill: function (noAnimation) {
                this.parent(noAnimation);
                if (!noAnimation) {
                    ig.game.addStat("zombies", 1);
                    ig.game.increaseScore(this.value * (ig.game.comboCounter == 0 ? 1 : ig.game.comboCounter));
                }
            }
        })
        
    });
