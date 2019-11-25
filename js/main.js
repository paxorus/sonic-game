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
	Bodies.rectangle(550, 600, 200, 50, { isStatic: true })
];

// Sonic's box.
const sonic = new Sonic();

// add all of the bodies to the world
const bodies = [boxA, boxB, sonic.body, ...platforms];


World.add(engine.world, bodies);

const cave = new Image(1000, 1000);
cave.src = 'images/back_cave_0.png';


(function render() {
    var bodies = Composite.allBodies(engine.world);
    // var bodies = [boxA, boxB, ...platforms];

    window.requestAnimationFrame(render);

    canvas.renderBackground(cave);
    canvas.renderObjects(bodies);
    canvas.renderSonic(sonic);
})();

Events.on(runner, 'beforeUpdate', function ({name, source, timestamp}) {
	Body.setAngle(sonic.body, 0);
	// Why does some weird sliding still occur?
	// Body.setAngularVelocity(sonic.body, 0);
});

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
	switch (ev.keyCode) {
		case 32:// Space
			// Only jump if he's basically at rest.
			if (Math.abs(sonic.body.velocity.y) < 1) {
				sonic.jump();
			}
			break;
		case 37:// Left
			if (sonic.vy !== 0) {
				sonic.vx = -1;// This takes effect upon landing.
				break;
			}
			if (sonic.vx === 0) {
				sonic.moveLeft();
			} else if (sonic.vx === 1) {
				sonic.pause();
				sonic.moveLeft();
			}
			break;
		case 39:// Right
			if (sonic.vy !== 0) {
				sonic.vx = 1;
				break;
			}
			if (sonic.vx === 0) {
				sonic.moveRight();
			} else if (sonic.vx === -1) {
				sonic.pause();
				sonic.moveRight();
			}
	}
});

document.addEventListener('keyup', (ev) => {
	switch (ev.keyCode) {
		case 37:// Left
			if (sonic.vx === -1) {
				sonic.pause();
			}
			break;
		case 39:// Right
			if (sonic.vx === 1) {
				sonic.pause();
			}
			break;
	}
});