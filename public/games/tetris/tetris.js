/** 
 * CYBER TETRIS - PRO EDITION (17x22)
 */
const COLS = 17; 
const ROWS = 22; 
const BLOCK = 25; 

function closeTheater() { window.parent.postMessage('closeTheater', '*'); }

const COLORS = [null, '#00ffcc', '#ffd60a', '#c77dff', '#ff006e', '#00b4d8', '#f77f00', '#80ed99'];
const PIECES = [
    null,
    [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]], 
    [[1,1],[1,1]],                               
    [[0,1,0],[1,1,1],[0,0,0]],                   
    [[0,1,1],[1,1,0],[0,0,0]],                   
    [[1,1,0],[0,1,1],[0,0,0]],                   
    [[1,0,0],[1,1,1],[0,0,0]],                   
    [[0,0,1],[1,1,1],[0,0,0]],                   
];

let board, piece, pieceX, pieceY, pieceType, nextType, score, level, dropCounter, lastTime, gameRunning = false, animFrame;

function startGameManual() {
    document.getElementById('startOverlay').classList.add('hidden');
    document.getElementById('gameOverOverlay').classList.add('hidden');
    initGame();
}

function initGame() {
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    score = 0; level = 1;
    nextType = Math.floor(Math.random() * 7) + 1;
    spawnPiece();
    dropCounter = 0;
    lastTime = performance.now();
    gameRunning = true;
    updateUI();
    if (animFrame) cancelAnimationFrame(animFrame);
    requestAnimationFrame(gameLoop);
}

function spawnPiece() {
    pieceType = nextType;
    nextType = Math.floor(Math.random() * 7) + 1;
    piece = PIECES[pieceType].map(r => [...r]);
    // Centering logic for 17 columns
    pieceX = Math.floor(COLS / 2) - 1; 
    pieceY = 0;
    if (collides(piece, pieceX, pieceY)) endGame();
    drawNext();
}

function collides(p, ox, oy) {
    for (let y = 0; y < p.length; y++) {
        for (let x = 0; x < p[y].length; x++) {
            if (p[y][x]) {
                let nx = ox + x, ny = oy + y;
                if (nx < 0 || nx >= COLS || ny >= ROWS || (ny >= 0 && board[ny][nx])) return true;
            }
        }
    }
    return false;
}

function rotate(p) { return p[0].map((_, i) => p.map(row => row[i]).reverse()); }

function gameLoop(timestamp) {
    if (!gameRunning) return;
    const delta = timestamp - lastTime;
    lastTime = timestamp;
    dropCounter += delta;
    
    let speed = Math.max(100, 800 - (level * 50));
    
    if (dropCounter >= speed) {
        pieceY++;
        if (collides(piece, pieceX, pieceY)) {
            pieceY--; 
            piece.forEach((row, y) => row.forEach((v, x) => { if(v) board[pieceY+y][pieceX+x] = pieceType; }));
            for (let y = ROWS-1; y >= 0; y--) {
                if (board[y].every(v => v !== 0)) {
                    board.splice(y, 1); board.unshift(Array(COLS).fill(0));
                    score += 100 * level; y++;
                }
            }
            level = Math.floor(score/1000) + 1;
            spawnPiece();
            updateUI();
        }
        dropCounter = 0;
    }
    draw();
    animFrame = requestAnimationFrame(gameLoop);
}

function draw() {
    const ctx = document.getElementById('gameCanvas').getContext('2d');
    ctx.fillStyle = '#080810';
    ctx.fillRect(0, 0, 425, 550);
    
    // Board - Blocks fit perfectly to the last pixel
    board.forEach((row, y) => row.forEach((v, x) => {
        if(v) { 
            ctx.fillStyle = COLORS[v]; 
            ctx.fillRect(x*BLOCK, y*BLOCK, BLOCK-1, BLOCK-1); 
        }
    }));

    // Active Piece
    if(gameRunning) {
        piece.forEach((row, y) => row.forEach((v, x) => {
            if(v) { 
                ctx.fillStyle = COLORS[pieceType]; 
                ctx.fillRect((pieceX+x)*BLOCK, (pieceY+y)*BLOCK, BLOCK-1, BLOCK-1); 
            }
        }));
    }
}

function drawNext() {
    const nCtx = document.getElementById('nextCanvas').getContext('2d');
    nCtx.fillStyle = '#080810'; nCtx.fillRect(0,0,100,100);
    const p = PIECES[nextType];
    p.forEach((row, y) => row.forEach((v, x) => {
        if(v) { nCtx.fillStyle = COLORS[nextType]; nCtx.fillRect(x*15+30, y*15+30, 13, 13); }
    }));
}

function updateUI() {
    document.getElementById('score').innerText = score;
    document.getElementById('level').innerText = level;
}

function endGame() {
    gameRunning = false;
    document.getElementById('gameOverOverlay').classList.remove('hidden');
}

document.addEventListener('keydown', e => {
    if (!gameRunning) return;
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) e.preventDefault();
    if (e.key === 'ArrowLeft' && !collides(piece, pieceX-1, pieceY)) pieceX--;
    if (e.key === 'ArrowRight' && !collides(piece, pieceX+1, pieceY)) pieceX++;
    if (e.key === 'ArrowDown') dropCounter = 999;
    if (e.key === 'ArrowUp') { let r = rotate(piece); if (!collides(r, pieceX, pieceY)) piece = r; }
    if (e.key === ' ') { while(!collides(piece, pieceX, pieceY+1)) pieceY++; dropCounter = 999; }
    draw();
});