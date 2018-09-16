var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http)
var Client = require('ssh2').Client;

var conn = new Client();
conn.connect({
    host: 'localhost',
    port: 22,
    username: 'radha',
    password:'radha'
});
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
var outputmsg = '';
var func = (msg) =>{


}

conn.on('ready', () => {
    console.log('Client :: ready');
    conn.shell(function(err, stream) {
        if (err) throw err;
        stream.on('close', function() {
            console.log('Stream :: close');
            conn.end();
        }).on('data', function(data) {
            console.log('STDOUT: ' + data);
            outputmsg += data;
        }).stderr.on('data', function(data) {
            console.log('STDERR: ' + data);
            outputmsg+=data;
        });

        stream.end("ls\n");
    });
});
io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
       console.log('user disconnected');
    });
    socket.on('chat message', (msg) => {
       outputmsg=''
       console.log('message: '+ msg);
       /*func(msg);*/
        io.emit('chat message', msg); /* for chat client, just show msg */
      /*  io.emit('chat message', outputmsg);*/ /* for shell*/
    });
});

http.listen(3000, () => {
   console.log('listening on *:3000') ;
});