// Include the following for HTTP functionality, for serving files and whatnot
// let http = require('http');
// let express = require('express');
// let app = express();
// app.use(express.static("public"));
// let server = http.createServer(app);

// Stand-alone web socket 
let webSocket = require('ws');
let host = "localhost"; 
let port = 3000;

let userCount = 0;
let wsServer = new webSocket.Server({host: host, port: port});
wsServer.on('connection', (ws) => {
    userCount++;
    console.log("We have received a connection.\nCurrent number of users connected:", userCount);

    ws.on('message', (message) => {
        console.log(`Received: ${message}`);

        wsServer.clients.forEach((client) => {
            if (client.readyState === webSocket.OPEN && client !== ws) {
                client.send(message);
            }
        })
    });

    ws.on('close', () => {
        userCount--;
        console.log("A user has disconnected.\nCurrent number of users connected:", userCount);
    });

});

console.log(`This is: ws://${host}:${port}`);