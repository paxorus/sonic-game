const musicAudio = document.getElementById("music");
let autoStartedOnce = false;

document.addEventListener('keydown', (ev) => {
	if (!autoStartedOnce) {
		musicAudio.play();
		autoStartedOnce = true;
	}

	if ([37, 39, 40].includes(ev.keyCode)) {
		sonic.holdingKey = ev.keyCode;
	}

	switch (ev.keyCode) {
		case 13:// Enter
			sonic.switchCharacter();
			break;
		case 32:// Space
			// Only jump if he's basically at rest.
			if (sonic.isOnGround()) {
				if (sonic.isCrouched()) {
					sonic.chargeUp();
				} else {
					sonic.jump();
				}
			}
			break;
		case 37:// Left
			if (! sonic.isRunningLeft() && sonic.isOnGround()) {
				sonic.moveLeft();
			}
			break;
		case 39:// Right
			if (! sonic.isRunningRight() && sonic.isOnGround()) {
				sonic.moveRight();
			}
			break;
		case 40:// Down
			if (! sonic.isRunning() && sonic.isOnGround() && ! sonic.isCrouching() && ! sonic.isCrouched()) {
				sonic.crouch();
			}
			break;
		case 77:// M
			if (musicAudio.paused) {
				musicAudio.play();
			} else {
				musicAudio.pause();
			}
			break;
	}
});

document.addEventListener('keyup', (ev) => {
	if (sonic.holdingKey === ev.keyCode) {
		sonic.holdingKey = null;
	}

	switch (ev.keyCode) {
		case 37:// Left
			if (sonic.isRunningLeft()) {
				sonic.endWalking();
			}
			break;
		case 39:// Right
			if (sonic.isRunningRight()) {
				sonic.endWalking();
			}
			break;
		case 40:// Down
			if (sonic.isCharged() && sonic.isCrouched()) {
				sonic.roll();
			} else if (sonic.isCrouched()) {
				sonic.endCrouch();
			}
			break;
	}
});