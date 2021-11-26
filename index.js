const { v4: uuidv4 } = require('uuid');

const server = require('http').createServer((req, res) => {
    res.setHeader('Content-Type', 'application/json')
    const headers = {
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Origin": req.headers.origin, //or the specific origin you want to give access to,
        "Access-Control-Allow-Credentials": true
    };
    res.writeHead(200, headers);

    if (req.url === '/newCall') {
        let id = uuidv4()
        res.end(JSON.stringify({ id: id, message: "success" }))
    } else {
        res.end(JSON.stringify({ error: "not found" }))
    }
});

const io = require("socket.io")(server,
    {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

server.listen(5000, 'localhost', () => {
    console.log('Server Listening at PORT 5000')
})

io.on('connection', client => {

    client.on('joinroom', data => { 
        client.join(data.room);
        io.to(data.room).emit("addpartcipant", data)
        console.log('Room ', data)

        client.on('send-message', ({ from, message })=>{
            console.log("Message ", message)
            client.broadcast.to(data.room).emit('new-message', {from, message})
        });

    });

});