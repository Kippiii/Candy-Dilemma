//Client variables
var socket = io()
var canvas, canvasContext;
var width, height;
var player1 = Player(), player2 = Player();
var gameStarted = false;
var newGame = false
var decision1, decision2;

const FPS = 30;

//Sets up the canvas and game
window.onload = function() {
	canvas = document.getElementById('hostCanvas');
	canvasContext = canvas.getContext('2d');
	
	window.addEventListener('resize', resizeCanvas, false);
	
	function resizeCanvas() {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		
		width = canvas.width;
		height = canvas.height;
	}
	resizeCanvas();
	
	$("#host").hide();
	$("#player").hide();
}

//Starts game when key is pressed
document.onkeydown = function(event) {
	if(player1.ready && player2.ready && !gameStarted)
		socket.emit('startGame')
	if(newGame)
		socket.emit('startGame')
}

//Is ran when a player connects to the server
socket.on('onJoin', function(data) {
	$button = $("#join .container .btn")
	$button.html(data.button)
	$button.click(function () {joinSocket(data.socket)})
})

//Is ran for the host when a player leaves or joins
socket.on('playerUpdate', function(data) {
	player1.ready = data.player1.ready;
	player2.ready = data.player2.ready;
	if(player1.ready || player2.ready) {
		gameStarted = false
		newGame = false
	}
	draw();
})

//Is ran for the host when the game begins
socket.on('hostStart', function() {
	Candy.list = []
	decision1 = null
	decision2 = null
	gameStarted = true
	newGame = false
	Candy.queue.push(new Candy("client/img/candy.png", {x: 2 * (width / 5), y: height / 10}, canvasContext))
	Candy.queue.push(new Candy("client/img/candy2.png", {x: 2 * (width / 5), y: 3 * (height / 10)}, canvasContext))
	Candy.queue.push(new Candy("client/img/candy3.png", {x: 2 * (width / 5), y: 5 * (height / 10)}, canvasContext))
	Candy.queue.push(new Candy("client/img/candy4.png", {x: 2 * (width / 5), y: 7 * (height / 10)}, canvasContext))
	Candy.queue.push(new Candy("client/img/candy2.png", {x: width / 2, y: 1 * (height / 10)}, canvasContext))
	Candy.queue.push(new Candy("client/img/candy4.png", {x: width / 2, y: 3 * (height / 10)}, canvasContext))
	Candy.queue.push(new Candy("client/img/candy5.png", {x: width / 2, y: 5 * (height / 10)}, canvasContext))
	Candy.queue.push(new Candy("client/img/candy.png", {x: width / 2, y: 7 * (height / 10)}, canvasContext))
})

//Is ran for the players when the game begins
socket.on('playerStart', function() {
	$('#player .container').html('<button type="button" class="btn btn-primary btn-lg btn-block" style="background-color: green" onclick="share()">Share the Candy</button>');
	$('#player .container').append('<button type="button" class="btn btn-primary btn-lg btn-block" style="background-color: red" onclick="steal()">Steal the Candy</button>');
})

//Is ran for the host when the players have both picked their choices
socket.on('startEndGame', function(data) {
	setTimeout(function() {
		decision1 = data.player1Decision
		if(decision1 == "Share") {
			for(var i = 0; i < Candy.list.length; i++) {
				var candy = Candy.list[i]
				var x = candy.location.x != width / 2 ? 3 * (width / 10) : 6 * (width / 10)
				var y = candy.location.y
				candy.setupMove({x: x, y: y}, 30)
			}
			candyMove(30, 1)
		}else{
			for(var i = 0; i < Candy.list.length; i++) {
				var candy = Candy.list[i]
				var x = candy.location.x - (width / 10)
				var y = candy.location.y
				candy.setupMove({x: x, y: y}, 30)
			}
			candyMove(30, 1)
		}
		setTimeout(function() {
			for(var i = 0; i < Candy.list.length; i++) {
				console.log(i + ": " + Candy.list[i].location.x)
			}
			
			decision2 = data.player2Decision
			if(decision1 == "Share") {
				if(decision2 == "Share") {
					for(var i = 0; i < Candy.list.length; i++) {
						var candy = Candy.list[i]
						var x = candy.location.x == (3 * (width / 10)) ? width / 5 : 4 * (width / 5) - 132.4
						var y = candy.location.y
						candy.setupMove({x: x, y: y}, 30)
					}
				}else{
					for(var i = 0; i < Candy.list.length; i++) {
						var candy = Candy.list[i]
						var x = candy.location.x == (3 * (width / 10)) ? 7 * (width / 10) - 132.4 : 4 * (width / 5) - 132.4
						var y = candy.location.y
						candy.setupMove({x: x, y: y}, 30)
					}
				}
			}else{
				if(decision2 == "Share") {
					for(var i = 0; i < Candy.list.length; i++) {
						var candy = Candy.list[i]
						var x = candy.location.x == (3 * (width / 10)) ? width / 5 : 3 * (width / 10)
						var y = candy.location.y
						candy.setupMove({x: x, y: y}, 30)
					}
				}else{
					for(var i = 0; i < Candy.list.length; i++) {
						var candy = Candy.list[i]
						if(candy.location.y == height / 10) {
							var x = candy.location.x == (3 * (width / 10)) ? width / 5 : 4 * (width / 5) - 132.4
							var y = candy.location.y
							candy.setupMove({x: x, y: y}, 30)
						}else{
							Candy.list.splice(i, 1)
							i--
						}
					}
				}
			}
			candyMove(30, 1)
			socket.emit('endGame')
			newGame = true
		}, 1000 * 3)
	}, 1000 * 2)
})

