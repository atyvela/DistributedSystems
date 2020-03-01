"use strict";
//portscanner
const portscanner = require("portscanner"); 
//Websocket stuff
const WebSocket = require("ws");
let wss
//port range 80-90 for server to connect
const ports = [8080, 8090];

class State {
    constructor(maxPlayers) {
        this._cons = [];         
        this._maxPlayers = maxPlayers || null;
        this._players = [];
        
    }
    //returns connections
    get cons() {
        return this._cons;
    }
    //returns max number of players. Hard coded to  be 3.
    get maxPlayers() {
        return this._maxPlayers;
    }

    get state() {
        return {
            "cons": this.cons,   
            "maxPlayers:": this.maxPlayers,  
        };
    }

    get players() {
        return this._players;
    }


    set cons(cons) {
        this._cons = cons;
    }

    set players(players) {
        this._players = players;
    }

    //adds new connetion to connections list. Also notifyis all nodes that new player has joined the game
    addConnection(connection) {
        this._cons.push(connection);
        broadCast("PLAYER JOINED", this.players);
        return this._cons.length - 1; // Returns the index of the added connection on connections list
    }
    //disconnects connection of said index from connections list
    disconnectConnection(index) {
        this._cons.splice(index, 1);
        this.players.splice(index, 1);
    }
    //adds new player to list with a player name "player X" where X is a index from 1 to 3. also saves players score and pick(rock-paper-scissors)
    addPlayer() {
        this._players.push({
            "name": "Player" + (this._players.length + 1),
            "score": 0, "pick": null,
        });
    }

    setPlayerScore(player, score) {
        this._players[player].score = score;
    }

    setPlayerPick(player, pick) {
        this._players[player].pick = pick;
    }

    reset() {
        this.cons = [];
        this.players = [];
    }

}

//state object. takes 3 as max/min amount of players required to play the game.
const state = new State(3);


const onConnection = ws => {
    //if amount of players <3 connecion is allowed
    if (state.cons.length <= state.maxPlayers - 1) {
        handleConnection(ws);

    }else {
        // Only three players allowed.
        var msg = "GAME FULL";
        msg = JSON.stringify(msg);
        ws.send(msg, null);
        console.log("3 nodes already connected");
        ws.close();
    }
    
};
const printPoints = () => {
    console.log(state.players[0].score);
    console.log(state.players[1].score);
    console.log(state.players[2].score);
    state.players[0].pick = null;
    state.players[1].pick = null;
    state.players[2].pick = null;   
};

