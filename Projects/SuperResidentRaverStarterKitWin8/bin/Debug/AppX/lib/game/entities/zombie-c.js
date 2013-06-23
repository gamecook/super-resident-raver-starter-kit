/**
 *  @zombie-c.js
 *  @version: 1.00
 *  @author: Jesse Freeman
 *  @date: May 2013
 *  @copyright (c) 2013 Jesse Freeman, under The MIT License (see LICENSE)
 *  
 *  Part of the Super Resident Raver Starter Kit: 
 */
ig.module(
    'game.entities.zombie-c'
)
    .requires(
    'game.entities.zombie'
)
    .defines(function () {
        EntityZombieC = EntityZombie.extend({
            _wmIgnore: false,
            lookAhead: 10,
            maxVel: { x: 500, y: 500 },
            friction: { x: 750, y: 0 },
            speed: 100,
            health: 10,
            spriteId: 0,
            blastRadius: 50,
            safeZone: 150,
            inSafeZone: false,
            blastDamage: 3,
            currentOffset: null,
            init: function(x, y, settings) {
                this.parent(x, y, settings);
                this.size = { x: 30, y: 70 };
                this.offset = { x: 30, y: 5 };
            },
            setupAnimation: function (offset) {

                if (offset == this.currentOffset)
                    return;

                this.currentOffset = offset;
                
                var atlas = ig.entitiesTextureAtlas;

                this.spriteId = this.lastspriteId = offset;
                
                this.addTextureAtlasAnim(atlas, 'walk', .07, ['zombie-c-' + this.spriteId + '-00.png', 'zombie-c-' + this.spriteId + '-01.png', 'zombie-c-' + this.spriteId + '-02.png', 'zombie-c-' + this.spriteId + '-03.png', 'zombie-c-' + this.spriteId + '-04.png', 'zombie-c-' + this.spriteId + '-05.png'], false); // Add texture atlas animation

                this.currentAnim = this.anims.walk;
            },
            onUpdateAI: function () {
                var dist = this.distanceTo(ig.game.player);
                if (dist < this.safeZone && this.spriteId != 1)
                {
                    this.setupAnimation(1);
                } else if (dist > this.safeZone) {
                    this.setupAnimation(0);
                }
                
                if (dist < this.blastRadius && ig.game.player.visible) {
                    this.explode();
                }
                this.parent();
            },
            check: function (other) {
                if (other.visible)
                    this.explode();
            },
            explode: function() {
                this.outOfBounds();
                
                // Loop through entities and kill them if they are near
                var entity;
                var entities = ig.game.entities;
                for (var i = 0; i < entities.length; i++) {
                    entity = entities[i];
                    //TODO need to make this configurible and include the player
                    if (entity.type == ig.Entity.TYPE.B || entity.type == ig.Entity.TYPE.A) {
                        var distance = this.distanceTo(entity);
                        if (distance < this.safeZone)
                            entity.receiveDamage(this.blastDamage, this);
                    }
                }

                for (i = 0; i < 4; i++)
                    ig.game.spawnEntity(EntityDeathExplosionParticle, this.pos.x, this.pos.y, { colorOffset: 1 });

                ig.game.shake(1);
                
            }
        })
    })