//Is ran for the players when the game is fully over
socket.on('candy', function(candy) {
	if(candy >= 4)
		color = "green"
	else
		color = "red"
	$('#player .container').html("<h2 style='color: " + color + "'>You get " + candy + " piece(s) of candy</h2>")
})

//Sets up the game depending on if you are a host or a player
function joinSocket(theSocket) {
	socket.emit(theSocket)
	if(theSocket == "hostGame") {
		$("#join").hide();
		$("#host").show();
		draw();
	}else if(theSocket == "joinGame") {
		$("#join").hide();
		$("#player").show();
	}
}

//Is ran when a player chooses to share
function share() {
	socket.emit('decision', "Share")
	$('#player .container').html("<h2 style='color: green'>You chose to share the candy!</h2>")
}

//Is ran when a player chooses to steal
function steal() {
	socket.emit('decision', "Steal")
	$('#player .container').html("<h2 style='color: red'>You chose to steal the candy!</h2>")
}

//Moves all of the candy objects over a period of time
function candyMove(FPS, seconds) {
	var frames = FPS * seconds
	var counter = 0
	var interval = setInterval(function() {
		for(var i = 0; i < Candy.list.length; i++) {
			Candy.list[i].move()
		}
		counter++
		draw()
		if(counter >= frames) {
			for(var i = 0; i < Candy.list.length; i++) {
				Candy.list[i].stopMove()
			}
			clearInterval(interval)
		}
	}, 1000 / FPS)
}

//Draws the background of the canvas
function drawBackground() {
	var image = new Image()
	var size = width / 5
	image.src = "client/img/background.jpg"
	for(var y = 0; y < height; y+=size) {
		for(var x = 0; x < width; x+=size) {
			canvasContext.drawImage(image, x, y, size, size)
		}
	}
}

//Draws everything needed on the canvas
function draw() {
	drawBackground()
	colorRect(0, 0, 3 * (width / 20), height / 10, 'pink')
	colorRect(17 * (width / 20), 0, 3 * (width / 20), height / 10, 'pink')
	colorText("Player 1", 0.02, 0.05, "black", "40px Comic Sans");
	colorText("Player 2", 0.88, 0.05, "black", "40px Comic Sans");
	
	if(!gameStarted) {
		if(player1.ready)
			colorText("Ready", 0.02, 0.09, "green", "20px Comic Sans");
		else
			colorText("Not Ready", 0.02, 0.09, "red", "20px Comic Sans");
		if(player2.ready)
			colorText("Ready", 0.88, 0.09, "green", "20px Comic Sans");
		else
			colorText("Not Ready", 0.88, 0.09, "red", "20px Comic Sans");
		if(player1.ready && player2.ready)
			colorText("Press a button to start the game!", 0.32, 0.5, "black", "40px Comic Sans")
	}else{
		if(decision1 != null) {
			var color
			if(decision1 == "Share")
				color = 'green'
			else
				color = 'red'
			colorRect(0, height / 10, 3 * (width / 20), height / 10, 'pink')
			colorText(decision1, 0.02, 0.15, color, "40px Comic Sans");
		}
		if(decision2 != null) {
			var color
			if(decision2 == "Share")
				color = 'green'
			else
				color = 'red'
			colorRect(17 * (width / 20), height / 10, 3 * (width / 20), height / 10, 'pink')
			colorText(decision2, 0.88, 0.15, color, "40px Comic Sans");
		}
		for(var i = 0; i < Candy.list.length; i++) {
			Candy.list[i].draw()
		}
		if(newGame) {
			colorText("Press a button to start the game!", 0.32, 0.5, "black", "40px Comic Sans")
		}
	}
}

//Used for coloring rectangles
function colorRect(leftX, topY, width, height, drawColor) {
	canvasContext.fillStyle = drawColor;
	canvasContext.fillRect(leftX, topY, width, height);
}

//Used for coloring text
function colorText(text, x, y, color, font) {
	canvasContext.fillStyle = color;
	canvasContext.font = font;
	canvasContext.fillText(text, x * width, y * height);
}