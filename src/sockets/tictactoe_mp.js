const socket = io();

// Get Room Code from URL
const urlParams = new URLSearchParams(window.location.search);
const roomCode = urlParams.get('room');
const gameID = 'tictactoe'; // Identifies this game to the relay

// Game State
let mySymbol = null; // 'X' or 'O'
let myTurn = false;
let gameActive = false;

// UI Elements
const statusText = document.getElementById('status');
const displayCode = document.getElementById('display-code');

// 1. Join Room on Load
if (roomCode) {
    displayCode.innerText = roomCode;
    socket.emit('joinRoom', { roomCode: roomCode });
} else {
    statusText.innerText = "Error: Room Code Missing";
}

// 2. Receive Role from Server
socket.on('assignRole', (data) => {
    mySymbol = data.symbol;
    myTurn = (data.role === 'host'); // Host (X) always goes first
    statusText.innerText = "Waiting for Opponent...";
});

// 3. Start Game when Guest joins
socket.on('playerJoined', () => {
    gameActive = true;
    updateStatusUI();
});

// 4. Handle Moves (Sending)
document.querySelectorAll('.cell').forEach(cell => {
    cell.addEventListener('click', () => {
        const index = cell.getAttribute('data-index');

        if (myTurn && gameActive && cell.innerText === '') {
            // 1. Update Locally
            applyMove(index, mySymbol);

            // 2. Sync to Server via Universal Relay
            socket.emit('sync_game_state', {
                roomCode: roomCode,
                gameID: gameID,
                payload: { type: 'MOVE', index: index, symbol: mySymbol }
            });

            // 3. End Turn
            myTurn = false;
            updateStatusUI();
        }
    });
});

// 5. Receive Moves (Universal Receiver)
socket.on('receive_game_update', (data) => {
    // Only process if the data is meant for THIS game
    if (data.gameID === gameID) {
        const move = data.payload;
        if (move.type === 'MOVE') {
            applyMove(move.index, move.symbol);
            myTurn = true;
            updateStatusUI();
        }
    }
});

// 6. Core Gameplay Functions
function applyMove(index, symbol) {
    const cell = document.querySelector(`[data-index="${index}"]`);
    cell.innerText = symbol;
    cell.style.color = (symbol === 'X') ? '#ff7675' : '#55efc4';
    checkWinner();
}

function updateStatusUI() {
    if (!gameActive) return;
    statusText.innerText = myTurn ? `Your Turn (${mySymbol})` : "Opponent's Turn...";
    statusText.style.color = myTurn ? "#6c5ce7" : "#888";
}

function checkWinner() {
    const cells = document.querySelectorAll('.cell');
    const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    
    for (let p of wins) {
        if (cells[p[0]].innerText && cells[p[0]].innerText === cells[p[1]].innerText && cells[p[0]].innerText === cells[p[2]].innerText) {
            endGame(cells[p[0]].innerText + " Wins!");
            return;
        }
    }
    if ([...cells].every(c => c.innerText !== '')) {
        endGame("It's a Draw!");
    }
}

function endGame(text) {
    gameActive = false;
    document.getElementById('result-text').innerText = text;
    document.getElementById('game-over-overlay').classList.remove('hidden');
}

function exitGame() {
    if (window.parent && window.parent.closeTheater) {
        window.parent.closeTheater();
    } else {
        window.location.href = '/';
    }
}