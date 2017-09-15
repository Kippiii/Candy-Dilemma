Player = function() {
	self = {}
	self.ready = false
	return self
}

Candy = function(img, location) {
	self = {}
	self.image = new Image()
	self.image.src = img
	self.location = location
	self.draw = function(canvas, x, y) {
		canvas.drawImage(self.image, x, y)
	}
	self.move = function(FPS, seconds, location) {
		frames = FPS * seconds
		deltaX = (location.x - self.location.x) / frames
		deltaY = (location.y - self.location.y) / frames
		counter = 0
		setInterval(function() {
			self.location.x += deltaX
			self.location.y += deltaY
			counter++
			if(counter >= frames)
				clearInterval()
		}, 1000 / FPS)
	}
	return self
}