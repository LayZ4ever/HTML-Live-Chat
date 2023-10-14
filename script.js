$(function () {
    const socket = io.connect('http://localhost:3000');

    $('#send').click(function () {
        const name = $('#name').val();
        const message = $('#message').val();

        if (name && message) {
            console.log('Sending message:', { name: name, message: message });
            socket.emit('send-message', { name: name, message: message });
        } else {
            alert('Please enter your name and message!');
        }

        $('#message').val('');
    });

    socket.on('message', function (data) {
        const messageElement = $('<div class="message"><strong>' + data.name + ':</strong> ' + data.message + '</div>');
        $('#messages').append(messageElement);
    });
});
