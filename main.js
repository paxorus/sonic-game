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
const sonic = new Image(30, 40);
sonic.src = url;

const canvas = new Canvas('canvas');

const loci = [
	// [16, 41],// at rest
	[429, 106],
	[472, 105],
	[516, 104],
	[561, 104],
	[612, 106],
	[665, 106],
	[16, 170],
	[106, 169],
	[148, 168],
	[190, 168],
	[245, 170],
	[308, 172],
	[350, 171]//,
	// [398, 171]
];
let i = 0;

sonic.onload = () => {
	canvas.drawImage(sonic, [16, 41], [0, 0], 2);
}

function draw() {
	const locus = loci[i];
	canvas.clear();
	canvas.drawImage(sonic, locus, [0, 0], 2);
	document.getElementById('rando').textContent = i;	
}

document.addEventListener('keydown', (ev) => {
	switch (ev.keyCode) {
		case 37:// Left
			i = (i - 1 + loci.length) % loci.length;
			// console.log(i);
			draw();
			break;

		case 39:// Right
			i = (i + 1) % loci.length;
			draw();
	}
});