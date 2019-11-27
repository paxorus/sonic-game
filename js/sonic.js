const INITIAL_LOCUS = [2, 0, 0];
const JUMPING_LOCUS = [12, 550, 0];
const FALLING_LOCUS = [485, 480, 0];
const FLIPPING_OFFSET = 20;// Sonic is left-aligned, not centered, in his sprite.

const SPRITE_WIDTH = 40;
const SPRITE_HEIGHT = 40;
const SPRITE_SCALE = 2;

const WALK_SPEED = 10;
const JUMP_SPEED = 10;

const BASE_ROLL_SPEED = 20;
const MAX_CHARGE_FACTOR = 3;// So max speed 60 = 20 * 3.

const JUMPING_LOCI = [
	[2, 211, 0],
	[44, 211, 0],
	[86, 211, 0],
	[128, 211, 0],
	[170, 211, 0],
	[212, 211, 0]
];

const RUNNING_LOCI = [
	[260, 104, 0]
// 	[429, 104, 0],// right heel up
// 	[472, 104, 10],// right foot up
// 	[516, 104, 1],// right foot curve
// 	[561, 104, 1],// right toe up
// 	[612, 104, 6],// right toe way up
// 	[665, 104, 3],// right heel down
// 	[16, 168, 20],// right foot down
// 	[64, 168, 21],// left foot down
// 	[106, 168, 3],// left foot up
// 	[148, 168, 0],// left foot curve
// 	[190, 168, 19],// left toe semi-up
// 	[245, 168, 4],// left heel down
// 	[308, 168, 30]// left foot down
];

const CROUCHING_LOCI = [
	[2, 84, 0],
	[44, 84, 0]
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
		numJumpFrames: 6
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
		this.locus = INITIAL_LOCUS;
		this.isFacingRight = true;
		this.walkFrame = 0;
		this.crouchFrame = null;
		this.chargeFactor = 0;
		this.characterId = 0;
		this.body = Bodies.rectangle(400, 200, SPRITE_SCALE * SPRITE_WIDTH, SPRITE_SCALE * SPRITE_HEIGHT);

		this.scale = SPRITE_SCALE;

		// Load Tikal.
		this.sprite = this.getSpriteSheet('images/curated/tikal-curated.png');
		this.numJumpFrames = 6;
		this.scale = 2.1;
		this.drawing = {
			'image': this.sprite,
			'locus': this.locus,
			'scale': this.scale
		};
		this.spriteSheetWidth = 372;

		this.reverseSprite = this.getSpriteSheet('images/flipped/tikal-flipped.png');
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
		Body.setVelocity(this.body, {x: WALK_SPEED, y: this.body.velocity.y});
		this.animateRight();
	}

	animateRight() {
		let frame = 1;
		this.isFacingRight = true;

		const _moveRight = () => {
			this.locus = INITIAL_LOCUS;//RUNNING_LOCI[frame];
			this.draw();
			frame = (frame + 1) % RUNNING_LOCI.length;
			this.walkFrame = requestAnimationFrame(_moveRight);
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
		let frame = 1;
		this.isFacingRight = false;

		const _moveLeft = () => {
			this.locus = INITIAL_LOCUS;//RUNNING_LOCI[frame];

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
	}

	roll() {
		this._isCrouched = false;
		const vx = BASE_ROLL_SPEED * this.chargeFactor * (this.isFacingRight ? 1 : -1);
		Body.setVelocity(this.body, {x: vx, y: this.body.velocity.y});
		// Begin rolling animation loop.
	}

	isCharged() {
		return this.chargeFactor > 0;
	}

	jump() {
		const vx = this.body.velocity.x;
		Body.setVelocity(this.body, {x: vx, y: -JUMP_SPEED});
		cancelAnimationFrame(this.walkFrame);
		this.walkFrame = null;
		let jumpingLocusIndex = 0;
		this.locus = JUMPING_LOCI[0];

		const _moveUp = () => {
			this.draw();

			if (this.isJumpingUp()) {
				jumpingLocusIndex = (jumpingLocusIndex + 1) % this.numJumpFrames;
				this.locus = JUMPING_LOCI[jumpingLocusIndex];
				requestAnimationFrame(_moveUp);
			} else {
				// Begin falling.
				this.locus = FALLING_LOCUS;
				this.draw();
				requestAnimationFrame(_moveDown);
			}
		};

		const _moveDown = () => {
			this.draw();
			if (this.isFallingDown()) {
				jumpingLocusIndex = (jumpingLocusIndex + 1) % this.numJumpFrames;
				this.locus = JUMPING_LOCI[jumpingLocusIndex];
				requestAnimationFrame(_moveDown);
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
		return this.crouchFrame !== null;
	}

	isCrouched() {
		return this._isCrouched;
	}
}
