//Object created for all players
Player = function() {
	self = {}
	self.ready = false
	return self
}

//Object created for all of the candy
Candy = function(img, location, canvas) {
    var self = this;
    self.image = new Image()
    self.image.src = img
    self.location = {x: location.x, y: location.y}
    self.canvas = canvas
	self.deltaX = 0
	self.deltaY = 0
	self.toLocation = {}
	//Draws the candy at its current location
    self.draw = function() {
        self.canvas.drawImage(self.image, self.location.x, self.location.y, 132.4, 132.4)
    }
	//Sets up up for a movement that is soon to happen
	self.setupMove = function(location, frames) {
        self.deltaX = (location.x - self.location.x) / frames
        self.deltaY = (location.y - self.location.y) / frames
		self.toLocation = {x: location.x, y: location.y}
	}
	//Changes the location of the candy
    self.move = function() {
		self.location.x += self.deltaX
		self.location.y += self.deltaY
    }
	//Ends the movement of the candy
	self.stopMove = function() {
		self.deltaX = 0
		self.deltaY = 0
		self.location = self.toLocation
		self.toLocation = {}
	}
	//Is ran when the image of the candy finishes loading in
    self.image.onload = function() {
        Candy.list.push(self)
        Candy.queue.splice(Candy.queue.indexOf(self), 1)

        if(Candy.queue.length === 0)
            draw()
    }
}
Candy.list = []
Candy.queue = []