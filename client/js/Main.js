var socket = io()
var canvas, canvasContext;
var width, height;
var player1 = Player(), player2 = Player();
var gameStarted = false;

const FPS = 30;

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

document.onkeydown = function(event) {
	if(player1.ready && player2.ready && !gameStarted)
		socket.emit('startGame')
}

socket.on('onJoin', function(data) {
	$button = $("#join .container .btn")
	$button.html(data.button)
	$button.click(function () {joinSocket(data.socket)})
})

socket.on('playerUpdate', function(data) {
	player1.ready = data.player1.ready;
	player2.ready = data.player2.ready;
	draw();
})

socket.on('hostStart', function() {
	gameStarted = true
	//TODO Create candy
	draw()
})

socket.on('playerStart', function() {
	$('#player .container').html('<button type="button" class="btn btn-primary btn-lg btn-block" style="background-color: green" onclick="share()">Share the Candy</button>');
	$('#player .container').append('<button type="button" class="btn btn-primary btn-lg btn-block" style="background-color: red" onclick="steal()">Steal the Candy</button>');
})

socket.on('startEndGame', function(data) {
	setTimeout(function() {
		if(data.player1Decision == "Share")
			color = 'green'
		else
			color = 'red'
		colorText(data.player1Decision, 0.02, 0.15, color, "40px Comic Sans");
		//TODO
		setTimeout(function() {
			if(data.player2Decision == "Share")
				color = 'green'
			else
				color = 'red'
			colorText(data.player2Decision, 0.88, 0.15, color, "40px Comic Sans");
			//TODO
			socket.emit('endGame')
			gameStarted = false
			colorText("Press a button to start the game!", 0.32, 0.5, "black", "40px Comic Sans")
		}, 1000 * 2)
	}, 1000 * 2)
})

socket.on('candy', function(candy) {
	if(candy >= 4)
		color = "green"
	else
		color = "red"
	$('#player .container').html("<h2 style='color: " + color + "'>You get " + candy + " piece(s) of candy</h2>")
})

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

function share() {
	socket.emit('decision', "Share")
	$('#player .container').html("<h2 style='color: green'>You chose to share the candy!</h2>")
}

function steal() {
	socket.emit('decision', "Steal")
	$('#player .container').html("<h2 style='color: red'>You chose to steal the candy!</h2>")
}

function draw() {
	colorRect(0, 0, canvas.width, canvas.height, 'white');
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
		//TODO
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