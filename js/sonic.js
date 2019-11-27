const INITIAL_LOCUS = [3, 1, 0];
// const FALLING_LOCUS = [485, 480, 0];
const FLIPPING_OFFSET = 20;// Sonic is left-aligned, not centered, in his sprite.

const SPRITE_WIDTH = 40;
const SPRITE_HEIGHT = 40;
const SPRITE_SCALE = 2;

const WALK_SPEED = 10;
const JUMP_SPEED = 10;

const BASE_ROLL_SPEED = 20;
const MAX_CHARGE_FACTOR = 3;// So max speed 60 = 20 * 3.

const JUMPING_ANIMATION_INTERVAL = 25;// milliseconds
const JUMPING_LOCI = [
	[3, 211, 0],
	[45, 211, 0],
	[87, 211, 0],
	[129, 211, 0],
	[171, 211, 0],
	[213, 211, 0]
];

const ROLLING_ANIMATION_INTERVAL = 25;// milliseconds
const ROLLING_LOCI = [
	[3, 253, 0],
	[45, 253, 0],
	[87, 253, 0],
	[129, 253, 0],
	[171, 253, 0],
	[213, 253, 0],
];

const RUNNING_ANIMATION_INTERVAL = 100;// milliseconds
const RUNNING_LOCI = [
	[3, 43, 0],
	[45, 43, 0],
	[87, 43, 0],
	[129, 43, 0],
	[171, 43, 0],
	[213, 43, 0],
	[255, 43, 0],
	[297, 43, 0]
];

const CROUCHING_LOCI = [
	[3, 85, 0],
	[45, 85, 0]
];

const CHARACTERS = [
	{
		// Tikal
		sprite: 'images/curated/tikal-curated.png',
		reverseSprite: 'images/flipped/tikal-flipped.png',
		spriteSheetWidth: 372,
		scale: 2.1,// Do we still need this?
		numJumpFrames: 6
	},
	{
		// Shadow
		sprite: 'images/curated/shadow-curated.png',
		reverseSprite: 'images/flipped/shadow-flipped.png',
		spriteSheetWidth: 379,
		scale: 2,
		numJumpFrames: 5
	},
	{
		// Sonic
		sprite: 'images/curated/sonic-curated.png',
		reverseSprite: 'images/flipped/sonic-flipped.png',
		spriteSheetWidth: 363,
		scale: 2,
		numJumpFrames: 5
	}
]

class Sonic {
	constructor() {
		this.chargeFactor = 0;
		this.characterId = 0;
		this.isFacingRight = true;

		this.walkFrame = null;
		this.crouchFrame = null;
		this.rollFrame = null;

		this.locus = INITIAL_LOCUS;
		this.body = Bodies.rectangle(400, 200, SPRITE_SCALE * SPRITE_WIDTH, SPRITE_SCALE * SPRITE_HEIGHT);

		// Load Tikal.
		this.loadCharacter(this.characterId);
	}

	switch() {
		this.characterId = (this.characterId + 1) % CHARACTERS.length;
		this.loadCharacter(this.characterId);
	}

	loadCharacter(characterId) {
		const character = CHARACTERS[characterId];

		this.sprite = this.getSpriteSheet(character.sprite);
		this.reverseSprite = this.getSpriteSheet(character.reverseSprite);
		this.spriteSheetWidth = character.spriteSheetWidth;
		this.scale = character.scale;
		this.numJumpFrames = character.numJumpFrames;

		this.drawing = {
			'image': this.sprite,
			'locus': this.locus,
			'scale': this.scale
		};		
	}

	getSpriteSheet(url) {
		const sprite = new Image(SPRITE_WIDTH, SPRITE_HEIGHT);
		sprite.src = url;
		return sprite;
	}

