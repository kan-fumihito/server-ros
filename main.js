const WebSocket = require("ws");

// ブラウザから受け取るだけ
const wsUser = new WebSocket.Server({ port: 8080 });
// Rosに送るだけ
const wsRos = new WebSocket.Server({ port: 9090 });

wsUser.on("connection", function(ws) {
    console.log("Open User");
    ws.on("message", function(msg) {
        console.log("Received: " + msg);
        wsRos.clients.forEach(function(client) {
            console.log("Send to Ros");
            client.send(msg);
        });
    });
    ws.on("close", function() {
        console.log("Close User");
    });
});

wsRos.on("connection", function(ws) {
    console.log("Open ROS");
    ws.on("close", function() {
        console.log("Close ROS");
    });
});