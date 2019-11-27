class Canvas {
	constructor(elementId) {
		const canvas = document.getElementById(elementId);
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d');

		canvas.width = document.body.clientWidth;
		canvas.height = document.body.clientHeight;
	}

	renderBackground(backgroundImage) {
		// Hard-code the background to cover at least my screen.
		const ch = this.canvas.height;
		this.ctx.drawImage(backgroundImage, 0, 0, 2000, 2000, 0, 0, ch, ch);
		this.ctx.drawImage(backgroundImage, 0, 0, 2000, 2000, ch, 0, ch, ch);
		this.ctx.drawImage(backgroundImage, 0, 0, 2000, 2000, 2 * ch, 0, ch, ch);
	}

	renderSonic() {
		const drawing = sonic.drawing;
		const position = sonic.body.position;
		// Align Sonic's drawing with his physical box approximation.
		const positionX = Math.round(position.x - 20 * SPRITE_SCALE);
		const positionY = Math.round(position.y + 20 * SPRITE_SCALE);
		this.drawImage(drawing.image, drawing.locus, [positionX, this.canvas.height - positionY], drawing.scale);
	}

	renderObjects(bodies) {
	    const context = canvas.ctx;
	    context.beginPath();

	    for (let body of bodies) {
	        var vertices = body.vertices;

	        context.moveTo(vertices[0].x, vertices[0].y);

	        for (var j = 1; j < vertices.length; j += 1) {
	            context.lineTo(vertices[j].x, vertices[j].y);
	        }

	        context.lineTo(vertices[0].x, vertices[0].y);
	    }

	    context.lineWidth = 1;
	    context.strokeStyle = '#999'; // grey
	    context.stroke();
	}

	drawImage(image, sourceOffset, destinationOffset, scale) {
		// Disable imageSmoothingEnabled to remove that weird purple border.
		this.ctx.imageSmoothingEnabled = false;
		this.ctx.drawImage(
			image,
			sourceOffset[0], sourceOffset[1],
			image.width, image.height,
			destinationOffset[0], this.canvas.height - destinationOffset[1] - image.height * scale,
			image.width * scale, image.height * scale
		);
	}
}
