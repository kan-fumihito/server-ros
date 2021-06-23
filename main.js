const WebSocket = require("ws");

// ユーザ(ブラウザ)側
const wsUser = new WebSocket.Server({ port: 8080 });
var wsList = [];
var wsNow = null;
var wsIdx = 0;
// ROS(Jetson)側
const wsRos = new WebSocket.Server({ port: 9090 });

wsUser.on("connection", function(ws) {
    console.log("Open User");
    wsList.push(ws);
    if (wsNow == null) {
        wsNow = ws;
        wsIdx = 0;
        ws.send("You");
    } else {
        ws.send("Pause");
    }

    // ユーザからメッセージが届いた
    ws.on("message", function(msg) {
        console.log("Received: " + msg);
        if (ws == wsNow) {
            console.log("Send to Ros");
            wsRos.clients.forEach(function(client) {
                client.send(msg);
            });
        }
    });
    // ユーザが切断した
    ws.on("close", function() {
        console.log("Close User");
        wsList.pop(ws);
        if (wsList.length == 0) {
            wsNow = null;
        } else if (ws == wsNow) {
            wsIdx -= 1;
            changeNow();
        } else {
            if (wsList.indexOf(wsNow) < wsIdx) {
                wsIdx -= 1;
            }
        }
    });
});

wsRos.on("connection", function(ws) {
    console.log("Open ROS");

    // ROSからメッセージが届いた
    ws.on("message", function(msg) {
        wsUser.clients.forEach(function(client) {
            client.send(msg);
        });
    });
    // client-rosが切断された
    ws.on("close", function() {
        console.log("Close ROS");
    });
});

// ユーザの操作権の交替
function changeNow() {
    if (wsList.length > 0) {
        wsIdx = (wsIdx + 1) % wsList.length;
        wsNow = wsList[wsIdx];
        wsNow.send("You");

        wsUser.clients.forEach(function(client) {
            if (client != wsNow) {
                client.send("Pause");
            }
        });
    }
}
setInterval(changeNow, 1000 * 10);