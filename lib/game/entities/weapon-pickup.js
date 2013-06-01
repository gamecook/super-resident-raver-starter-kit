ig.module(
    'game.entities.weapon-pickup'
)
    .requires(
    'bootstrap.entities.base-item',
    'game.entities.player',
     'bootstrap.entities.base-weapons'
)
    .defines(function () {

        EntityWeaponPickup = EntityBaseItem.extend({
            _wmIgnore: false,
            powerUpProperty: "health",
            value: 10,
            maxVel: { x: 200, y: 200 },
            bounciness: .9,
            bounceCounter: 0,
            maxBounces: 3,
            checkAgainst: ig.Entity.TYPE.NONE,
            spriteId: 0,
            delay: 10,
            zIndex: -1,
            types: 1,
            weapons: 3,
            baseLevel: 10,
            delayTime: 0,
            level: 0,
            weaponId: 2,
            init: function(x, y, settings) {
                this.parent(x, y, settings);

                this.size = { x: 60, y: 45 };
                this.offset = { x: 0, y: -15 };
                var atlas = ig.entitiesTextureAtlas;

                this.spriteId = ig.utils.randomRange(0, this.types - 1);

                this.addTextureAtlasAnim(atlas, 'idle', 1, ['backpack-' + this.spriteId + '.png'], false);

            },
            handleMovementTrace: function(res) {
                this.parent(res);
                if (res.collision.x || res.collision.y) {
                    this.bounce();
                }
            },
            bounce: function() {
                this.bounceCounter++;
                if (this.bounceCounter > this.maxBounces) {
                    this.vel.x = 0;
                    this.vel.y = 0;
                    this.checkAgainst = ig.Entity.TYPE.A;
                }
            },
            onPickup: function (target) {
                
                if (target instanceof EntityPlayer && target.visible) {
                    target.equip(this.weaponId);
                    this.kill();
                }
            },
            update: function() {

                if (this.delayTime != -1) {
                

                this.delayTime += ig.system.tick;

                if (this.delayTime > this.delay)
                    this.kill();

                if (this.delayTime > (this.delay * .4)) {
                    if (Math.round(this.delayTime) % 2 == 0)
                        this.currentAnim.alpha = .7;
                    else {
                        this.currentAnim.alpha = 1;
                    }
                }
            }
            this.parent();
            }
        });
        
        EntityPlayer.inject({
            equip: function (id, hideMessage) {
                this.weaponId = id;

                if (this.weapon == id) {

                    text = "You Didn't Find A New Weapon!";

                    if (ig.game.player.health < 5 && Math.random() > .3) {
                        text = "You Found A Health Pack!";
                        ig.game.player.health = ig.game.player.healthMax;
                    }

                } else {

                    this.weapon = id;
                    if (this.weapon != 0) {
                        switch (this.weapon) {
                            case (1):
                            default:
                                this.activeWeapon = "EntityPistol";
                                text = "You Found A Pistol!";
                                break;
                            case (2):
                                this.activeWeapon = "EntityShotgunShell";
                                text = "You Found A Shotgun!";
                                break;
                            case (3):
                                this.activeWeapon = "EntityMachineGun";
                                text = "You Found A Machine Gun!";
                                break;
                        }

                        this.fireRate = 0;
                        this.clearWeaponPool();
                    } else {
                        this.activeWeapon = "none";
                        text = "You Are Out Of Ammo, Find A Door!";
                    }

                    this.setupAnimation();
                }

                if (!hideMessage && text != "")
                    ig.game.displayCaption(text, 2);
            }
        });

        EntityShellParticle = EntityBloodParticle.extend({
            baseVelocity: { x: 5, y: -50 },
            vel: { x: 50, y: 350 },
            gravityFactor: .5,
            animSheet: new ig.AnimationSheet('media/sprites/particle-sprites.png', 10, 10),
            bounciness: .5,
            delay: 1,
            fadetime: .5,
            setupAnimation: function () {
                this.size = { x: 10, y: 5 };
                this.offset = { x: 0, y: -10 };

                var atlas = ig.entitiesTextureAtlas;
                this.addTextureAtlasAnim(atlas, 'idle', 1, ['bullet-shell-'+this.spriteId+'.png'], false);

                this.currentAnim.flip.x = this.flip;
            }
        })
        
        EntityPistol = EntityBaseWeapons.extend({
            size: { x: 25, y: 15 },
            maxVel: { x: 1500, y: 0 },
            type: ig.Entity.TYPE.NONE,
            checkAgainst: ig.Entity.TYPE.B,
            collides: ig.Entity.COLLIDES.PASSIVE,
            maxPool: 2,
            automatic: true,
            fireRate: .5,
            attackValue: 2,
            gunFireSFX: new ig.Sound('media/sounds/gun-fire.*'),
            init: function (x, y, settings) {
                x += (settings.flip ? -20 : 40);
                y += 25;
                this.parent(x, y, settings);
                this.vel.x = this.accel.x = (settings.flip ? -this.maxVel.x : this.maxVel.x);
                //this.addAnim('idle', 0.2, [0]);

                var atlas = ig.entitiesTextureAtlas;
                this.addTextureAtlasAnim(atlas, 'idle', 1, ['bullet-gun.png'], false);

                this.gunFireSFX.play();
                
                ig.game.spawnEntity(EntityShellParticle, x + (settings.flip ? 10 : -20), y, { spriteId: 0, flip: settings.flip });

            },
            handleMovementTrace: function (res) {
                this.parent(res);
                if (res.collision.x || res.collision.y) {
                    this.kill();
                }
            }
        });

        
        EntityShotgunShell = EntityBaseWeapons.extend({
            size: { x: 25, y: 15 },
            maxVel: { x: 1000, y: 0 },
            type: ig.Entity.TYPE.NONE,
            checkAgainst: ig.Entity.TYPE.B,
            collides: ig.Entity.COLLIDES.PASSIVE,
            recoil: 0,
            distance: 20,
            maxPool: 1,
            automatic: true,
            fireRate: .7,
            attackValue: 8,
            shotgunFireSFX: new ig.Sound('media/sounds/shotgun-fire.*'),
            init: function (x, y, settings) {
                x += (settings.flip ? -20 : 40);
                y += 28;
                this.parent(x, y, settings);

                this.vel.x = this.accel.x = (settings.flip ? -this.maxVel.x : this.maxVel.x);

                var atlas = ig.entitiesTextureAtlas;
                this.addTextureAtlasAnim(atlas, 'idle', 1, ['bullet-machinegun.png'], false);

                this.shotgunFireSFX.play();
                
                ig.game.spawnEntity(EntityShellParticle, x + (settings.flip ? 50 : -30), y, { spriteId: 1, flip: settings.flip });
            },
            handleMovementTrace: function (res) {
                this.parent(res);
                if (res.collision.x || res.collision.y) {
                    this.kill();
                }
            },
            update: function () {
                this.parent();
                this.distance--;
                if (this.distance < 0) {
                    this.kill();
                }
            },
            check: function (other) {
                other.receiveDamage(this.attackValue, this);
                this.kill();
            }
        });

        EntityMachineGun = EntityBaseWeapons.extend({
            size: { x: 25, y: 15 },
            maxVel: { x: 1500, y: 0 },
            type: ig.Entity.TYPE.NONE,
            checkAgainst: ig.Entity.TYPE.B,
            collides: ig.Entity.COLLIDES.PASSIVE,
            automatic: true,
            fireRate: .3,
            recoil: 0,
            maxPool: 4,
            attackValue: 4,
            machineGunFireSFX: new ig.Sound('media/sounds/machine-gun-fire.*'),
            init: function (x, y, settings) {
                x += (settings.flip ? -20 : 40);
                y += 35;
                this.parent(x, y, settings);
                
                this.vel.x = this.accel.x = (settings.flip ? -this.maxVel.x : this.maxVel.x);

                var atlas = ig.entitiesTextureAtlas;
                this.addTextureAtlasAnim(atlas, 'idle', 1, ['bullet-shotgun.png'], false);

                this.machineGunFireSFX.play();
                
                ig.game.spawnEntity(EntityShellParticle, x + (settings.flip ? 50 : -30), y, { spriteId: 2, flip: settings.flip });
            },
            handleMovementTrace: function (res) {
                this.parent(res);
                if (res.collision.x || res.collision.y) {
                    this.kill();
                }
            },
            check: function (other) {
                other.receiveDamage(this.attackValue, this);
                this.kill();
            }
        });

    })