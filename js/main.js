const Engine = Matter.Engine,
    Render = Matter.Render,
    Common = Matter.Common,
    Composite = Matter.Composite,
    World = Matter.World,
    Body = Matter.Body,
    Bodies = Matter.Bodies,
    Runner = Matter.Runner,
    Events = Matter.Events,
    Vertices = Matter.Vertices,
    Composites = Matter.Composites;

Common.setDecomp(decomp);

const canvas = new Canvas('canvas');

// create an engine.
const engine = Engine.create();
const runner = Runner.create();

// Create all physical bodies.

// Platforms.
const platforms = [
	// Bodies.rectangle(200, 650, 100, 50, { isStatic: true }),
	// Bodies.rectangle(300, 600, 100, 50, { isStatic: true }),
	// Bodies.rectangle(400, 550, 100, 50, { isStatic: true }),
	// Bodies.rectangle(550, 600, 200, 50, { isStatic: true }),
	// Bodies.rectangle(650, 550, 200, 50, { isStatic: true }),
	// Bodies.rectangle(750, 500, 200, 50, { isStatic: true }),
	// Bodies.rectangle(850, 450, 200, 50, { isStatic: true }),
	// Bodies.rectangle(950, 400, 200, 50, { isStatic: true }),
	Bodies.rectangle(200, 600, 750, 50, { isStatic: true }),
	ramp(950, 450, 500),
	Bodies.rectangle(1225, 100, 300, 50, { isStatic: true }),
	ramp(1750, -50, 500)
];

// Sonic's box.
const sonic = new Sonic();

// Add all of the bodies to the world
const bodies = [sonic.body, ...platforms];
World.add(engine.world, bodies);

const cave = new Image(1000, 1000);
cave.src = 'images/back_cave_0.png';

(function render() {
    window.requestAnimationFrame(render);

    canvas.renderBackground(cave);
    canvas.renderObjects(bodies);
    canvas.renderSonic(sonic);
})();

Events.on(runner, 'beforeUpdate', function ({name, source, timestamp}) {
	// Don't let Sonic tip.
	Body.setAngularVelocity(sonic.body, 0);

	// Works better than friction.
	const {x, y} = sonic.body.velocity;
	if (Math.abs(x) < 0.1) {
		Body.setVelocity(sonic.body, {x: 0, y});
	}

	canvas.centerOnSonic();
});


// Events.on(runner, 'afterUpdate', function ({name, source, timestamp}) {
// 	// Sonic should stop running once his velocity is gone.
// 	// if (! sonic.isRunning() && sonic.walkFrame !== null) {
// 	// 	sonic.pause();
// 	// }
// });

// Sonic should stop rolling if he encounters an object horizontally.
Events.on(engine, 'collisionActive', function ({name, pairs, source}) {
	for (let pair of pairs) {
		if (pair.bodyA.id === sonic.body.id || pair.bodyB.id === sonic.body.id) {
			// This tells us whether Sonic collided vertically, a better way to tell whether he's on the ground.
			const normal = pair.collision.normal;
			if (normal.x == 1 && normal.y == 0) {
				sonic.endRoll();
			}
		}
	}
});

function ramp(x, y, radius) {

	let middle = [];
	const NUM_POINTS = 10;
	for (let boop = 0; boop <= NUM_POINTS; boop ++) {
		const theta = Math.PI / 2 * (1 - boop / NUM_POINTS);
		middle.push({x: Math.round(Math.cos(theta) * radius), y: Math.round(Math.sin(theta) * radius)});
	}

	const thing = `${middle.map(({x, y}) => `${x} ${y}`).join(" ")} ${radius} ${radius}`;

	return Bodies.fromVertices(x, y, Vertices.fromPath(thing), { isStatic: true });
}

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
	switch (ev.keyCode) {
		case 13:// Enter
			sonic.switchCharacter();
			break;
		case 32:// Space
			// Only jump if he's basically at rest.
			if (sonic.isOnGround()) {
				if (sonic.isCrouched()) {
					sonic.chargeUp();
				} else {
					sonic.jump();					
				}
			}
			break;
		case 37:// Left
			if (! sonic.isRunningLeft() && sonic.isOnGround()) {
				sonic.moveLeft();
			}
			break;
		case 39:// Right
			if (! sonic.isRunningRight() && sonic.isOnGround()) {
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
		case 37:// Left
			if (sonic.isRunningLeft()) {
				sonic.endWalking();
			}
			break;
		case 39:// Right
			if (sonic.isRunningRight()) {
				sonic.endWalking();
			}
			break;
		case 40:// Down
			if (sonic.isCharged()) {
				sonic.roll();
			} else {
				sonic.endCrouch();
			}
			break;
	}
});