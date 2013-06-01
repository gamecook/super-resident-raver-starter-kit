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
            weapons: 4,
            delay: 10,
            doorDelayTimer: null,
            callback: null,
            delayTime: -1,
            init: function (x, y, settings) {
                this.parent(x, y, settings);
                this.targets = ig.ksort(settings.target);
                var atlas = ig.entitiesTextureAtlas;
                this.addTextureAtlasAnim(atlas, 'idle', 1, ['door-1-00.png'], true);
                this.addTextureAtlasAnim(atlas, 'open', .1, ['door-1-00.png', 'door-1-01.png', 'door-1-02.png', 'door-0-03.png', 'door-1-02.png', 'door-1-01.png', 'door-1-00.png'], true);
                this.addTextureAtlasAnim(atlas, 'locked', 1, ['door-0-00.png'], true);
                this.activate(false);
                
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
                /*if (this.target)
                    this.target.equip(Math.floor(Math.random() * this.weapons) + 1);*/

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
                        target.trigger();
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
                //this.doorDelayTimer = null;
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
                this.activate(true);
            },
            draw:function() {
                if (this.locked)
                    return;

                this.parent();
            }
        })
        
        EntityPlayer.inject({
            currentDoor: null,
            atDoor: function (door) {
                //if (this.standing)
                this.currentDoor = door;
            },
            openDoor: function (callback) {
                if (this.currentDoor) {
                    this.currentDoor.open(this, callback);
                    this.visible = false;
                    this.vel.x = this.vel.y = 0;
                    this.accel.x = this.accel.y = 0;

                    //this.type = ig.Entity.TYPE.NONE;
                    this.collides = ig.Entity.COLLIDES.NONE;

                }
            },
            exitDoor: function (callback) {
                if (this.currentDoor) {
                    this.currentDoor.close(callback);
                    this.currentDoor = null;
                    this.visible = true;
                    this.collides = ig.Entity.COLLIDES.ACTIVE
                }
            },
            openPressed: function () {

                if (this.currentDoor) {
                    if (this.currentDoor.isOpening || this.currentDoor.isClosing)
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