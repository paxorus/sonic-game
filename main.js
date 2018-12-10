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
const JUMPING_LOCUS = [12, 550, 0];
const FALLING_LOCUS = [485, 480, 0];
const STEP_SIZE = 126;
const JUMP_HEIGHT = 200;
const JUMP_SPEED = 8;

const RUNNING_LOCI = [
	[429, 104, 0],// right heel up
	[472, 104, 10],// right foot up
	[516, 104, 1],// right foot curve
	[561, 104, 1],// right toe up
	[612, 104, 6],// right toe way up
	[665, 104, 3],// right heel down
	[16, 168, 20],// right foot down
	[64, 168, 21],// left foot down
	[106, 168, 3],// left foot up
	[148, 168, 0],// left foot curve
	[190, 168, 19],// left toe semi-up
	[245, 168, 4],// left heel down
	[308, 168, 30]// left foot down
];

class Sonic {
	constructor() {
		this.locus = INITIAL_LOCUS;
		this.x = 0;
		this.y = 0;
		this.vx = 0;
		this.vy = 0;
		this.width = 40;
		this.height = 50;
		this.scale = 2;
		this.isFacingRight = true;
		this.walkFrame = 0;

		this.sprite = this.getSpriteSheet('sonic_3_custom_sprites_by_facundogomez-dawphra.png');
		this.sprite.onload = () => {
			this.draw(INITIAL_LOCUS);
		};

		this.reverseSprite = this.getSpriteSheet('sonic_3_custom_sprites_by_facundogomez-dawphra-flipped.png');
	}

	getSpriteSheet(url) {
		const sprite = new Image(this.width, this.height);
		sprite.src = url;
		return sprite;
	}

	draw() {
		let locus = this.locus;
		if (! this.isFacingRight) {
			locus = [
				750 - locus[0] - this.width,// width of spritesheet
				locus[1],
				- locus[2] - 20 // flipping adjustment
			];
		}

		const sprite = this.isFacingRight ? this.sprite : this.reverseSprite;
		canvas.drawImage(sprite, locus, [this.x, this.y], this.scale);
	}

	moveRight() {
		let frame = 1;
		this.isFacingRight = true;
		this.vx = 1;

		const _moveRight = () => {
			console.log('go right!');
			this.locus = RUNNING_LOCI[frame];
			this.x += this.locus[2];

			canvas.clear();
			this.draw();

			frame = (frame + 1) % RUNNING_LOCI.length;
			this.walkFrame = requestAnimationFrame(_moveRight);
		};

		_moveRight();
	}

	moveLeft() {
		let frame = 1;
		this.isFacingRight = false;
		this.vx = -1;

		const _moveLeft = () => {
			this.locus = RUNNING_LOCI[frame];
			this.x -= this.locus[2];

			canvas.clear();
			this.draw();

			frame = (frame + 1) % RUNNING_LOCI.length;
			this.walkFrame = requestAnimationFrame(_moveLeft);
		};

		_moveLeft();
	}

	jump() {
		const _moveUp = () => {
			this.y += JUMP_SPEED;
			canvas.clear();
			this.draw();

			if (this.y < JUMP_HEIGHT - 1) {
				requestAnimationFrame(_moveUp);
			} else {
				this.locus = FALLING_LOCUS;
				canvas.clear();
				this.draw();
				requestAnimationFrame(_moveDown);
			}
		};

		const _moveDown = () => {
			this.y -= JUMP_SPEED;
			canvas.clear();
			this.draw();
			if (this.y > 0) {
				requestAnimationFrame(_moveDown);
			} else {
				this.locus = INITIAL_LOCUS;
				canvas.clear();
				this.draw();
			}
		};

		this.locus = JUMPING_LOCUS;
		_moveUp();
	}

	pause() {
		cancelAnimationFrame(this.walkFrame);
		this.walkFrame = null;
		this.vx = 0;
		this.locus = INITIAL_LOCUS;

		canvas.clear();
		this.draw();
	}

}

const canvas = new Canvas('canvas');
const sonic = new Sonic();


document.addEventListener('keydown', (ev) => {
	switch (ev.keyCode) {
		case 32:// Space
			sonic.jump();
			break;
		case 37:// Left
			if (sonic.vx === 0) {
				sonic.moveLeft();
			} else if (sonic.vx === 1) {
				// Interrupt right.
				sonic.pause();
				sonic.moveLeft();
			}
			break;
		case 39:// Right
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