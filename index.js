const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const users = [];
const sockets = [];
let count = 0;

// Provides default reesponse to verify running server
app.get('/', (req, res) =>
    res.send('<h3>Service running</h3>')
);

// connection
io.on('connection', (socket) => {   
    
    // Adds new user for each connection with a default name
    users[count] = 
        {
          id: count,
          name: `User ${count}`,
        };
    
    // Adds corresponding socket reference
    sockets[count] = socket;

    // Send message and updated users list on new connections
    io.emit('msg', {
        user: users[count].name,
        content: 'has joined',
    });
    io.emit('users', users);

    // Keep track of user associated to each socket
    socket.emit('user', users[count]);

    console.log('user connected', users[count]);
    count++;

    socket.on('send', (msg, user) => {
        io.emit('msg', {
            user: user.name,
            content: msg,
        });    
    });

    // Clean up disconected client connections
    socket.on('disconnect', function () {
        // find socket reference and remove from users and sockets
        const idx = sockets.findIndex(s => s === socket);

        // Message remaining connected clients
        io.emit('msg', {
            user: users[idx].name,
            content: 'has left',
        });
    

        // Clean up user and socket references
        users.splice(idx, 1);
        sockets.splice(idx, 1);

        io.emit('users', users);

        console.log('a user has disconnected', idx)
    })    
});

http.listen(3001, () =>
    console.log('listing on *:3001')
);
