ig.module(
    'game.entities.zombie'
)
    .requires(
    'bootstrap.entities.base-monster',
    'bootstrap.entities.death-explosion'
)
    .defines(function () {
        EntityZombie = EntityBaseMonster.extend({
            _wmIgnore: true,
            lookAhead: 5,
            spawner: null,
            flipOnOutOfBounds: true,
            bloodColorOffset: 1,
            types: 1,
            particles: 3,
            collides: ig.Entity.COLLIDES.PASSIVE,
            init: function(x, y, settings) {
                this.parent(x, y, settings);
                this.spawner = settings.spawner;
                this.setupAnimation(settings.spriteId ? settings.spriteId : ig.utils.randomRange(0, this.types - 1));
            },
            check: function(other) {
                this.parent(other);

                // Player is on top of monster so just keep walking in same direction
                if (other.pos.y > this.pos.y)
                    return;

                // Test what side the player is on and flip direction based on that.
                this.flip = (other.pos.x > this.pos.x) ? true : false;

            },
            
            onUpdateAI: function() {

                if (this.stayOnPlatform) {
                    // near an edge? return!
                    if (ig.game.collisionMap.getTile(
                            this.pos.x + (this.flip ? -this.lookAhead : this.size.x + this.lookAhead),
                            this.pos.y + this.size.y + 1
                        ) == 0
                        && this.standing) {
                        this.flip = !this.flip;
                    }
                }

                var xdir = this.flip ? -1 : 1;
                this.vel.x = this.speed * xdir;

                
            },
            check:function (other)
            {
                //Do a quick test to make sure the other object is visible
                if(other.visible)
                {
                    other.receiveDamage(this.collisionDamage, this);

                    // Player is on top of monster so just keep walking in same direction
                    if(other.pos.y > this.pos.y)
                        return;

                    // Test what side the player is on and flip direction based on that.
                    this.flip = (other.pos.x > this.pos.x) ? true : false;
                }
            },
            handleMovementTrace: function (res) {
                this.parent(res);

                // Handles collision with solid and one way tiles
                if (res.collision.x || res.collision.slope.ny == 0) {

                    if (this.flipOnOutOfBounds)
                        this.flip = !this.flip;
                    else
                        this.outOfBounds();
                }
  
                if (this.currentAnim)
                    this.currentAnim.flip.x = this.flip;
            },
            kill: function (noAnimation) {
                this.parent(noAnimation);
                if (this.spawner)
                    this.spawner.removeItem();
                ig.game.totalDeaths++;
            },
            receiveDamage: function (value, target) {
                this.parent(value, target);

                ig.game.spawnEntity(EntityPointDisplay, this.pos.x, this.pos.y - 30, { value: value + 1 });

                if (this.health <= 0) {
                    this.onKilled(target);
                }
            },
            onKilled: function (target) {
                ig.game.spawnEntity(EntityBloodPuddle, this.pos.x, this.pos.y + this.size.y - 10, { flip: this.flip, spriteId: this.bloodColorOffset });
            },
            draw: function () {
                if (ig.editor) {
                    if (this.lastspriteId != this.spriteId)
                        this.setupAnimation(this.spriteId);
                }
                this.parent();
            }
        });
        
        EntityBloodPuddle = ig.Entity.extend({
            flip: false,
            delay: 5,
            fadetime: 2,
            idleTimer: null,
            zIndex: -2,
            spriteId: 0,
            init: function (x, y, settings) {
                this.parent(x, y, settings);
               
                this.offset = { x: 0, y: -15 };

                this.idleTimer = new ig.Timer();
                
                var atlas = ig.entitiesTextureAtlas;
                this.addTextureAtlasAnim(atlas, 'idle', 1, ['blood-puddle-' + this.spriteId + '.png'], false);
                this.currentAnim.flip.x = this.flip;

                ig.game.sortEntitiesDeferred();
 
            },
            update: function () {
                if (this.idleTimer.delta() > this.delay) {
                    this.kill();
                    return;
                }

                this.currentAnim.alpha = this.idleTimer.delta().map(
                    this.delay - this.fadetime, this.delay,
                    1, 0
                );

            }

        });
        
        EntityPointDisplay = ig.Entity.extend({
            animSheet: new ig.AnimationSheet('media/sprites/small-points.png', 28, 14),
            idleTimer: null,
            delay: 2,
            fadetime: 1,
            zIndex: 7,
            speed: .5,
            gravityFactor: 0,
            init: function (x, y, settings) {
                this.parent(x, y, settings);
                this.addAnim('idle', 1, [settings.value - 2]);
                this.idleTimer = new ig.Timer();
                ig.game.sortEntitiesDeferred();
            },
            update: function () {
                this.parent();

                this.vel.y -= this.speed;

                if (this.idleTimer.delta() > this.delay) {
                    this.kill();
                    return;
                }
                this.currentAnim.alpha = this.idleTimer.delta().map(
                    this.delay - this.fadetime, this.delay,
                    1, 0
                );
            }
        })

    })