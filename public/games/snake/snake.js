/* 1. DOM ELEMENTS */
const gameBoard = document.querySelector(".board");
const highScoreBox = document.querySelector("#high-score");
const currentScoreBox = document.querySelector("#score");
const menuScreen = document.getElementById('menu-screen');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const menuTitle = document.getElementById('menu-title');

/* 2. GAME STATE VARIABLES */
let lastRenderTime = 0;
let currentScore = 0;
let highScore = 0;
let snakeSpeed = 3;
let gameStarted = false;

// Dynamic Grid Boundaries
let gridDimensions = { cols: 21, rows: 21 };

let snakeBody = [{ x: 10, y: 10 }];
let food = { x: 5, y: 5 };
let inputDirection = { x: 0, y: 0 };
let lastInputDirection = { x: 0, y: 0 };

/* 3. AUDIO ASSETS */
const foodSound = new Audio('music/food.mp3');
const gameOverSound = new Audio('music/gameover.mp3');

/* 4. DYNAMIC GRID LOGIC */
function updateBoardDimensions() {
    const cellSize = 30; // Target size for each square
    const width = gameBoard.clientWidth;
    const height = gameBoard.clientHeight;

    // Calculate how many squares fit into the current board space
    gridDimensions.cols = Math.floor(width / cellSize);
    gridDimensions.rows = Math.floor(height / cellSize);

    // Update CSS Grid properties dynamically
    gameBoard.style.gridTemplateColumns = `repeat(${gridDimensions.cols}, 1fr)`;
    gameBoard.style.gridTemplateRows = `repeat(${gridDimensions.rows}, 1fr)`;
}

/* 5. GAME CONTROL FUNCTIONS */
function startGame() {
    updateBoardDimensions(); // Refresh grid size before starting
    menuScreen.classList.add('hidden');
    
    // Reset Game State
    currentScore = 0;
    currentScoreBox.innerHTML = currentScore;
    snakeSpeed = 3;
    inputDirection = { x: 0, y: 0 };
    lastInputDirection = { x: 0, y: 0 };

    // Center snake based on new dimensions
    const centerX = Math.floor(gridDimensions.cols / 2);
    const centerY = Math.floor(gridDimensions.rows / 2);
    snakeBody = [{ x: centerX, y: centerY }];

    food = randomFoodPosition();
    gameStarted = true;
}

function handleGameOver() {
    gameStarted = false;
    gameOverSound.play();
    
    menuTitle.innerText = "Game Over!";
    startBtn.innerText = "Replay Game";
    menuScreen.classList.remove('hidden');
}

/* 6. CORE GAME ENGINE (Loop) */
function main(currentTime) {
    window.requestAnimationFrame(main);

    // Control frame rate based on snakeSpeed
    if ((currentTime - lastRenderTime) / 1000 < 1 / snakeSpeed) {
        return;
    }
    lastRenderTime = currentTime;

    if (gameStarted) {
        gameEngine();
    }
}

function gameEngine() {
    checkCollision();
    updateFood();
    moveSnake();
    drawSnake();
    drawFood();
}

/* 7. LOGIC FUNCTIONS */
function checkCollision() {
    if (isCollide(snakeBody)) {
        handleGameOver();
    }
}

function isCollide(snake) {
    // Collision with self
    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) return true;
    }
    // Collision with dynamic walls
    if (snake[0].x > gridDimensions.cols || snake[0].x < 1 || 
        snake[0].y > gridDimensions.rows || snake[0].y < 1) {
        return true;
    }
    return false;
}

function updateFood() {
    if (snakeBody[0].x === food.x && snakeBody[0].y === food.y) {
        foodSound.play();
        updateScore();
        
        // Grow snake
        snakeBody.push({ ...snakeBody[snakeBody.length - 1] });
        
        // Increase speed slightly
        snakeSpeed += 0.05;

        // Reposition food (ensure it's not on snake)
        let newFoodPosition;
        do {
            newFoodPosition = randomFoodPosition();
        } while (onSnake(newFoodPosition));
        food = newFoodPosition;
    }
}

function moveSnake() {
    const dir = getInputDirection();
    // Move body segments
    for (let i = snakeBody.length - 2; i >= 0; i--) {
        snakeBody[i + 1] = { ...snakeBody[i] };
    }
    // Move head
    snakeBody[0].x += dir.x;
    snakeBody[0].y += dir.y;
}

/* 8. HELPER FUNCTIONS */
function randomFoodPosition() {
    return {
        x: Math.floor(Math.random() * gridDimensions.cols) + 1,
        y: Math.floor(Math.random() * gridDimensions.rows) + 1
    };
}

function onSnake(position) {
    return snakeBody.some(segment => segment.x === position.x && segment.y === position.y);
}

function updateScore() {
    currentScore += 1;
    if (currentScore > highScore) {
        highScore = currentScore;
        localStorage.setItem("HighScore", JSON.stringify(highScore));
        highScoreBox.innerHTML = highScore;
    }
    currentScoreBox.innerHTML = currentScore;
}

function getInputDirection() {
    lastInputDirection = inputDirection;
    return inputDirection;
}

/* 9. RENDERING FUNCTIONS */
function drawSnake() {
    gameBoard.innerHTML = "";
    snakeBody.forEach((segment) => {
        const snakeElement = document.createElement("div");
        snakeElement.style.gridColumnStart = segment.x;
        snakeElement.style.gridRowStart = segment.y;
        snakeElement.classList.add("snake");
        gameBoard.appendChild(snakeElement);
    });
}

function drawFood() {
    const foodElement = document.createElement("div");
    foodElement.style.gridColumnStart = food.x;
    foodElement.style.gridRowStart = food.y;
    foodElement.classList.add("food");
    gameBoard.appendChild(foodElement);
}

/* 10. INITIALIZATION & LISTENERS */

// Load High Score
let savedHighScore = localStorage.getItem("HighScore");
if (savedHighScore !== null) {
    highScore = JSON.parse(savedHighScore);
    highScoreBox.innerHTML = highScore;
}

// Input listener
window.addEventListener('keydown', (e) => {

    if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight", " "].includes(e.key)) {
        e.preventDefault();
    }
    
    switch (e.key) {
        case 'ArrowUp':
            if (lastInputDirection.y !== 0) break;
            inputDirection = { x: 0, y: -1 };
            break;
        case 'ArrowDown':
            if (lastInputDirection.y !== 0) break;
            inputDirection = { x: 0, y: 1 };
            break;
        case 'ArrowRight':
            if (lastInputDirection.x !== 0) break;
            inputDirection = { x: 1, y: 0 };
            break;
        case 'ArrowLeft':
            if (lastInputDirection.x !== 0) break;
            inputDirection = { x: -1, y: 0 };
            break;
    }
});

// UI Listeners
startBtn.addEventListener('click', startGame);
if (restartBtn) restartBtn.addEventListener('click', startGame);

// Handle resize events
window.addEventListener('resize', updateBoardDimensions);

// Initial call to set dimensions and start loop
updateBoardDimensions();
window.requestAnimationFrame(main);