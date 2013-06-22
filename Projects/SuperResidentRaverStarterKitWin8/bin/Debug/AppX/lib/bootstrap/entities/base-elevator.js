/**
 *  @door.js
 *  @version: 1.00
 *  @author: Jesse Freeman
 *  @date: May 2012
 *  @copyright (c) 2013 Jesse Freeman, under The MIT License (see LICENSE)
 *
 * Simple Mover that visits all its targets in an ordered fashion. You can use
 * the void entities (or any other) as targets.
 * 
 * 
 * Keys for Weltmeister:
 * 
 * speed
 * Traveling speed of the mover in pixels per second.
 * Default: 20
 * 
 * target.1, target.2 ... target.n
 * Names of the entities to visit.
 */

ig.module(
    'bootstrap.entities.base-elevator'
)
    .requires(
    'impact.entity',
    'bootstrap.entities.base-platform'

)
    .defines(function () {

        EntityBaseElevator = EntityBasePlatform.extend({
            _wmIgnore: true,
            type: ig.Entity.TYPE.NONE,
            collides: ig.Entity.COLLIDES.NONE,
            zIndex: -1,
            topOffset: 0,
            bottomOffset: 0,
            init: function (x, y, settings) {
                this.parent(x, y, settings);

                if (typeof wm == "undefined") {
                    this.topEntity = ig.game.spawnEntity("EntityElevatorPlatform", this.pos.x, this.pos.y + this.topOffset, { name: "top" });
                    this.bottomEntity = ig.game.spawnEntity("EntityElevatorPlatform", this.pos.x, this.pos.y + this.size.y + this.bottomOffset, { name: "bottom" });
                }
            },
            update: function () {
                this.parent();
                if (this.topEntity && this.bottomEntity) {
                    this.topEntity.vel.y = this.vel.y;
                    this.bottomEntity.vel.y = this.vel.y;
                }

            },
            onReachTarget: function () {
                this.parent();
                if (this.topEntity && this.bottomEntity) {
                    this.topEntity.pos.y = this.pos.y + this.topOffset;
                    this.bottomEntity.pos.y = this.pos.y + this.size.y + this.bottomOffset;
                }
            }
        });


        EntityElevatorPlatform = ig.Entity.extend({
            type: ig.Entity.TYPE.B,
            collides: ig.Entity.COLLIDES.FIXED,
            size: { x: 32, y: 8 },
            speed: 20,
            gravityFactor: 0,
            maxVel: { x: 100, y: 100 },
            debug: false,
            draw: function () {
                if (this.debug) {
                    this.parent();
                    var ctx = ig.system.context;
                    var s = ig.system.scale;
                    var x = this.pos.x * s - ig.game.screen.x * s;
                    var y = this.pos.y * s - ig.game.screen.y * s;
                    var sizeX = this.size.x * s;
                    var sizeY = this.size.y * s;
                    ctx.save();
                    ctx.fillStyle = "rgba(128, 28, 230, 0.7)";
                    ctx.fillRect(x, y, sizeX, sizeY);
                    //this.parent();
                    ctx.restore();
                }
            },
            receiveDamage: function (amount, from) {
                // Takes no damage
            }
        });
    });