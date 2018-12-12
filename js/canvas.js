class Canvas {
	constructor(elementId) {
		const canvas = document.getElementById(elementId);
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;

		this.canvas = canvas;
		this.ctx = canvas.getContext('2d');
	}

	render() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		// Hard-code the background to cover at least my screen.
		const ch = this.canvas.height;
		this.ctx.drawImage(cave, 0, 0, 2000, 2000, 0, 0, ch, ch);
		this.ctx.drawImage(cave, 0, 0, 2000, 2000, ch, 0, ch, ch);
		this.ctx.drawImage(cave, 0, 0, 2000, 2000, 2 * ch, 0, ch, ch);

		for (let element of elements) {
			if (element instanceof Sonic) {
				const drawing = element.drawing;
				this.drawImage(drawing.image, drawing.locus, drawing.position, drawing.scale);
			} else if (element instanceof Platform) {
				this.ctx.fillStyle = element.fillStyle;
				this.ctx.fillRect(element.x, this.canvas.height - element.y - element.height, element.width, element.height);
			}
		}
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
