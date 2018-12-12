const canvas = new Canvas('canvas');
const sonic = new Sonic();

const cave = new Image(1000, 1000);
cave.src = 'back_cave_0.png';

class Platform {
	constructor(x, y, width, height) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.fillStyle = '#777';
	}
}

const elements = [
	sonic,
	new Platform(100, 20, 300, 50),
	new Platform(500, 150, 200, 50),
	new Platform(800, 300, 500, 50)
];

// Physics animation loop.
function physics() {
	if (sonic) {
		// sonic.y -= 10;
		canvas.render();
		sonic.draw();
	}
	requestAnimationFrame(physics);
}

// sonic.vy = -1;// Let him fall.
// physics();

const renderPromise = new Promise((resolve, reject) => {
	cave.onload = () => {
		resolve();
	};
}).then(new Promise((resolve, reject) => {
	sonic.sprite.onload = () => {
		resolve();
	};
})).then(() => {
	physics();
});


document.addEventListener('keydown', (ev) => {
	switch (ev.keyCode) {
		case 32:// Space
			if (sonic.vy === 0) {
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
		case 37:
			if (sonic.vx === -1) {
				sonic.pause();
			}
			break;
		case 39:
			if (sonic.vx === 1) {
				sonic.pause();
			}
			break;
	}
});