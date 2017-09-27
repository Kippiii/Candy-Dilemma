//Basic Node.js setup
var express = require('express'); 
var app = express(); 
var serv = require('http').Server(app); 
 
app.get('/', function(req, res) { 
	res.sendFile(__dirname + '/client/index.html'); 
}); 
app.use('/client', express.static(__dirname + '/client')); 
 
serv.listen(process.env.PORT || 2000); 
console.log("Server started.") 
 
var io = require('socket.io')(serv, {}); 

//Server Variables
var gameHosted = false
var hostSocket, player1Socket, player2Socket
var player1Decision, player2Decision

//Is ran when a client connects to the server
io.sockets.on('connection', function(socket) {
	//Is ran when someone disconnects from the server
	socket.on('disconnect', function() {
		var person = ""
		if(socket == hostSocket) {
			gameHosted = false
			hostSocket = null
			player1Socket = null
			player2Socket = null
			person = "The host"
		}else if(socket == player1Socket) {
			player1Socket = null
			playerUpdate()
			person = "Player 1"
			playerUpdate()
		}else if(socket == player2Socket) {
			player2Socket = null
			playerUpdate()
			person = "Player 2"
			playerUpdate()
		}
		console.log(person + " has disconnected!")
	})
	
	//Decides whether client will be a host or a player
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
	
	//Is ran when a game is hosted
	socket.on('hostGame', function() {
		if(!gameHosted) {
			hostSocket = socket
			gameHosted = true
			console.log("A game is hosted.")
		}
	})
	
	//Is ran when a player joins the game
	socket.on('joinGame', function() {
		if(gameHosted) {
			if(player1Socket != null)
				player2Socket = socket
			else
				player1Socket = socket
			
			playerUpdate()
			console.log("A player has joined the game.")
		}
	})
	
	//Is ran when the game is started by the host
	socket.on('startGame', function() {
		if(socket == hostSocket) {
			hostSocket.emit('hostStart')
			player1Socket.emit('playerStart')
			player2Socket.emit('playerStart')
			console.log("The game has started!")
		}
	})
	
	//Is ran when a player chooses either share or steal
	socket.on('decision', function(decision) {
		if(socket == player1Socket)
			player1Decision = decision
		else
			player2Decision = decision
		if(player1Decision != null && player2Decision != null)
			hostSocket.emit('startEndGame', {
				player1Decision: player1Decision,
				player2Decision: player2Decision
			})
	})
	
	//Is ran at the very end of the game
	socket.on('endGame', function() {
		candy1 = 0, candy2 = 0
		if(player1Decision == "Share") {
			if(player2Decision == "Steal") {
				candy1 = 0
				candy2 = 8
			}else{
				candy1 = 4
				candy2 = 4
			}
		}else{
			if(player2Decision == "Steal") {
				candy1 = 1
				candy2 = 1
			}else{
				candy1 = 8
				candy2 = 0
			}
		}
		player1Socket.emit('candy', candy1)
		player2Socket.emit('candy', candy2)
		player1Decision = null
		player2Decision = null
	})
})

//Is ran everytime a player joins or leaves
function playerUpdate() {
	hostSocket.emit('playerUpdate', {
		player1: {ready: player1Socket != null},
		player2: {ready: player2Socket != null}
	})
}