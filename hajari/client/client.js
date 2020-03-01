//HTML elements:
const play = document.getElementById("play");
const leave = document.getElementById("leave");
const rock = document.getElementById("rock");
const paper = document.getElementById("paper");
const scissors = document.getElementById("scissors");
const info = document.getElementById("info");
const players = document.getElementById("players");
//websocket stuff
let ws;
const maxPort = 8089;//max port in range 8080-8089


const onConnection = function (event) {
    console.log("Connection open");
};
//handles incoming messages and updates elements accordingly
const onMessage = function (event) {

    const data = JSON.parse(event.data);

    console.log(data);

    switch (data.message) {

        case "GAME FULL":
            info.innerHTML = "3 Players joined";
            break;
        case "POINT":
            info.innerHTML = "You Won this round, 1 point. pick again";
            break;
        case "NO POINT":
            info.innerHTML = "You Lost this round, 0 points- pick again";
            break;
        case "TIE":
            info.innerHTML = "Its a Tie, 0 points. pick again";
            break;
        case "PLAYER JOINED":
            updateScoreBoard(data);
            info.innerHTML = "a Player joined.";
            break;
        case "SCORE":
            updateScoreBoard(data);
            break;
        case "PLAYER LEFT":
            info.innerHTML = "a Player left. Click *Play* to rejoin.";
            updateScoreBoard(data);
            break;
        case "GAME OVER 1":
            info.innerHTML = "game over. Player 1 wins. Press *Play* if you want another game";
            updateScoreBoard(data);
            break;
        case "GAME OVER 2":
            info.innerHTML = "game over. Player 2 wins . Press *Play* if you want another game";
            updateScoreBoard(data);
            break;
        case "GAME OVER 3":
            info.innerHTML = "game over. Player 3 wins. Press *Play* if you want another game";
            updateScoreBoard(data);
            break;
        default:
            console.log("Got unknown message: " + data.message);
            break;
    }
};
//updates the scoreboard object:
function updateScoreBoard(data) {
    players.innerHTML = "";
    data.players.forEach(player => {
        let li = document.createElement("li");
        li.innerHTML = `${player.name}: ${player.score}`;
        players.appendChild(li);
    });
    
}


//listener for play button. Handles connections to server
play.addEventListener("click", () => {
    
    let port = 8080;
    ws = new WebSocket("ws://localhost:" + port);
    ws.onopen = onConnection;
    ws.onmessage = onMessage;

    ws.onclose = function (event) {
        console.log("Connection to server closed.");
    };
    
});
//listener for leave button. Handles disconnections to server
leave.addEventListener("click", () => {
    info.innerHTML = "You gave left the game. Press play to play again";
    ws.close();
    ws.onclose = function (event) {
        console.log("Connection to server closed.");
    };

});
//listeners for the rock/paper/scissor buttons
rock.addEventListener("click", () => {
    ws.send("rock");
    info.innerHTML = "You picked Rock";
});

paper.addEventListener("click", () => {
    ws.send("paper");
    info.innerHTML = "You picked Paper";
});
scissors.addEventListener("click", () => {
    ws.send("scissors");
    info.innerHTML = "You picked Scissors";
});