	draw() {
		let locus = this.locus;

		if (! this.isFacingRight) {
			// Adjust the sprite locus for the reverse sprite sheet.
			locus = [
				this.spriteSheetWidth - locus[0] - SPRITE_WIDTH,
				locus[1],
				1000
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
		Body.setVelocity(this.body, {x: WALK_SPEED, y: this.body.velocity.y});
		this.animateRight();
	}

	animateRight() {
		clearTimeout(this.rollFrame);
		let frame = 1;
		this.isFacingRight = true;

		const _moveRight = () => {
			this.locus = RUNNING_LOCI[frame];
			this.draw();
			frame = (frame + 1) % RUNNING_LOCI.length;
			this.walkFrame = setTimeout(_moveRight, RUNNING_ANIMATION_INTERVAL);
		};

		if (this.isOnGround()) {
			_moveRight();
		}
	}

	moveLeft() {
		Body.setVelocity(this.body, {x: -WALK_SPEED, y: this.body.velocity.y});
		this.animateLeft();
	}

	animateLeft() {
		clearTimeout(this.rollFrame);
		let frame = 1;
		this.isFacingRight = false;

		const _moveLeft = () => {
			this.locus = RUNNING_LOCI[frame];
			this.draw();
			frame = (frame + 1) % RUNNING_LOCI.length;
			this.walkFrame = setTimeout(_moveLeft, RUNNING_ANIMATION_INTERVAL);
		};

		if (this.isOnGround()) {
			_moveLeft();
		}
	}

	endWalking() {
		Body.setVelocity(this.body, {x: 0, y: this.body.velocity.y});
		
		if (this.walkFrame !== null) {
			clearTimeout(this.walkFrame);
			this.walkFrame = null;

			this.locus = INITIAL_LOCUS;
			this.draw();
		}
	}

	crouch() {
		this.animateCrouch();
	}

	animateCrouch() {
		clearTimeout(this.rollFrame);
		this.chargeFactor = 0;

		let frame = 0;

		const _crouchDown = () => {
			this.locus = CROUCHING_LOCI[frame];
			this.draw();
			frame ++;
			if (frame < CROUCHING_LOCI.length) {
				this.crouchFrame = requestAnimationFrame(_crouchDown, 1000);
			} else {
				this.crouchFrame = null;
				this._isCrouched = true;
			}
		}

		_crouchDown();
	}

	endCrouch() {
		// Cancel any ongoing crouch.
		cancelAnimationFrame(this.crouchFrame);
		this.crouchFrame = null;
		// End any past crouch.
		this._isCrouched = false;
		// Return to rest.
		this.locus = INITIAL_LOCUS;

		this.chargeFactor = 0;
		this.draw();
	}

	chargeUp() {
		this.chargeFactor = Math.min(this.chargeFactor + 1, MAX_CHARGE_FACTOR);

		// Begin rolling animation loop.
		let frame = 0;

		const _roll = () => {
			this.locus = ROLLING_LOCI[frame];
			this.draw();
			frame = (frame + 1) % ROLLING_LOCI.length;
			// Is this already cancellable via a jump?
			this.rollFrame = setTimeout(_roll, ROLLING_ANIMATION_INTERVAL);
		};

		_roll();
	}

	roll() {
		this._isCrouched = false;
		const vx = BASE_ROLL_SPEED * this.chargeFactor * (this.isFacingRight ? 1 : -1);
		Body.setVelocity(this.body, {x: vx, y: this.body.velocity.y});
	}

	isCharged() {
		return this.chargeFactor > 0;
	}

	jump() {
		const vx = this.body.velocity.x;
		Body.setVelocity(this.body, {x: vx, y: -JUMP_SPEED});
		clearTimeout(this.walkFrame);
		this.walkFrame = null;
		clearTimeout(this.rollFrame);
		let jumpingLocusIndex = 0;

		const _moveUp = () => {
			this.locus = JUMPING_LOCI[0];
			this.draw();

			if (this.isJumpingUp()) {
				jumpingLocusIndex = (jumpingLocusIndex + 1) % this.numJumpFrames;
				this.locus = JUMPING_LOCI[jumpingLocusIndex];
				this.draw();
				setTimeout(_moveUp, JUMPING_ANIMATION_INTERVAL);
			} else {
				// Begin falling.
				setTimeout(_moveDown, JUMPING_ANIMATION_INTERVAL);
			}
		};

		const _moveDown = () => {
			if (this.isFallingDown()) {
				jumpingLocusIndex = (jumpingLocusIndex + 1) % this.numJumpFrames;
				this.locus = JUMPING_LOCI[jumpingLocusIndex];
				this.draw();
				setTimeout(_moveDown, JUMPING_ANIMATION_INTERVAL);
			} else {
				// End falling.
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
		clearTimeout(this.walkFrame);
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
		return this.walkFrame !== null && this.isFacingRight;
	}

	isRunningLeft() {
		return this.walkFrame !== null && ! this.isFacingRight;
	}

	isJumpingUp() {
		return this.body.velocity.y < -0.1;
	}

	isFallingDown() {
		return this.body.velocity.y > 0.1;
	}

	isCrouching() {
		return this.crouchFrame !== null;
	}

	isCrouched() {
		return this._isCrouched;
	}
}
