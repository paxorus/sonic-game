class Canvas {
	constructor(elementId) {
		const canvas = document.getElementById(elementId);
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;

		this.canvas = canvas;
		this.ctx = canvas.getContext('2d');
	}

	clear() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);		
	}

	drawImage(image, sourceOffset, destinationOffset, scale) {
		this.ctx.drawImage(image,
			sourceOffset[0], sourceOffset[1], image.width, image.height,
			destinationOffset[0], destinationOffset[1], image.width * scale, image.height * scale
		);
	}
}
const url = 'sonic_3_custom_sprites_by_facundogomez-dawphra.png';
const sonic = new Image(40, 40);
sonic.src = url;

const canvas = new Canvas('canvas');

const INITIAL_POSITION = [16, 41, 0];

const loci = [
	[429, 104, 0],// right heel up
	[472, 104, 10],// right foot up
	[516, 104, 11],// right foot curve
	[561, 104, 12],// right toe up
	[612, 104, 18],// right toe way up
	[665, 104, 21],// right heel down
	[16, 168, 41],// right foot down
	[64, 168, 62],// left foot down
	[106, 168, 65],// left foot up
	[148, 168, 65],// left foot curve
	[190, 168, 84],// left toe semi-up
	[245, 168, 88],// left heel down
	[308, 168, 128],// left foot down
	[16, 41, 126]// at rest
];
// let i = 0;
let position = 0;
const STEP_SIZE = 126;

sonic.onload = () => {
	const locus = INITIAL_POSITION;
	// canvas.drawImage(sonic, locus, [locus[2] + position * STEP_SIZE, 0], 2);
	draw(locus);
}

function draw(locus) {
	canvas.clear();
	canvas.drawImage(sonic, locus, [locus[2] + position * STEP_SIZE, 0], 2);
}

function moveRight() {
	let frame = 1;

	function _moveRight() {
		draw(loci[frame]);
		if (frame + 1 < loci.length) {
			frame ++;
			requestAnimationFrame(_moveRight);
		} else {
			position ++;
		}
	}

	_moveRight();
}

document.addEventListener('keydown', (ev) => {
	switch (ev.keyCode) {
		// case 37: Reverse images for moving left.

		case 39:// Right
			moveRight();// Needs to be uninterruptible.
			// Should not come to rest if key still down.
	}
});
