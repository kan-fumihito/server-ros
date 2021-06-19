const WebSocket = require("ws");

// ブラウザから受け取るだけ
const wsUser = new WebSocket.Server({ port: 8080 });
var wsList = [];
var wsNow = null;
var wsIdx = 0;
// Rosに送るだけ
const wsRos = new WebSocket.Server({ port: 9090 });

wsUser.on("connection", function(ws) {
    console.log("Open User");
    wsList.push(ws);
    if (wsNow == null) {
        wsNow = ws;
        ws.send("You");
    }
    ws.on("message", function(msg) {
        console.log("Received: " + msg);
        if (ws == wsNow) {
            console.log("Send to Ros");
            wsRos.clients.forEach(function(client) {
                client.send(msg);
            });
        }
    });
    ws.on("close", function() {
        console.log("Close User");
        wsList.pop(ws);
    });
});

wsRos.on("connection", function(ws) {
    console.log("Open ROS");
    ws.on("close", function() {
        console.log("Close ROS");
    });
    ws.on("message", function(msg) {
        console.log(msg);
    })
});

function changeNow() {
    if (wsList.length > 0) {
        wsIdx = (wsIdx + 1) % wsList.length;
        wsNow = wsList[wsIdx];

        wsNow.send("You");
    }
}
setInterval(changeNow, 1000 * 10);