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