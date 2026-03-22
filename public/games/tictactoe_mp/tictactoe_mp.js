const socket = io();

// 1. Get Room Code from URL
const urlParams = new URLSearchParams(window.location.search);
const roomCode = urlParams.get('room');
const gameID = 'tictactoe_mp'; // Must match folder name

let mySymbol = null; 
let myTurn = false;
let gameActive = false;

let opponentReady = false;
let amIReady = false;
let rematchTimer = null;

const statusText = document.getElementById('status');
const displayCode = document.getElementById('display-code');
const rematchBtn = document.getElementById('rematch-btn');

if (roomCode) {
    displayCode.innerText = roomCode;
    // FIX: Send as an OBJECT to match rooms.js
    socket.emit('joinRoom', { roomCode: roomCode });
} else {
    statusText.innerText = "Error: Room Code Missing";
}

// 2. Listen for Server Events (Matches rooms.js)
socket.on('assignRole', (data) => {
    mySymbol = data.symbol;
    myTurn = (data.role === 'host'); 
    statusText.innerText = "Waiting for Opponent...";
});

socket.on('playerJoined', () => {
    gameActive = true;
    updateStatusUI();
});

// 3. Handle Local Moves
document.querySelectorAll('.cell').forEach(cell => {
    cell.addEventListener('click', () => {
        const index = cell.getAttribute('data-index');

        if (myTurn && gameActive && cell.innerText === '') {
            applyMove(index, mySymbol);

            // Sync via the Universal Relay in server.js
            socket.emit('sync_game_state', {
                roomCode: roomCode,
                gameID: gameID,
                payload: { type: 'MOVE', index: index, symbol: mySymbol }
            });

            myTurn = false;
            updateStatusUI();
        }
    });
});

// 4. Receive Moves from Opponent
socket.on('receive_game_update', (data) => {
    if (data.gameID === gameID) {
        const move = data.payload;
        if (move.type === 'MOVE') {
            applyMove(move.index, move.symbol);
            myTurn = true;
            updateStatusUI();
        }

        if(move.type === 'REMATCH_READY'){
            opponentReady = true;
            updateRematchStatusUI();
            checkIfBothReady();
        }
    }
});

function updateRematchStatusUI() {
    let count = 0;
    if (amIReady) count++;
    if (opponentReady) count++;
    document.getElementById('rematch-status').innerText = `Waiting for players (${count}/2)`;
}


function checkIfBothReady() {
    if (amIReady && opponentReady) {
        clearInterval(rematchTimer); // Stop the exit timer
        resetBoard();
    }
}

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

function resetBoard() {
    // 1. Clear the UI
    document.querySelectorAll('.cell').forEach(cell => {
        cell.innerText = '';
        cell.style.color = ''; // Reset colors
    });

    // 2. Hide Overlay
    document.getElementById('game-over-overlay').classList.add('hidden');

    // 3. Reset Game Logic
    gameActive = true;

    myTurn = (mySymbol === 'X');
    
    // Reset state for next time
    amIReady = false;
    opponentReady = false;

    updateStatusUI();
    console.log("Game Restarted!");
}


function endGame(text) {
    gameActive = false;
    document.getElementById('result-text').innerText = text;
    document.getElementById('game-over-overlay').classList.remove('hidden');

    // Reset readiness
    opponentReady = false;
    anIReady = false;
    document.getElementById('rematch-status').innerText = "Waiting for players(0/2)";
    rematchBtn.style.opacity = "1";
    rematchBtn.innerText = "Rematch";

    startCountdown();
}


// --- 2. 10-Second Timer Logic ---
function startCountdown() {
    let secondsLeft = 10;
    const timerDisplay = document.getElementById('seconds');
    timerDisplay.innerText = secondsLeft;

    if (rematchTimer) clearInterval(rematchTimer);

    rematchTimer = setInterval(() => {
        secondsLeft--;
        timerDisplay.innerText = secondsLeft;

        if (secondsLeft <= 0) {
            clearInterval(rematchTimer);
            if (!amIReady || !opponentReady) {
                exitGame(); // Redirect to dashboard if both aren't ready
            }
        }
    }, 1000);
}


// --- 3. Rematch Button Click ---
rematchBtn.addEventListener('click', () => {
    if (amIReady) return; // Prevent double clicking

    amIReady = true;
    rematchBtn.innerText = "Ready!";
    rematchBtn.style.opacity = "0.5";
    updateRematchStatusUI();

    // Tell the opponent we are ready
    socket.emit('sync_game_state', {
        roomCode: roomCode,
        gameID: gameID,
        payload: { type: 'REMATCH_READY', senderSymbol: mySymbol }
    });

    // If opponent was already ready, start the game
    checkIfBothReady();
});

function exitGame() {
    console.log("Exiting to dashboard...");
    
    // 1. Check if we are inside an iframe (Theater Mode)
    if (window.parent && window.parent !== window) {
        // Look for the specific function you wrote in your Dashboard JS
        if (typeof window.parent.closeTheater === 'function') {
            window.parent.closeTheater();
        } else {
            // Fallback: If function name is different, try redirecting the TOP window
            window.top.location.href = '/'; 
        }
    } else {
        // 2. If not in an iframe, just redirect normally
        window.location.href = '/';
    }
}