const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

const http = require('http').createServer(app);
const io = require('socket.io')(http)

mongoose.connect("mongodb://127.0.0.1:27017/myDatabase", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected Successfully');
}).catch((err) => {
    console.error(err);
});

const messageSchema = new mongoose.Schema({
    name: String,
    message: String
});

const Message = mongoose.model('Message', messageSchema);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(__dirname));

app.get('/messages', async (req, res) => {
    try {
        const messages = await Message.find({});
        res.send(messages);
    } catch (err) {
        console.error('Error fetching messages:', err);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/messages', (req, res) => {
    const message = new Message(req.body);
    message.save()
        .then(() => {
            io.emit('message', req.body);
            res.sendStatus(200);
        })
        .catch((err) => {
            console.error('Error saving message:', err);
            res.status(500).send('Internal Server Error');
        });
});

io.on('connection', (socket) => {
    console.log('User connected');

    socket.on('send-message', (data) => {
        const message = new Message(data);

        console.log('Received message:', data);
        message.save()
            .then(() => {
                console.log('Message saved successfully');
                io.emit('message', data);
            })
            .catch((err) => {
                console.error('Error saving message:', err);
            });
    });
});

http.listen(port, () => {
    console.log('Server is running on port', port);
});