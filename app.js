var express = require('express'); 
var app = express(); 
var serv = require('http').Server(app); 
 
app.get('/', function(req, res) { 
	res.sendFile(__dirname + '/client/index.html'); 
}); 
app.use('/client', express.static(__dirname + '/client')); 
 
serv.listen(2000); 
console.log("Server started.") 
 
var io = require('socket.io')(serv, {}); 

//Server Variables
var gameHosted = false
var hostSocket, player1Socket, player2Socket

io.sockets.on('connection', function(socket) {
	if(gameHosted) {
		socket.emit('onJoin', {
			button: "Join Game",
			socket: "joinGame"
		})
	}else{
		socket.emit('onJoin', {
			button: "Host Game",
			socket: "hostGame"
		})
	}
	
	socket.on('hostGame', function() {
		if(!gameHosted) {
			hostSocket = socket
			gameHosted = true
			console.log("A game is hosted.")
		}
	})
	
	socket.on('joinGame', function() {
		if(gameHosted) {
			if(player1Socket != null)
				player2Socket = socket
			else
				player1Socket = socket
			console.log("A player has joined the game.")
		}
	})
})