const INITIAL_LOCUS = [16, 41, 0];
const JUMPING_LOCUS = [12, 550, 0];
const FALLING_LOCUS = [485, 480, 0];
const FLIPPING_OFFSET = 20;// Sonic is left-aligned, not centered, in his sprite.

const SPRITE_SHEET_WIDTH = 750;
const SPRITE_WIDTH = 40;
const SPRITE_HEIGHT = 50;

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

const CROUCHING_LOCI = [
	[13, 489, 0],
	[50, 489, 0],
	[91, 489, 0]
];

class Sonic {
	constructor() {
		this.locus = INITIAL_LOCUS;
		this.width = SPRITE_WIDTH;
		this.height = SPRITE_HEIGHT;
		this.scale = 2;
		this.isFacingRight = true;
		this.walkFrame = 0;
		this.crouchFrame = null;
		this.body = Bodies.rectangle(400, 200, 80, 80);

		this.sprite = this.getSpriteSheet('images/sonic_3_custom_sprites_by_facundogomez-dawphra.png');
		this.drawing = {
			'image': this.sprite,
			'locus': this.locus,
			'scale': this.scale
		};

		this.reverseSprite = this.getSpriteSheet('images/sonic_3_custom_sprites_by_facundogomez-dawphra-flipped.png');
	}

	getSpriteSheet(url) {
		const sprite = new Image(this.width, this.height);
		sprite.src = url;
		return sprite;
	}

	draw() {
		let locus = this.locus;

		if (! this.isFacingRight) {
			// Adjust the sprite locus for the reverse sprite sheet.
			locus = [
				SPRITE_SHEET_WIDTH - locus[0] - this.width,
				locus[1],
				- locus[2] - FLIPPING_OFFSET
			];
		}

		const spriteSheet = this.isFacingRight ? this.sprite : this.reverseSprite;
		this.drawing = {
			'image': spriteSheet,
			'locus': locus,
			'scale': this.scale
		};
	}

	moveRight() {
		Body.setVelocity(this.body, {x: 10, y: this.body.velocity.y});
		this.animateRight();
	}

	animateRight() {
		let frame = 1;
		this.isFacingRight = true;

		const _moveRight = () => {
			this.locus = RUNNING_LOCI[frame];
			// console.log('right');
			this.draw();
			frame = (frame + 1) % RUNNING_LOCI.length;
			this.walkFrame = requestAnimationFrame(_moveRight);
		};

		if (this.isOnGround()) {
			_moveRight();
		}
	}

	moveLeft() {
		Body.setVelocity(this.body, {x: -10, y: this.body.velocity.y});
		this.animateLeft();
	}

	animateLeft() {
		let frame = 1;
		this.isFacingRight = false;

		const _moveLeft = () => {
			// console.log('left');
			this.locus = RUNNING_LOCI[frame];

			this.draw();

			frame = (frame + 1) % RUNNING_LOCI.length;
			this.walkFrame = requestAnimationFrame(_moveLeft);
		};

		if (this.isOnGround()) {
			_moveLeft();
		}
	}

	crouch() {
		this.animateCrouch();
	}

	animateCrouch() {
		let frame = 0;

		const _crouchDown = () => {
			this.locus = CROUCHING_LOCI[frame];
			this.draw();
			frame ++;
			if (frame < CROUCHING_LOCI.length) {
				this.crouchFrame = requestAnimationFrame(_crouchDown, 1000);
			} else {
				this.crouchFrame = null;
				this.isCrouched = true;
			}
		}

		_crouchDown();
	}

	endCrouch() {
		// Cancel any ongoing crouch.
		cancelAnimationFrame(this.crouchFrame);
		this.crouchFrame = null;
		// End any past crouch.
		this.isCrouched = false;
		// Return to rest.
		this.locus = INITIAL_LOCUS;

		this.draw();
	}

	jump() {
		const vx = this.body.velocity.x;
		Body.setVelocity(this.body, {x: vx, y: -10});
		cancelAnimationFrame(this.walkFrame);
		this.walkFrame = null;
		this.locus = JUMPING_LOCUS;

		const _moveUp = () => {
			this.draw();

			if (this.isJumpingUp()) {
				requestAnimationFrame(_moveUp);
			} else {
				this.locus = FALLING_LOCUS;
				this.draw();
				requestAnimationFrame(_moveDown);
			}
		};

		const _moveDown = () => {
			this.draw();
			if (this.isFallingDown()) {
				requestAnimationFrame(_moveDown);
			} else {
				this.locus = INITIAL_LOCUS;
				this.draw();

				// If the user is in horizontal motion while landing, begin running animation.
				if (this.isRunningRight()) {
					this.animateRight();
				} else if (this.isRunningLeft()) {
					this.animateLeft();
				}
			}
		};

		_moveUp();
	}

	pause() {
		cancelAnimationFrame(this.walkFrame);
		this.walkFrame = null;
		Body.setVelocity(sonic.body, {x: 0, y: sonic.body.velocity.y});
		this.locus = INITIAL_LOCUS;
		this.draw();
	}

	isOnGround() {
		return Math.abs(this.body.velocity.y) < 0.3;
	}

	isRunning() {
		return Math.abs(this.body.velocity.x) > 0.5;
	}

	isRunningRight() {
		return this.body.velocity.x > 0.1;
	}

	isRunningLeft() {
		return this.body.velocity.x < -0.1;
	}

	isJumpingUp() {
		return this.body.velocity.y < -0.1;
	}

	isFallingDown() {
		return this.body.velocity.y > 0.1;
	}

	isCrouching() {
		return this.crouchFrame !== null || this.isCrouched;
	}
}
