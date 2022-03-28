document.addEventListener('keydown', (ev) => {
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
	}
});

document.addEventListener('keyup', (ev) => {
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
			if (sonic.isCharged()) {
				sonic.roll();
			} else {
				sonic.endCrouch();
			}
			break;
	}
});