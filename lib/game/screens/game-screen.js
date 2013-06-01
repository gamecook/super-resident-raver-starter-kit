/**
 *  @game-screen.js
 *  @version: 1.00
 *  @author: Jesse Freeman
 *  @date: May 2013
 *  @copyright (c) 2013 Jesse Freeman, under The MIT License (see LICENSE)
 *  
 *  Part of the Super Resident Raver Starter Kit: 
 */
ig.module(
    'game.screens.game-screen'
)
.requires(
    'impact.game',
    'impact.font',
    'bootstrap.plugins.camera',
    'game.plugins.effects',
    'bootstrap.plugins.pause',
    'bootstrap.plugins.utils',
    'bootstrap.plugins.hit-area',
    'game.plugins.caption'
)
    .defines(function () {

        GameScreen = ig.Game.extend({
            font: null,
            pauseButton:new ig.Image('media/sprites/pause.png'),
            player:null,
            screenBoundary:null,
            gravity:1500,
            rewardsTotal:0,
            gameOver:false,
            cameraYOffset:0,
            gameOverDelay:2,
            gameOverDelayTimer:new ig.Timer(),
            quitButton:{ name:"quit", label:"QUIT GAME", x:0, y:0, width:0, height:0 },
            soundButton:{ name:"sound", label:"SOUND", x:0, y:0, width:0, height:0 },
            showHUD: true,
            init: function (level) {
                this.textures = ig.entitiesTextureAtlas;
                this.font = new ig.TextureAtlasFont(ig.nokia36WhiteShadowTextureAtlas, 2, 10);
                this.font2 = new ig.TextureAtlasFont(ig.nokia24WhiteShadowTextureAtlas, 2, 10);
                this.levelTransitionTimer = new ig.Timer();
                this.loadGame(level);

            },
            loadGame: function (level)
            {
                this.loadLevelByFileName(level);
                this.alignButtons();
            },
            alignButtons:function () {

                this.clearHitAreas();

                this.pauseX = (ig.system.width - this.pauseButton.width) * .5;
                
                this.registerHitArea("pause", this.pauseX, 8, this.pauseButton.width, this.pauseButton.height * .5);

                // Register buttons

                // Quit Button
                this.quitButton.width = this.font.widthForString(this.quitButton.label);
                this.quitButton.height = this.font.heightForString(this.quitButton.label);
                this.quitButton.x = ig.system.width - (this.quitButton.width + 5);
                this.quitButton.y = 3;
                this.registerHitArea(this.quitButton.name, this.quitButton.x, this.quitButton.y, this.quitButton.width, this.quitButton.height);

                // Sound Button
                this.soundButton.width = this.font.widthForString(this.soundButton.label + " OFF");
                this.soundButton.height = this.font.heightForString(this.soundButton.label);
                this.soundButton.x = 3;//ig.system.width - (this.soundButton.width + 5);
                this.soundButton.y = 3;//(this.soundButton.height) + 3;
                this.registerHitArea(this.soundButton.name, this.soundButton.x, this.soundButton.y, this.soundButton.width, this.soundButton.height);

            },
            loadLevel:function (data) {
                this.gameOver = false;
                this.levelTimer = new ig.Timer();

                ig.input.unbindAll();
                this.parent(data);
                this.player = this.getEntitiesByType(EntityPlayer)[0];
                // use this to set a default weapon on the player
                //this.player.equip(1);
                this.cameraFollow = this.player;
                this.levelTimer.reset();
                
                ig.input.bind(ig.KEY.MOUSE1, "click");

                // Keyboard controls
                ig.input.bind(ig.KEY.LEFT_ARROW, 'left');
                ig.input.bind(ig.KEY.RIGHT_ARROW, 'right');
                ig.input.bind(ig.KEY.UP_ARROW, 'jump');
                ig.input.bind(ig.KEY.SPACE, 'shoot');

            },
            updateControlMovement: function () {
                if (this.player == null)
                    return;

                    // Keyboard Controls
                    if (this.player.visible && !this.gameOver) {

                        // left
                        if (ig.input.pressed('left')) {
                            this.player.leftDown();
                        } else if (ig.input.released('left')) {
                            this.player.leftReleased();
                        }

                        // right
                        if (ig.input.pressed('right')) {
                            this.player.rightDown();
                        } else if (ig.input.released('right')) {
                            this.player.rightReleased();
                        }

                        // jump
                        if (ig.input.state('jump') && this.player.standing) {
                            if (this.player.currentDoor)
                                this.player.openPressed();
                            else
                                this.player.jumpDown();
                        }

                        // shoot
                        if (ig.input.state('shoot')) {
                            this.player.shotPressed = true;
                        } else if (ig.input.released('shoot')) {
                            this.player.shotPressed = false;
                        }

                    } else if (this.player.currentDoor && !this.player.visible) {
                        if (ig.input.state('jump')) {
                            this.player.openPressed();
                        }
                    }
               // }

            },
            update:function () {

                // Update all entities and backgroundMaps
                this.parent();

                //TODO this needs to be based on player position and not split screen
                if (ig.input.pressed('click')) {
                    
                    if (!this.gameOver) {

                        if (this.displayHint) {
                            this.hideHint();
                            console.log("click");
                            return;
                        }

                        //console.log("test click", this.moveToNextLevel
                        if (this.movingToNextLevel && this.paused) {
                            this.togglePause(false);
                            this.levelTransitionTimer.reset();
                            this.levelTransitionTimer.unpause();
                            console.log("click to move to next level");
                            return;
                        }

                        // TO Hittest
                        var hits = this.testHitAreas(ig.input.mouse.x, ig.input.mouse.y);
                        this.onClickHitTest(hits);

                    }else {
                        if (this.gameOverDelayTimer.delta() > this.gameOverDelay) {
                            this.restartGame();
                        }

                        
                    }
                }

                // Update control movement
                if (!this.gameOver && !this.paused)
                    this.updateControlMovement();

                if (this.gameOverDelayTimer.delta() > this.gameOverDelay && this.gameOver && !this.paused) {
                    this.clearCaption();
                    this.togglePause(true);
                }

            },
            onClickHitTest: function(hits) {
                if (hits.indexOf("pause") != -1) {
                    this.togglePause();
                } else if (this.paused) {
                    // test for hitareas when paused
                    if (hits.indexOf("quit") != -1) {
                        ig.system.setGame(StartScreen);
                    }

                    // Handle sound/music buttons
                    if (!ig.ua.mobile) {
                        if (hits.indexOf("sound") != -1) {
                            ig.soundManager.volume = (ig.soundManager.volume > 0) ? 0 : 1;
                        }
                    }
                }
            },
            restartGame: function() {
                this.loadLevelByFileName(this.currentLevelName);
                this.clearCaption();
                this.showHUD = true;
                this.togglePause(false);
            },
            onGameOver:function () {
                this.gameOver = true;
                this.gameOverDelayTimer.reset();
            },
            onPause:function () {
                this.parent();
                this.levelTimer.pause();
                ig.music.pause();

                this.clearCaption();

                if (this.movingToNextLevel) {

                    if (this.ad)
                        this.ad.style.display = "block";
                } else {
                    if (this.ad2 && !this.gameOver)
                        this.ad2.style.display = "block";
                }

            },
            onResume:function () {
                this.parent();
                this.levelTimer.unpause();
                ig.music.play();
            },
            draw:function () {
                // Draw all entities and backgroundMaps
                this.parent();

                if (!this.gameOver) {
                    if (!this.displayHint && !this.movingToNextLevel)
                        this.pauseButton.drawTile(this.pauseX, 8, (this.paused ? 1 : 0), 60, 34);
                    else if(!this.movingToNextLevel){
                        this.hintSprites.drawTile((ig.system.width - 394) * .5, 50, this.renderHint, 394, 53);
                    }
                }

                if (this.paused) {
                    this.drawPauseDisplay();
                }

                if (this.scanLines)
                    this.scanLines.draw(0, 0);

            },
            drawPauseDisplay: function() {
                //Quit Button
                if (!this.gameOver && !this.displayHint && !this.movingToNextLevel) {
                    this.font.draw(this.quitButton.label, this.quitButton.x - 10, this.quitButton.y);

                    this.font.draw("TIME: " + Math.round(this.levelTimer.delta()).toString().fromatTime(), this.quitButton.x - 30, this.quitButton.y + 40);
                    
                }
                else if (!this.displayHint || this.movingToNextLevel) {
                    this.font.draw("FINAL TIME: " + Math.round(this.levelTimer.delta()).toString().fromatTime(), (ig.system.width - 400) * .5, 140);
                }

                if (!ig.ua.mobile && !this.gameOver && !this.displayHint && !this.movingToNextLevel) {
                    //Sound Button
                    this.font.draw(this.soundButton.label + (ig.soundManager.volume > 0 ? " ON" : " OFF"), this.soundButton.x + 10, this.soundButton.y);
                }
                
            },
            exitLevel:function () {
                this.clearCaption();
                ig.system.setGame(StartScreen);
            }
        });
        
    });