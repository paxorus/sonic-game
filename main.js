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
		this.ctx.drawImage(
			image,
			sourceOffset[0], sourceOffset[1],
			image.width, image.height,
			destinationOffset[0], this.canvas.height - destinationOffset[1] - image.height * scale,
			image.width * scale, image.height * scale
		);
	}
}


const INITIAL_LOCUS = [16, 41, 0];
const STEP_SIZE = 126;
const JUMP_HEIGHT = 20;
const JUMP_SPEED = 6;

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

class Sonic {
	constructor() {
		this.locus = INITIAL_LOCUS;
		this.x = 0;
		this.y = 0;
		this.width = 40;
		this.height = 40;

		const url = 'sonic_3_custom_sprites_by_facundogomez-dawphra.png';
		const sprite = new Image(this.width, this.height);
		sprite.src = url;
		sprite.onload = () => {
			this.draw(INITIAL_LOCUS);
		}
		this.sprite = sprite;
	}

	draw() {
		canvas.clear();
		const pixelX = this.locus[2] + this.x * STEP_SIZE;
		const pixelY = this.y * JUMP_SPEED;
		canvas.drawImage(this.sprite, this.locus, [pixelX, pixelY], 2);
	}

	moveRight() {
		let frame = 1;

		const _moveRight = () => {
			this.locus = loci[frame];
			this.draw();
			if (frame + 1 < loci.length) {
				frame ++;
				requestAnimationFrame(_moveRight);
			} else {
				this.x ++;
			}
		};

		_moveRight();
	}

	jump() {
		const _moveUp = () => {
			this.y ++;
			this.draw();

			if (this.y < JUMP_HEIGHT - 1) {
				requestAnimationFrame(_moveUp);
			} else {
				requestAnimationFrame(_moveDown);
			}
		};

		const _moveDown = () => {
			this.y --;
			this.draw();
			if (this.y > 0) {
				requestAnimationFrame(_moveDown);
			}
		};

		_moveUp();
	}

}

const canvas = new Canvas('canvas');
const sonic = new Sonic();


document.addEventListener('keydown', (ev) => {
	switch (ev.keyCode) {
		case 32:// Space
			sonic.jump();
			break;
		// case 37: Reverse images for moving left.

		case 39:// Right
			sonic.moveRight();// Needs to be uninterruptible.
			// Should not come to rest if key still down.
	}
});
