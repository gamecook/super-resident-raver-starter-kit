/**
 *  @base-advanced-door.js
 *  @version: 1.00
 *  @author: Jesse Freeman
 *  @date: May 2012
 *  @copyright (c) 2013 Jesse Freeman, under The MIT License (see LICENSE)
 *
 */
ig.module(
    'bootstrap.entities.base-advanced-door'
)
    .requires(
    'impact.entity'
)
     .defines(function () {

         EntityBaseAdvancedDoor = ig.Entity.extend({
             _wmIgnore: true,
             checkAgainst: ig.Entity.TYPE.A,
             zIndex: -1,
             locked: false,
             isClosing: false,
             isOpening: false,

             init: function (x, y, settings) {
                 this.parent(x, y, settings);
                 this.activate(this.locked);
             },
             check: function (other) {
                 if (this.locked || this.isClosing || this.isOpening)
                     return;

                 if (other.atDoor && (other.pos.x > (this.pos.x))) {
                     this.entityCanOpenDoor(other);
                 }
             },
             entityCanOpenDoor: function (other) {
                 other.atDoor(this);
             },
             receiveDamage: function (value) {
                 // Do nothing
             },
             open: function (target) {
                 this.isOpening = true;
                 this.target = target;
             },
             onOpen: function () {
                 this.isOpening = false;
             },
             close: function () {
                 this.isClosing = true;
                 this.target = null;
             },
             onClose: function () {
                 this.isClosing = false;
             },
             activate: function (value) {
                 this.locked = value;
             }
         });
    })