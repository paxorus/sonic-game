var Engine = Matter.Engine,
    Render = Matter.Render,
    Composite = Matter.Composite,
    World = Matter.World,
    Body = Matter.Body,
    Bodies = Matter.Bodies,
    Runner = Matter.Runner,
    Events = Matter.Events;


const canvas = new Canvas('canvas');

// create an engine.
const engine = Engine.create();
const runner = Runner.create();

// Create all physical bodies.
// Falling boxes.
const boxA = Bodies.rectangle(400, 200, 80, 80);
const boxB = Bodies.rectangle(450, 50, 80, 80);

// Platforms.
const platforms = [
	Bodies.rectangle(200, 650, 100, 50, { isStatic: true }),
	Bodies.rectangle(300, 600, 100, 50, { isStatic: true }),
	Bodies.rectangle(400, 550, 100, 50, { isStatic: true }),
	Bodies.rectangle(550, 600, 200, 50, { isStatic: true }),
	Bodies.rectangle(650, 550, 200, 50, { isStatic: true }),
	Bodies.rectangle(750, 500, 200, 50, { isStatic: true }),
	Bodies.rectangle(850, 450, 200, 50, { isStatic: true }),
	Bodies.rectangle(950, 400, 200, 50, { isStatic: true }),
];

// Sonic's box.
const sonic = new Sonic();

// add all of the bodies to the world
const bodies = [boxA, boxB, sonic.body, ...platforms];


World.add(engine.world, bodies);

const cave = new Image(1000, 1000);
cave.src = 'images/back_cave_0.png';


(function render() {
    // var bodies = Composite.allBodies(engine.world);
    var bodies = [boxA, boxB, ...platforms];

    window.requestAnimationFrame(render);

    canvas.renderBackground(cave);
    canvas.renderObjects(bodies);
    canvas.renderSonic(sonic);

    // Moving platforms.
    // canvas.
})();

Events.on(runner, 'beforeUpdate', function ({name, source, timestamp}) {
	// Don't let Sonic tip.
	Body.setAngle(sonic.body, 0);
	// Why does some weird sliding still occur? Perhaps I need to increase the friction.
	// Body.setAngularVelocity(sonic.body, 0);
});


Events.on(runner, 'afterUpdate', function ({name, source, timestamp}) {
	// Sonic should stop running once his velocity is gone.
	if (! sonic.isRunning() && sonic.walkFrame !== null) {
		sonic.pause();
	}
});

// Events.on(engine, 'collisionActive', function ({name, pairs, source}) {
// 	for (let pair of pairs) {
// 		if (pair.bodyA.id === sonic.body.id || pair.bodyB.id === sonic.body.id) {
// 			// This tells us whether Sonic collided vertically.
// 			// console.log(pair.collision.axisBody.angle);
// 		}
// 	}
// });

// class Platform {
// 	constructor(x, y, width, height) {
// 		this.x = x;
// 		this.y = y;
// 		this.width = width;
// 		this.height = height;
// 		this.fillStyle = '#777';
// 	}
// }

const renderPromise = new Promise((resolve, reject) => {
	cave.onload = () => {
		resolve();
	};
}).then(new Promise((resolve, reject) => {
	sonic.sprite.onload = () => {
		resolve();
	};
})).then(() => {
	// Let there be physics!
	Runner.run(runner, engine);
});


document.addEventListener('keydown', (ev) => {
	// console.log(ev.keyCode);
	switch (ev.keyCode) {
		case 13:// Enter
			sonic.switch();
			break;
		case 32:// Space
			// Only jump if he's basically at rest.
			if (sonic.isOnGround()) {
				if (sonic.isCrouched()) {
					console.log('charge up');
					sonic.chargeUp();
				} else {
					sonic.jump();					
				}
			}
			break;
		case 37:// Left
			if (! sonic.isRunningLeft()) {
				sonic.moveLeft();
			}
			break;
		case 39:// Right
			if (! sonic.isRunningRight()) {
				sonic.moveRight();
			}
			break;
		case 40:// Down
			if (! sonic.isRunning() && sonic.isOnGround() && ! sonic.isCrouching() && ! sonic.isCrouched()) {
				sonic.crouch();
			}
			break;
	}
});

document.addEventListener('keyup', (ev) => {
	switch (ev.keyCode) {
		case 40:// Down
			if (sonic.isCharged()) {
				sonic.roll();
			} else {
				sonic.endCrouch();
			}
			break;
	}
});