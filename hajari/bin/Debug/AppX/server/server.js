const portscanner = require("portscanner");
const WebSocket = require("ws");
let wss, currentWord;
let currentCount = -1;
let wssArr = [];

// Ports the server will try to connect using the number ports within this range
const ports = [8080, 8090];

portscanner.findAPortNotInUse(ports[0], ports[1], "127.0.0.1", (err, port) => {
    wss = new WebSocket.Server({ port: port });
    wss.on("connection", onConnection);
    console.log(`Listening to port ${port}`);

});