//calculates the points based on the players pick. total if-else clusterfuck
const calculatePoints = () => {

    //handle all having different hand = no points 
    if (state.players[0].pick != state.players[1].pick && state.players[0].pick != state.players[2].pick && state.players[1].pick != state.players[2].pick) {
        console.log("its a tie");
        broadCast("TIE", state.players);
        printPoints();
    }

    //handle all having same hand = no points 
    if (state.players[0].pick == state.players[1].pick && state.players[1].pick == state.players[2].pick) {
        console.log("its a tie");
        broadCast("TIE", state.players);
        printPoints();
    }
    //Handle player 1 being "lonely" pick
    if (state.players[0].pick == "rock") {
        if (state.players[1].pick == "scissors" && state.players[2].pick == "scissors") {
            state.players[0].score++;
            state.cons[0].send(createMessage("POINT", state.players));
            state.cons[1].send(createMessage("NO POINT", state.players));
            state.cons[2].send(createMessage("NO POINT", state.players));
            printPoints();
        }
        else if (state.players[1].pick == "paper" && state.players[2].pick == "paper") {
            state.players[1].score++;
            state.players[2].score++;
            state.cons[0].send(createMessage("NO POINT", state.players));
            state.cons[1].send(createMessage("POINT", state.players));
            state.cons[2].send(createMessage("POINT", state.players));
            printPoints();
        }
    }
    else if (state.players[0].pick == "paper")
    {
        if (state.players[1].pick == "rock" && state.players[2].pick == "rock") {
            state.players[0].score++;
            state.cons[0].send(createMessage("POINT", state.players));
            state.cons[1].send(createMessage("NO POINT", state.players));
            state.cons[2].send(createMessage("NO POINT", state.players));
            printPoints();
        }
        else if (state.players[1].pick == "scissors" && state.players[2].pick == "scissors") {
            state.players[1].score++;
            state.players[2].score++;
            state.cons[0].send(createMessage("NO POINT", state.players));
            state.cons[1].send(createMessage("POINT", state.players));
            state.cons[2].send(createMessage("POINT", state.players));
            printPoints();
        }
    }
    else if (state.players[0].pick == "scissors") {
        if (state.players[1].pick == "rock" && state.players[2].pick == "rock") {
            state.players[1].score++;
            state.players[2].score++;
            state.cons[0].send(createMessage("NO POINT", state.players));
            state.cons[1].send(createMessage("POINT", state.players));
            state.cons[2].send(createMessage("POINT", state.players));
            printPoints();
        }
        else if (state.players[1].pick == "paper" && state.players[2].pick == "paper") {
            state.players[0].score++;
            state.cons[1].send(createMessage("NO POINT", state.players));
            state.cons[2].send(createMessage("NO POINT", state.players));
            state.cons[0].send(createMessage("POINT", state.players));
            printPoints();
        }
    }
    //handle player 2 being "lonely" pick
    if (state.players[1].pick == "rock") {
        if (state.players[0].pick == "scissors" && state.players[2].pick == "scissors") {
            state.players[1].score++;
            state.cons[1].send(createMessage("POINT", state.players));
            state.cons[0].send(createMessage("NO POINT", state.players));
            state.cons[2].send(createMessage("NO POINT", state.players));
            printPoints();
        }
        else if (state.players[0].pick == "paper" && state.players[2].pick == "paper") {
            state.players[0].score++;
            state.players[2].score++;
            state.cons[1].send(createMessage("NO POINT", state.players));
            state.cons[0].send(createMessage("POINT", state.players));
            state.cons[2].send(createMessage("POINT", state.players));
            printPoints();
        }
    }
    else if (state.players[1].pick == "paper") {
        if (state.players[0].pick == "rock" && state.players[2].pick == "rock") {
            state.players[1].score++;
            state.cons[1].send(createMessage("POINT", state.players));
            state.cons[0].send(createMessage("NO POINT", state.players));
            state.cons[2].send(createMessage("NO POINT", state.players));
            
            printPoints();
        }
        else if (state.players[0].pick == "scissors" && state.players[2].pick == "scissors") {
            state.players[0].score++;
            state.players[2].score++;
            state.cons[1].send(createMessage("NO POINT", state.players));
            state.cons[0].send(createMessage("POINT", state.players));
            state.cons[2].send(createMessage("POINT", state.players));
            printPoints();
        }
    }
    else if (state.players[1].pick == "scissors") {
        if (state.players[0].pick == "rock" && state.players[2].pick == "rock") {
            state.players[0].score++;
            state.players[2].score++;
            state.cons[1].send(createMessage("NO POINT", state.players));
            state.cons[0].send(createMessage("POINT", state.players));
            state.cons[2].send(createMessage("POINT", state.players));
            printPoints();
        }
        else if (state.players[0].pick == "paper" && state.players[2].pick == "paper") {
            state.players[1].score++;
            state.cons[0].send(createMessage("NO POINT", state.players));
            state.cons[2].send(createMessage("NO POINT", state.players));
            state.cons[1].send(createMessage("POINT", state.players));
            printPoints();
        }
    }
    //handle player 3 being the "lonely" hand
    if (state.players[2].pick == "rock") {
        if (state.players[0].pick == "scissors" && state.players[1].pick == "scissors") {
            state.players[2].score++;
            state.cons[0].send(createMessage("NO POINT", state.players));
            state.cons[1].send(createMessage("NO POINT", state.players));
            state.cons[2].send(createMessage("POINT", state.players));
            printPoints();
        }
        else if (state.players[0].pick == "paper" && state.players[1].pick == "paper") {
            state.players[0].score++;
            state.players[1].score++;
            state.cons[2].send(createMessage("NO POINT", state.players));
            state.cons[1].send(createMessage("POINT", state.players));
            state.cons[0].send(createMessage("POINT", state.players));
            printPoints();
        }
    }
    else if (state.players[2].pick == "paper") {
        if (state.players[0].pick == "rock" && state.players[1].pick == "rock") {
            state.players[2].score++;
            state.cons[0].send(createMessage("NO POINT", state.players));
            state.cons[1].send(createMessage("NO POINT", state.players));
            state.cons[2].send(createMessage("POINT", state.players));
            printPoints();
        }
        else if (state.players[0].pick == "scissors" && state.players[1].pick == "scissors") {
            state.players[0].score++;
            state.players[1].score++;
            state.cons[2].send(createMessage("NO POINT", state.players));
            state.cons[1].send(createMessage("POINT", state.players));
            state.cons[0].send(createMessage("POINT", state.players));
            printPoints();
        }
    }
    else if (state.players[2].pick == "scissors") {
        if (state.players[0].pick == "rock" && state.players[1].pick == "rock") {
            state.players[0].score++;
            state.players[1].score++;
            state.cons[2].send(createMessage("NO POINT", state.players));
            state.cons[1].send(createMessage("POINT", state.players));
            state.cons[0].send(createMessage("POINT", state.players));
            printPoints();
        }
        else if (state.players[0].pick == "paper" && state.players[1].pick == "paper") {
            state.players[2].score++;
            state.cons[0].send(createMessage("NO POINT", state.players));
            state.cons[1].send(createMessage("NO POINT", state.players));
            state.cons[2].send(createMessage("POINT", state.players));
            printPoints();
        }
    }
};

