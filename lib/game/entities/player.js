/**
 *  @player.js
 *  @version: 1.00
 *  @author: Jesse Freeman
 *  @date: May 2012
 *  @copyright (c) 2013 Jesse Freeman, under The MIT License (see LICENSE)
 *  
 *  Part of the Super Resident Raver Starter Kit: 
 */
ig.module(
    'game.entities.player'
)
    .requires(
    'impact.sound',
    'bootstrap.entities.base-actor',
    'bootstrap.entities.death-explosion'
)
    .defines(function () {
        EntityPlayer = EntityBaseActor.extend({
            _wmIgnore:false,
            size:{ x:40, y:70 },
            offset:{ x:20, y:5 },
            hurtSFX: new ig.Sound('media/sounds/hurt.*'),
            thudSFX: new ig.Sound('media/sounds/thud.*'),
            powerupSFX: new ig.Sound('media/sounds/power-up.*'),
            maxVel:{ x:300, y:500 },
            friction:{ x:1500, y:0 },
            accelGround:1500,
            accelAir: 500,
            type:ig.Entity.TYPE.A,
            checkAgainst:ig.Entity.TYPE.NONE,
            collides:ig.Entity.COLLIDES.ACTIVE,
            fallDistance:300,
            healthMax:10,
            health:10,
            bounciness:0,
            fallDamageValue: 3,
            weaponId: 0,
            moving: { right: 0, left: 0, up: 0 },
            jump: 1000,
            init:function (x, y, settings) {
                this.parent(x, y, settings);
                this.setupAnimation();
            },
            setupAnimation: function () {

                var atlas = ig.entitiesTextureAtlas;

                this.addTextureAtlasAnim(atlas, 'idle', 1, ['player-idle-' + this.weaponId + '.png'], false);
                this.addTextureAtlasAnim(atlas, 'run', .07, ['player-walk-'+this.weaponId+'-00.png', 'player-walk-'+this.weaponId+'-01.png', 'player-walk-'+this.weaponId+'-02.png', 'player-walk-'+this.weaponId+'-03.png', 'player-walk-'+this.weaponId+'-04.png', 'player-walk-'+this.weaponId+'-05.png', 'player-walk-'+this.weaponId+'-06.png', 'player-walk-'+this.weaponId+'-07.png'], false);
                this.addTextureAtlasAnim(atlas, 'fire', .05, ['player-fire-' + this.weaponId + '-00.png', 'player-fire-' + this.weaponId + '-01.png', 'player-fire-' + this.weaponId + '-02.png'], true);

                this.currentAnim = this.anims.idle;
            },
            outOfBounds:function () {
                this.fallOutOfBoundsSFX.play();
                this.parent();
            },
            updateAnimation:function () {
                this.parent();

                // set the current animation, based on the player's speed
                if (Math.abs(this.vel.x) > 0 && this.standing) {
                    this.currentAnim = this.anims.run;
                } else if (Math.abs(this.vel.x) == 0 && !this.standing) {
                    this.currentAnim = this.anims.idle;
                
                } else if (Math.abs(this.vel.y) > 0 && !this.standing) {
                    this.currentAnim = this.anims.run;
                
                } else {
                    
                    if (this.shotPressed)
                        this.currentAnim = this.anims.fire;
                    else {
                        this.currentAnim = this.anims.idle;
                    }
                }

                this.currentAnim.flip.x = this.flip;
                
            },
            update:function () {

                // Right
                if (this.moving.right > 0) {
                    var accel = this.standing ? this.accelGround : this.accelAir;
                    this.accel.x = Math.round(accel * this.moving.right);
                    this.flip = false;
                } else if (this.moving.left > 0) {
                    var accel = this.standing ? this.accelGround : this.accelAir;
                    this.accel.x = Math.round(-accel * this.moving.left);
                    this.flip = true;
                }
                else
                {
                    this.accel.x = 0;
                }

                // Stop the player from moving when shooting
                if (this.shotPressed || !this.visible) {
                    this.vel.x = this.accel.x = this.moving.right = this.moving.left = 0;
                }

                this.parent();
            },
            rightDown: function (percent) {
                if (!percent) percent = 1;
                this.moving.right = percent;
            },
            rightReleased:function () {
                this.moving.right = 0;
            },
            leftDown: function (percent) {

                if (!percent) percent = 1;
                this.moving.left = percent;
            },
            leftReleased:function () {
                this.moving.left = 0;
            },
            jumpDown:function ()
            {
                if (this.standing && ig.input.pressed('jump')) {
                    this.vel.y = -this.jump;
                }
            },
            addPowerUp: function (property, value, message) {
                this.parent(property, value);
                if (this[property] != null) {

                    if (message)
                        ig.game.displayCaption(message, 2);
                }
            },
            receiveDamage: function(value, from, overrideInvincible) {

                if (!this.visible)
                    return;
               
                this.parent(value, from);

                if (!this.invincible && !overrideInvincible) {
                    this.hurtSFX.play();
                    this.makeInvincible();
                    ig.game.shake(1, 2);
                }

                if (this.health <= 0) {
                    var deathText = "You Were Killed!";
                    ig.game.displayCaption(deathText, 2);
                }
            },
            onFallToDeath:function (floor) {
                this.parent();
                ig.game.shake(1, 4);
            },
            onKill:function () {
                ig.game.onGameOver();
            },
            onLand: function() {
                this.thudSFX.play();
            },
            onGotoNextLevel: function () {
                this.gotoNextLevel = true;
                this.nextSafeZone = this.pos.y + this.size.y + 200;
                this.vel.y = 500;
                this.vel.x = this.accel.x = this.accel.y = 0;
            },
            handleMovementTrace: function (res) {

                if (this.gotoNextLevel) {
                    this.pos.x += this.vel.x * ig.system.tick;
                    this.pos.y += this.vel.y * ig.system.tick;
                }
                else {
                    this.parent(res);
                }
            },
            onDeathAnimation:function () {
                ig.game.spawnEntity(EntityDeathExplosion, this.pos.x, this.pos.y, { colorOffset:this.bloodColorOffset, callBack:this.onKill });
            }
        });

        EntityDeathExplosion.inject({
            particles: 3    
        })
        
        EntityBloodParticle.inject({
            baseVelocity:{ x:5, y:-50 },
            vel: { x: 50, y: 350 },
            gravityFactor: .5,
            animSheet:new ig.AnimationSheet('media/sprites/particle-sprites.png', 10, 10),
            bounciness: .5,
            setupAnimation: function() {
                this.size = { x: 2, y: 2 };
                var frameID = Math.round(Math.random() * this.totalColors) + (this.colorOffset * (this.totalColors + 1));
                this.addAnim('idle', 0.2, [frameID]);
            }
        })
        
        EntityDeathExplosionParticle.inject({
            baseVelocity: { x: 5, y: -50 },
            vel: { x: 50, y: 350 },
            gravityFactor: .5,
            animSheet: new ig.AnimationSheet('media/sprites/particle-sprites.png', 10, 10),
            bounciness: .5,
            types: 8,
            delay: 3,
            fadetime: 2,
            friction: {x: 300, y: 0},
            setupVelocity: function () {
                this.baseVelocity = { x: ig.utils.randomRange(-10, 10), y: ig.utils.randomRange(-30, -100) };
                
                this.vel.x = (Math.random() * this.baseVelocity.x - 1) * this.vel.x;
                this.vel.y = (Math.random() * this.baseVelocity.y - 1) * this.vel.y;
            },
            setupAnimation: function () {
                this.size = { x: 35, y: 35 };
                this.offset = { x: 0, y: -15 };
                
                var atlas = ig.entitiesTextureAtlas;

                this.spriteId = ig.utils.randomRange(0, this.types - 1);

                this.addTextureAtlasAnim(atlas, 'idle', 1, ['body-part-' + this.spriteId + '.png'], false);

            }
        })
    });
