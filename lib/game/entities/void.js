/**
 *  @void.js
 *  @version: 1.00
 *  @author: Jesse Freeman
 *  @date: May 2012
 *  @copyright (c) 2013 Jesse Freeman, under The MIT License (see LICENSE)
 *
 * This entity does nothing but just sits there. It can be used as a target
 * for other entities, such as movers.
 */

ig.module(
    'game.entities.void'
)
    .requires(
    'impact.entity'
)
    .defines(function () {

        EntityVoid = ig.Entity.extend({
            _wmDrawBox:true,
            _wmBoxColor:'rgba(128, 28, 230, 0.7)',
            _wmScalable:true,
            size:{x:80, y:80},
            update: function () {
                //Do nothing
            },
            draw: function () {
                //Do nothing
            }
        });

    });