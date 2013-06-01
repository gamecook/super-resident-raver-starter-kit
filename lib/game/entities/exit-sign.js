ig.module(
    'game.entities.exit-sign'
)
    .requires(
    'impact.sound'
)
    .defines(function () {
        EntityExitSign = ig.Entity.extend({
            _wmIgnore: false,
            gravityFactor: 0,
            zIndex: -1,
            size: { x: 80, y: 52 },
            init: function (x, y, settings) {
                this.parent(x, y, settings);

                var atlas = ig.entitiesTextureAtlas;

                this.addTextureAtlasAnim(atlas, 'idle', .5, ['exit-sign-on.png', 'exit-sign-off.png'], false);

                this.currentAnim = this.anims.idle;
            },
            trigger: function() {
                ig.game.exitLevel();
            }
        })
    })