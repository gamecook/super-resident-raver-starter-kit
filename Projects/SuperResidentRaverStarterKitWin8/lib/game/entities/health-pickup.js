/**
 *  @weapon-pickup.js
 *  @version: 1.00
 *  @author: Jesse Freeman
 *  @date: May 2013
 *  @copyright (c) 2013 Jesse Freeman, under The MIT License (see LICENSE)
 *  
 *  Part of the Super Resident Raver Starter Kit: 
 */
ig.module(
    'game.entities.health-pickup'
)
    .requires(
    'bootstrap.entities.base-item',
    'game.entities.player'
)
    .defines(function () {

        EntityHealthPickup = EntityBaseItem.extend({
            _wmIgnore: false,
            powerUpProperty: "health",
            restore: .5,
            init: function(x, y, settings) {
                this.parent(x, y, settings);

                this.size = { x: 50, y: 45 };
                this.offset = { x: 0, y: -10 };
                
                var atlas = ig.entitiesTextureAtlas;
                this.addTextureAtlasAnim(atlas, 'idle', 1, ['power-up-health.png'], false);
            },
            onPickup: function (target) {

                if (target instanceof EntityPlayer && target.visible) {
                    target.health += target.healthMax * this.restore;
                    if (target.health > target.healthMax) target.health = target.healthMax;
                    this.kill();
                }
            },
        });
    })