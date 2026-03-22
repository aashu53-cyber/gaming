// Game State
let mySymbol = 'X';
let botSymbol = 'O';
let myTurn = false;
let gameActive = false;

function startGame() {
    gameActive = true;
    myTurn = true;
    document.getElementById('start-menu').classList.add('hidden');
    document.getElementById('status').innerText = "Your Turn (X)";
}

// Handle Board Clicks
document.querySelectorAll('.cell').forEach(cell => {
    cell.addEventListener('click', () => {
        const index = cell.getAttribute('data-index');

        if (myTurn && gameActive && cell.innerText === '') {
            makeMove(index, mySymbol);
            myTurn = false;
            
            if (gameActive) {
                document.getElementById('status').innerText = "Bot is thinking...";
                // 1 Second Delay for Bot
                setTimeout(aiMove, 1000); 
            }
        }
    });
});

function makeMove(index, symbol) {
    const cell = document.querySelector(`[data-index="${index}"]`);
    cell.innerText = symbol;
    
    // Set colors: X is Deep Blue (Sky), O is Orange (Sun)
    cell.style.color = (symbol === 'X') ? '#2e86de' : '#ff9f43';
    
    checkWin();
}

function aiMove() {
    if (!gameActive) return;
    const cells = document.querySelectorAll('.cell');
    let empty = [];
    cells.forEach((c, i) => { if (c.innerText === '') empty.push(i); });

    if (empty.length > 0) {
        const random = empty[Math.floor(Math.random() * empty.length)];
        makeMove(random, botSymbol);
        
        if (gameActive) {
            myTurn = true;
            document.getElementById('status').innerText = "Your Turn (X)";
        }
    }
}

function checkWin() {
    const cells = document.querySelectorAll('.cell');
    const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

    for (let p of wins) {
        if (cells[p[0]].innerText && 
            cells[p[0]].innerText === cells[p[1]].innerText && 
            cells[p[0]].innerText === cells[p[2]].innerText) {
            
            const winner = cells[p[0]].innerText;
            endGame(winner === 'X' ? "You Won! 🌤️" : "Bot Won! ⛈️");
            return;
        }
    }

    if ([...cells].every(c => c.innerText !== '')) {
        endGame("It's a Draw! ☁️");
    }
}

function endGame(text) {
    gameActive = false;
    document.getElementById('result-text').innerText = text;
    document.getElementById('status').innerText = "Game Over";
    document.getElementById('result-menu').classList.remove('hidden');
}

function resetGame() {
    // Clear the board
    document.querySelectorAll('.cell').forEach(c => c.innerText = "");
    document.getElementById('result-menu').classList.add('hidden');
    gameActive = true;
    myTurn = true;
    document.getElementById('status').innerText = "Your Turn (X)";
}

function exitToDashboard() {
    // Call the parent window's close function
    if (window.parent && typeof window.parent.closeTheater === 'function') {
        window.parent.closeTheater();
    } else {
        window.location.href = '/';
    }
}