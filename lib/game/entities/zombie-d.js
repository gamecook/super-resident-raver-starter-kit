/**
 *  @zombie-d.js
 *  @version: 1.00
 *  @author: Jesse Freeman
 *  @date: May 2012
 *  @copyright (c) 2013 Jesse Freeman, under The MIT License (see LICENSE)
 *  
 *  Part of the Super Resident Raver Starter Kit: 
 */
ig.module(
    'game.entities.zombie-d'
)
    .requires(
    'game.entities.zombie'
)
    .defines(function () {
        EntityZombieD = EntityZombie.extend({
            _wmIgnore: false,
            lookAhead: 10,
            maxVel: { x: 500, y: 500 },
            friction: { x: 750, y: 0 },
            speed: 30,
            health: 50,
            spriteId: 0,
            types: 1,
            setupAnimation: function (offset) {

                var atlas = ig.entitiesTextureAtlas;

                this.size = { x: 30, y: 70 };
                this.offset = { x: 30, y: 5 };

                this.spriteId = this.lastspriteId = offset;
                
                this.addTextureAtlasAnim(atlas, 'walk', .2, ['zombie-d-' + this.spriteId + '-00.png', 'zombie-d-' + this.spriteId + '-01.png', 'zombie-d-' + this.spriteId + '-02.png', 'zombie-d-' + this.spriteId + '-03.png', 'zombie-d-' + this.spriteId + '-04.png', 'zombie-d-' + this.spriteId + '-05.png', 'zombie-d-' + this.spriteId + '-06.png'], false); // Add texture atlas animation

                this.currentAnim = this.anims.walk;
            }
        })
    })