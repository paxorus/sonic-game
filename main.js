class Canvas {
	constructor(elementId) {
		const canvas = document.getElementById(elementId);
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

const loci = [
	// [16, 41],// at rest
	[429, 104, 0],// right heel up
	[472, 104, 5],// right foot up
	[516, 104, 6],// right foot curve
	[561, 104, 7],// right toe up
	[612, 104, 11],// right toe way up
	[665, 104, 14],// right heel down
	[16, 168, 34],// right foot down
	[64, 168, 43],// left foot down
	[106, 168, 46],// left foot up
	[148, 168, 46],// left foot curve
	[190, 168, 65],// left toe semi-up
	[245, 168, 69],// left heel down
	[308, 168, 109]// left foot down
];
let i = 0;
let position = 0;
const STEP_SIZE = 107;

sonic.onload = () => {
	const locus = loci[i];
	canvas.drawImage(sonic, locus, [locus[2] + position * STEP_SIZE, 0], 2);
}

function draw() {
	const locus = loci[i];
	canvas.clear();
	canvas.drawImage(sonic, locus, [locus[2] + position * STEP_SIZE, 0], 2);
	document.getElementById('rando').textContent = i;	
}

document.addEventListener('keydown', (ev) => {
	switch (ev.keyCode) {
		case 37:// Left
			if (i == 0) {
				i = loci.length - 1;
				position --;
			} else {
				i --;
			}
			// i = (i - 1 + loci.length) % loci.length;
			// console.log(i);
			draw();
			break;

		case 39:// Right
			if (i == loci.length - 1) {
				i = 0;
				position ++;
			} else {
				i ++;
			}
			draw();
	}
});