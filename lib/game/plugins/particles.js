/**
 *  @particles.js
 *  @version: 1.00
 *  @author: Jesse Freeman
 *  @date: May 2012
 *  @copyright (c) 2012 Jesse Freeman, under The MIT License (see LICENSE)
 *
 *  This entity is useful for spawning particles on an entity. The class
 *  comes with a few standard particles such as fire, water and snow.
 */
ig.module(
    'game.plugins.particles'
)
    .requires(
    'impact.entity',
    'bootstrap.entities.particle-emitter'
)
    .defines(function () {

        EntityBaseParticle.inject({
            size:{ x:10, y:10 },
            lifetime:3,
            fadetime:3,
            animSheet:new ig.AnimationSheet('media/sprites/particle-sprites.png', 10, 10),
        });

    });

