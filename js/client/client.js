let color=0,stat=0;
let cnt=0;
let canvas,ctx;
let connected=0;
let sizeRadio=2;
let servers=["ws://127.0.0.1:3888/"];
let serversCnt=1;
let gameWs;
let playerId='ih1o8wAH2nA';
let nowServer;

/* WEBSOCKET */

function sendMessage(content){
    if (gameWs.readyState === WebSocket.OPEN) {
        gameWs.send(JSON.stringify(content));
    }
}

function connect(){
    sendMessage({
        "type": "connection",
        "playerId": playerId
    });
}

function readMessage(evt){
    let content=JSON.parse(evt.data);
    if(content.type == "connection"){
        if(content.connected){
            connected=2;
            console.log("Connected!");
        }
    }
    if(content.type == "close"){
        connected=0;
        alert(content.message);
    }
}

/* ACTION */

function clearCanvas(){
    var width=canvas.width;
    var height=canvas.height;
    ctx.fillStyle = 'white';
    ctx.fillRect(0,0,width,height);
}

function colorFromTo(r1,g1,b1,r2,g2,b2,cnt,tot){
    rn=(r2-r1)/tot;
    gn=(g2-g1)/tot;
    bn=(b2-b1)/tot;
    if(cnt==1)return RGB(r1,g1,b1);
    if(cnt==tot)return RGB(r2,g2,b2);
    else return RGB(r1+rn*cnt,g1+gn*cnt,b1+bn*cnt);
}

function drawText(x,y,size,text,lineWidth){
    ctx.font=size+"px Ubuntu";
    ctx.fillStyle="white";
    ctx.lineWidth=lineWidth;
    ctx.strokeStyle="black";
    ctx.textAlign="center";
    ctx.fillText(text,x,y);
    ctx.strokeText(text,x,y);
}

/* DRAW */

function refresh(cnt){
    let r=Math.max(canvas.width,canvas.height)/60*cnt;
    let x=canvas.width/2;
    let y=canvas.height/2
    let width=canvas.width;
    let height=canvas.height;
    ctx.fillStyle = RGB(91,155,213);
    ctx.fillRect(0,0,width,height);
    ctx.strokeStyle = RGB(61,125,183);
    ctx.lineWidth=20;
    ctx.beginPath();
    ctx.arc(x,y,r,0,Math.PI/180*360,false);
    
    ctx.stroke();
}

//destination-over
function drawUI(){
    let x=canvas.width/2;
    let y=canvas.height/2;
    drawText(x,y-230,192,"luogu.io",10)
    if(connected==2) {
        drawText(x,y,128,"Connected!",7);
    }
    else {
        drawText(x,y,128,"Connecting...",7);
        if(connected==0){
            connected=1;
            nowServer=servers[Math.floor(Math.random()*serversCnt)];
            gameWs=new WebSocket(nowServer);
            gameWs.onopen=connect;
            gameWs.onmessage=readMessage;
            gameWs.onerror=function(){connected=1;console.log("Error while connecting server! Retrying in 5 seconds.");setTimeout(function(){connected=0},5000)};
            gameWs.onclose=function(){connected=1;setTimeout(function(){connected=0},5000)};
            console.log("Connecting to "+nowServer);
        }
    }
}

function RGB(r,g,b){return 'rgb('+r+','+g+','+b+')'}

function render(){
    canvas.width=window.innerWidth*2;
    canvas.height=window.innerHeight*2;
    ctx.save();
    var width=canvas.width;
    var height=canvas.height;
    if (stat==0){
        color+=1;
        if(color<=30)
        ctx.fillStyle = colorFromTo(0,0,0,255,255,255,color,30);
        else ctx.fillStyle = colorFromTo(255,255,255,91,155,213,color-30,60);
        ctx.fillRect(0,0,width,height);
        
        if(color>=90)stat=1;
    }
    else if(stat==1){
        cnt++;
        refresh(cnt);
        drawUI();
    }
    else {
        
    }
    ctx.restore();
    window.requestAnimationFrame(render);
}

$(document).ready(function(){
    canvas=document.getElementById("canvas");
    ctx=canvas.getContext("2d");
    (function(canvas, ctx){
        window.requestAnimationFrame(render);
    })(canvas, ctx);
});