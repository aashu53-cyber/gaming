// js/gameLoader.js
let activeGameId = null; // Globally accessible in this file

function renderGameGrid() {
    const gameGrid = document.getElementById('game-grid');
    if (!gameGrid) return;

    gameGrid.innerHTML = games.map(game => `
        <div class="game-card tall ${game.colorClass}" onclick="selectGame('${game.id}')">
            <div class="card-overlay">
                <h3>${game.name}</h3>
                <p>${game.meta}</p>
            </div>
        </div>
    `).join('');
}

function selectGame(id) {
    activeGameId = id; // Store the ID of the game clicked (e.g., 'tictactoe_mp')
    const gameData = games.find(g => g.id === id);

    if (gameData.type === 'single') {
        launchSingleplayerGame(id);
    } else {
        // Show Modal
        document.getElementById('modalTitle').innerText = gameData.name;
        document.getElementById('gameModal').style.display = 'flex';
    }
}

function launchMultiplayerGame(roomCode) {
    console.log("Launching MP for Game ID:", activeGameId, "Room:", roomCode);
    
    if (!activeGameId) {
        console.error("No active game ID found!");
        return;
    }

    const gameData = games.find(g => g.id === activeGameId);
    
    // 1. Set the Title in the Theater
    document.getElementById('theater-title').innerText = `${gameData.name} - Room: ${roomCode}`;
    
    // 2. Set the iFrame Source with the Room Code
    const frame = document.getElementById('game-frame');
    frame.src = `/games/${gameData.id}/${gameData.id}.html?room=${roomCode}`;
    
    // 3. UI Transitions
    closeModal();
    document.getElementById('game-theater').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Helper functions
function launchSingleplayerGame(id) {
    const gameData = games.find(g => g.id === id);
    document.getElementById('theater-title').innerText = gameData.name;
    document.getElementById('game-frame').src = `/games/${id}/${id}.html`;
    document.getElementById('game-theater').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('gameModal').style.display = 'none';
}

function closeTheater() {
    document.getElementById('game-theater').style.display = 'none';
    document.getElementById('game-frame').src = "";
    document.body.style.overflow = 'auto';
}