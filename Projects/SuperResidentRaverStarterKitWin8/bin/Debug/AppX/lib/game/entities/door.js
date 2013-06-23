/**
 *  @door.js
 *  @version: 1.00
 *  @author: Jesse Freeman
 *  @date: May 2013
 *  @copyright (c) 2013 Jesse Freeman, under The MIT License (see LICENSE)
 *  
 *  Part of the Super Resident Raver Starter Kit: 
 */
ig.module(
    'game.entities.door'
)
    .requires(
    'bootstrap.entities.base-advanced-door',
    'game.entities.player'
)
    .defines(function () {
        EntityDoor = EntityBaseAdvancedDoor.extend({
            _wmIgnore: false,
            size: { x: 80, y: 160 },
            doorSFX: new ig.Sound('media/sounds/open-door.*'),
            weapons: -1,
            delay: 10,
            doorDelayTimer: null,
            callback: null,
            delayTime: -1,
            autoLock: false,
            init: function (x, y, settings) {
                this.parent(x, y, settings);
                this.targets = ig.ksort(settings.target);
                this.setupAnimtions();
                this.activate(false);
            },
            setupAnimtions: function() {
                var atlas = ig.entitiesTextureAtlas;
                this.addTextureAtlasAnim(atlas, 'idle', 1, ['door-1-00.png'], false);
                this.addTextureAtlasAnim(atlas, 'open', .1, ['door-1-00.png', 'door-1-01.png', 'door-1-02.png', 'door-0-03.png', 'door-1-02.png', 'door-1-01.png', 'door-1-00.png'], true);
                this.addTextureAtlasAnim(atlas, 'locked', 1, ['door-0-00.png'], true);
            },
            open: function (value, callback) {
                this.callback = callback;
                this.parent(value);
                this.currentAnim = this.anims.open;
                this.currentAnim.rewind();
                this.doorSFX.play();
            },
            onOpen: function (value) {
                // Use this to have doors equp weapons
                if (this.weapons != -1)
                    this.target.equip(ig.utils.randomRange(0, this.weapons));

                this.delayTime = 0;
                // Make sure we don't spawn an entity when the player is in the door
                this.spawnZombieDelayTimer = null;

                // Moved this below the equip code to make sure it doesn't throw an error if no target exists
                this.parent(value);

                if (this.callback) {
                    this.callback();
                    this.callback = null;
                }

                var total = this.targets.length;
                
                for (var i = 0; i < total; i++) {
                    var target = ig.game.getEntityByName(this.targets[i]);
                    if (typeof target.trigger != 'undefined')
                        target.trigger(this);
                }
            },
            update: function () {
                if (this.currentAnim == this.anims.open) {
                    if (this.currentAnim.loopCount) {
                        if (this.isClosing)
                            this.onClose();
                        if (this.isOpening) {
                            this.onOpen();
                        }
                    }
                }

                if (this.delayTime != -1) {

                    
                    this.delayTime += ig.system.tick;

                    if (this.delayTime >= this.delay)
                        this.target.exitDoor();

                    if (this.delayTime >= this.delay * .5) {
                        var countdown = (this.delay - Math.round(this.delayTime) + 1);
                        var text = countdown > 0 ? "Exit Door In " + countdown : "Exiting Door";
                        if (!ig.game.captionInstance.captionText)
                            ig.game.displayCaption(text, this.delay * .5);
                        else
                            ig.game.captionInstance.captionText = text;
                    }

                }

                this.parent();

            },
            close: function () {
                this.parent();
                this.currentAnim = this.anims.open;
                this.currentAnim.rewind();
                this.doorSFX.play();
                this.delayTime = -1;
                
            },
            activate: function (value) {

                // Hack to fix a bug where isClosing doesn't reset
                this.isClosing = this.isOpening = false;
                
                if (!value) {
                    this.currentAnim = this.anims.idle;
                } else {
                    this.currentAnim = this.anims.locked;
                }
                this.parent(value);

            },
            onClose: function () {
                this.parent();
                this.activate(this.autoLock);
            },
            draw:function() {
                if (this.locked)
                    return;

                this.parent();
            },
            trigger: function (sourceEntity) {
                var player = ig.game.player;
                sourceEntity.delayTime = -1;
                var newX = ((this.size.x - player.size.x) * .5) + this.pos.x;
                var newY = this.pos.y + this.size.y - player.size.y;
                var that = this;
                ig.game.cameraFollow = { pos: { x: player.pos.x, y: player.pos.y }, size: { x: player.size.x, y: player.size.y } };
                player.doorTween = TweenLite.to(ig.game.cameraFollow.pos, 1.5, {
                    x: newX, y: newY,
                    onComplete: function () {
                        player.pos.x = ig.game.cameraFollow.pos.x;
                        player.pos.y = ig.game.cameraFollow.pos.y;
                        ig.game.cameraFollow = player;
                        player.currentDoor = that;
                        that.target = player;
                        that.delayTime = 0;
                        // destroy tween
                        player.doorTween.kill();
                        player.doorTween = null;
                    }
                });

                
            }
        })
        
        EntityPlayer.inject({
            currentDoor: null,
            atDoor: function (door) {
                this.currentDoor = door;
            },
            openDoor: function (callback) {
                if (this.currentDoor) {
                    this.currentDoor.open(this, callback);
                    this.visible = false;
                    this.vel.x = this.vel.y = 0;
                    this.accel.x = this.accel.y = 0;
                    this.collides = ig.Entity.COLLIDES.NONE;

                }
            },
            exitDoor: function (callback) {
                if (this.currentDoor) {
                    this.currentDoor.close(callback);
                    this.currentDoor = null;
                    this.visible = true;
                    this.collides = ig.Entity.COLLIDES.ACTIVE;
                }
            },
            openPressed: function () {

                if (this.currentDoor) {
                    if (this.currentDoor.isOpening || this.currentDoor.isClosing || this.doorTween)
                        return;

                    if (this.visible) {

                        this.openDoor();
                    }
                    else {
                        this.exitDoor();
                    }
                }
            },
            openReleased: function () {
                // Does nothing
            },
            update: function () {
                // Clear out any current door value

                this.parent();

                this.currentDoor = null;

            }
        })
    })