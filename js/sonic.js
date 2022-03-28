const Query = Matter.Query;

const INITIAL_LOCUS = [3, 1, 0];
const FLIPPING_OFFSET = 20;// Sonic is left-aligned, not centered, in his sprite.

const SPRITE_WIDTH = 40;
const SPRITE_HEIGHT = 40;
const SPRITE_SCALE = 2;

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

const RUNNING_ANIMATION_INTERVAL = 50;// milliseconds
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
		numJumpFrames: 6,
		walkSpeed: 10,
		jumpSpeed: 15,
		baseRollSpeed: 1,
		maxChargeFactor: 1.5
	},
	{
		// Shadow
		sprite: 'images/curated/shadow-curated.png',
		reverseSprite: 'images/flipped/shadow-flipped.png',
		spriteSheetWidth: 379,
		scale: 2,
		numJumpFrames: 5,
		walkSpeed: 15,
		jumpSpeed: 10,
		baseRollSpeed: 1,
		maxChargeFactor: 1.5
	},
	{
		// Sonic
		sprite: 'images/curated/sonic-curated.png',
		reverseSprite: 'images/flipped/sonic-flipped.png',
		spriteSheetWidth: 363,
		scale: 2,
		numJumpFrames: 5,
		walkSpeed: 10,
		jumpSpeed: 10,
		baseRollSpeed: 1.5,
		maxChargeFactor: 2
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
		this.holdingKey = null;// Queued interaction while Sonic is busy jumping.

		this.locus = INITIAL_LOCUS;
		this.body = Bodies.rectangle(400, 200, SPRITE_SCALE * SPRITE_WIDTH, SPRITE_SCALE * SPRITE_HEIGHT);

		// Load Tikal.
		this.loadCharacter(this.characterId);
	}

	switchCharacter() {
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
		this.character = character;

		this.draw();
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
		this.stopRollingAnimation();
		this.stopRunningAnimation();
		let frame = 1;
		this.isFacingRight = true;

		const _moveRight = () => {
			Body.setVelocity(this.body, {x: this.character.walkSpeed, y: this.body.velocity.y});
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
		this.stopRollingAnimation();
		this.stopRunningAnimation();
		let frame = 1;
		this.isFacingRight = false;

		const _moveLeft = () => {
			Body.setVelocity(this.body, {x: -this.character.walkSpeed, y: this.body.velocity.y});
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

		this.stopRunningAnimation();
		this.locus = INITIAL_LOCUS;
		this.draw();
	}

	crouch() {
		this.stopRollingAnimation();
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
		if (this.chargeFactor === 0) {
			this.chargeFactor = 1;
		} else if (this.chargeFactor < this.character.maxChargeFactor) {
			this.chargeFactor += 0.25;
		}

		// Begin rolling animation loop.
		let frame = 0;

		const _roll = () => {
			if (!this._isCrouched && Math.abs(this.body.velocity.x) < 0.1 && Math.abs(this.body.velocity.y) < 0.1) {
				this.locus = INITIAL_LOCUS;
				this.draw();
				return;
			} else if (!this._isCrouched && Math.abs(this.body.velocity.x) < 0.3) {
				this.locus = JUMPING_LOCI[frame];
				frame = (frame + 1) % JUMPING_LOCI.length;
			} else {
				this.locus = ROLLING_LOCI[frame];
				frame = (frame + 1) % ROLLING_LOCI.length;
			}
			this.draw();

			// Is this already cancellable via a jump?
			this.rollFrame = setTimeout(_roll, ROLLING_ANIMATION_INTERVAL);
		};

		_roll();
	}

	roll() {
		this._isCrouched = false;
		const vx = this.character.baseRollSpeed * this.chargeFactor * (this.isFacingRight ? 1 : -1);
		Body.applyForce(this.body, this.body.position, {x: vx, y: 0});

		// Set velocity to avoid immediately ending the roll animation loop before the force kicks in.
		Body.setVelocity(this.body, {x: 0.1, y: 0});
	}

	endRoll() {
		this.stopRollingAnimation();

		this.locus = INITIAL_LOCUS;
		this.draw();
	}

	isCharged() {
		return this.chargeFactor > 0;
	}

	jump() {
		const vx = this.body.velocity.x;
		Body.setVelocity(this.body, {x: vx, y: -this.character.jumpSpeed});
		this.stopRollingAnimation();
		this.stopRunningAnimation();
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

				switch(this.holdingKey) {
					case 37:// Left
						this.moveLeft();
						break;
					case 39:// Right
						this.moveRight();
						break;
					case 40:// Down
						sonic.crouch();
						break;
				}
				this.holdingKey = null;
			}
		};

		_moveUp();
	}

	isOnGround() {
		const verticalCollisions = Query.collides(this.body, platforms)
			.filter(collision => Math.abs(collision.tangent.x) > 0.1);
		return verticalCollisions.length > 0;
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

	stopRunningAnimation() {
		clearTimeout(this.walkFrame);
		this.walkFrame = null;
	}

	stopRollingAnimation() {
		clearTimeout(this.rollFrame);
		this.rollFrame = null;
	}
}
