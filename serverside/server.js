console.log("Server Loading...");
const ws = require('ws').Server;
const WebSocket = require('ws');
const PORT = 3888;
const serverWs = new ws({ port: PORT});
console.log("Server started Successful!");
let players=[], playersCnt=0;

function findPlayer(pid){
    for (let i = 0; i < playersCnt; i++) {
        if (players[i].playerId == pid) {
            return players[i];
        }
    }
    return null;
}

function sendMessage(pid, content) {
    let player=findPlayer(pid);
    if(player.ws.readyState==WebSocket.OPEN){
        player.ws.send(JSON.stringify(content));
    }
}

function connectPlayer(pid, ws){
    let player=findPlayer(pid);
    if(player!=null){
        player.ws=ws;
        player.online=true;
    }
    else {
        let player = {
            "playerId": pid,
            "ws": ws,
            "online": true
        };
        players.push(player);
        playersCnt++;
    }
    sendMessage(pid,{"type":"connection","connected":true});
}

serverWs.on('connection', function(playerWs){
    playerWs.on('message', function(evt){
        let message = JSON.parse(evt);
        let type=message.type;
        if (type == 'connection'){
            connectPlayer(message.playerId,playerWs);
        }
    });
    playerWs.on('close', function(){
        for (let i = 0; i < playersCnt; i++) {
            if (players[i].ws == playerWs) {
                players[i].online=false;
            }
        }
    });
});

process.on('SIGINT', function () {
    console.log("服务器关闭中...");
    for (let i = 0; i < playersCnt; i++){
        if(players[i].online){
            sendMessage(players[i].playerId,{"type": "close", "message": "服务器暂时关闭"});
            players[i].ws.close();
            players[i].online=false;
        }
    }
    serverWs.close();
    process.exit();
});