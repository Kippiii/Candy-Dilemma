var socket = io()

socket.on('onJoin', function(data) {
	$button = $("#join .container .btn")
	$button.html(data.button)
	$button.click(function () {joinSocket(data.socket)})
})

function joinSocket(theSocket) {
	console.log("Debug")
	socket.emit(theSocket)
}