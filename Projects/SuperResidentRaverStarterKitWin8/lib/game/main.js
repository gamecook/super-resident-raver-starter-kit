/**
 *  @main.js
 *  @version: 1.00
 *  @author: Jesse Freeman
 *  @date: May 2013
 *  @copyright (c) 2013 Jesse Freeman, under The MIT License (see LICENSE)
 *  
 *  Part of the Super Resident Raver Starter Kit: 
 */
ig.module(
    'game.main'
)
    .requires(
    'bootstrap.plugins.hit-area',
    'impact.game',
    'bootstrap.platforms.win8',
    'game.packed-textures',
    'plugins.tween-lite',
    'impact.font',
    'game.screens.start-screen',
    'bootstrap.entities.particle-emitter'/*,
    'impact.debug.debug'*/
     
)
    .defines(function () {

        ig.System.inject({
            setGameNow: function (gameClass, startLevel) {
                ig.game = new (gameClass)(startLevel);
                ig.system.setDelegate(ig.game);
            },
        });

        // Inject logic into core Bootstrap classes for this game
        EntityBaseParticle.inject({
            size: { x: 10, y: 10 },
            lifetime: 3,
            fadetime: 3,
            animSheet: new ig.AnimationSheet('media/sprites/particle-sprites.png', 10, 10),
        });
        
        EntityDeathExplosion.inject({
            particles: 3
        })

        EntityBloodParticle.inject({
            baseVelocity: { x: 5, y: -50 },
            vel: { x: 50, y: 350 },
            gravityFactor: .5,
            animSheet: new ig.AnimationSheet('media/sprites/particle-sprites.png', 10, 10),
            bounciness: .5,
            setupAnimation: function () {
                this.size = { x: 2, y: 2 };
                var frameID = Math.round(Math.random() * this.totalColors) + (this.colorOffset * (this.totalColors + 1));
                this.addAnim('idle', 0.2, [frameID]);
            }
        })

        EntityDeathExplosionParticle.inject({
            baseVelocity: { x: 5, y: -50 },
            vel: { x: 50, y: 350 },
            gravityFactor: .5,
            animSheet: new ig.AnimationSheet('media/sprites/particle-sprites.png', 10, 10),
            bounciness: .5,
            types: 8,
            delay: 3,
            fadetime: 2,
            friction: { x: 300, y: 0 },
            setupVelocity: function () {
                this.baseVelocity = { x: ig.utils.randomRange(-10, 10), y: ig.utils.randomRange(-30, -100) };

                this.vel.x = (Math.random() * this.baseVelocity.x - 1) * this.vel.x;
                this.vel.y = (Math.random() * this.baseVelocity.y - 1) * this.vel.y;
            },
            setupAnimation: function () {
                this.size = { x: 35, y: 35 };
                this.offset = { x: 0, y: -15 };

                var atlas = ig.entitiesTextureAtlas;

                this.spriteId = ig.utils.randomRange(0, this.types - 1);

                this.addTextureAtlasAnim(atlas, 'idle', 1, ['body-part-' + this.spriteId + '.png'], false);

            }
        })

        // Main game initalization
        ig.startNewGame = function (width, height, preloader) {

            

            if (ig.ua.mobile) {
                // Disable sound for all mobile devices
                ig.Sound.enabled = false;
            }

            ig.main('#canvas', StartScreen, 60, width, height, 1);

            if (window.resizeGame)
                window.resizeGame();

        };

        if (typeof (WinJS) == 'undefined') {
            ig.startNewGame(800, 480);
        }

    });