//onMessage handles all incoming messages and required functionalities after message is received. 
const onMessage = function (message) {
    const msg = message;
    let index = state.cons.indexOf(this);
    state.players[state.cons.indexOf(this)].pick = msg;
    //print out players picks on server console:
    console.log("player" + state.players[state.cons.indexOf(this)].name + "picked" + state.players[state.cons.indexOf(this)].pick);
    //check that all answers have been received.
    if (state.players[0].pick != null && state.players[1].pick != null && state.players[2].pick != null) {
        console.log("all answers reseived");
        //calculate points to check winners and losers.
        calculatePoints();
        //check if any of the players have 3 points to win the game and notify clients accordingly:
        if (state.players[0].score >= 3) {
            console.log("game over. Player 1 wins");
            broadCast("GAME OVER 1", state.players);
            state.reset();
            broadCast("SCORE", state.players);

        } else if (state.players[1].score >= 3){
            console.log("game over. Player 2 wins");
            broadCast("GAME OVER 2", state.players);
            state.reset();
            broadCast("SCORE", state.players);

        } else if (state.players[2].score >= 3){
            console.log("game over. Player 3 wins");
            broadCast("GAME OVER 3", state.players);
            state.reset();
            broadCast("SCORE", state.players);
        }else {
            broadCast("SCORE", state.players);
        }
       
    }
    

};

//creates JSON message to be sent. Takes in a message as string and a player index to send the message to correct client
const createMessage = (message, players) => {
    var msg = {
        "message": message,
        "players": players,
    };
    return JSON.stringify(msg);
};
//wrapper to send the message to all players simultaniously.
const broadCast = (message, players) => {
    const msg = createMessage(message, players);
    state.cons.forEach(con => con.send(msg));
};


//fault tolerance if any of the players leaves the game.
const onClose = function (message) {

    //notifys if any of the players has left the game:
    let index = state.cons.indexOf(this);
    state.disconnectConnection(index);
    broadCast("PLAYER LEFT", state.players);
    console.log(`node ${index} disconnected`);
    // If one of the players leaves, gamestate is resetted and players are notified to click play to start a new game
    if (state.cons.length < 3) {
        broadCast("PLAYER LEFT", state.players);
        state.reset();
        console.log("player left, resetting");
        return;
    }
};

const handleConnection = (ws) => {
    ws.on("message", onMessage.bind(ws));
    ws.on("close", onClose.bind(ws));
    state.addPlayer();
    state.addConnection(ws);
    console.log("node connected");
};

//portscanner to connect
portscanner.findAPortNotInUse(ports[0], ports[1], "127.0.0.1", (err, port) => {
    wss = new WebSocket.Server({ port: port });
    wss.on("connection", onConnection);
    console.log(`Listening to port ${port}`);

});

