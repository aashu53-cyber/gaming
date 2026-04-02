// js/gameLoader.js

let activeGameId = null; // Tracks current game selection for MP room linking

/** Builds the game grid UI from the games data array */
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

/** Decides to launch singleplayer or show the multiplayer modal */
function selectGame(id) {
    activeGameId = id; 
    const gameData = games.find(g => g.id === id);

    if (gameData.type === 'single') {
        launchSingleplayerGame(id);
    } else {
        document.getElementById('modalTitle').innerText = gameData.name;
        document.getElementById('gameModal').style.display = 'flex';
    }
}

/** Launches multiplayer by passing roomCode to iFrame via URL */
function launchMultiplayerGame(roomCode) {
    if (!activeGameId) return console.error("No active game ID!");

    const gameData = games.find(g => g.id === activeGameId);
    document.getElementById('theater-title').innerText = `${gameData.name} - Room: ${roomCode}`;
    
    const frame = document.getElementById('game-frame');
    frame.src = `/games/${gameData.id}/${gameData.id}.html?room=${roomCode}`;
    
    closeModal();
    openTheaterUI();
}

/** Launches local game directly into the theater iFrame */
function launchSingleplayerGame(id) {
    const gameData = games.find(g => g.id === id);
    document.getElementById('theater-title').innerText = gameData.name;
    document.getElementById('game-frame').src = `/games/${id}/${id}.html`;
    openTheaterUI();
}

/** Shows game overlay and disables background scrolling */
function openTheaterUI() {
    document.getElementById('game-theater').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

/** Hides the room selection modal */
function closeModal() {
    document.getElementById('gameModal').style.display = 'none';
}

/** Exits game, clears iFrame source to stop processes, and restores scrolling */
function closeTheater() {
    document.getElementById('game-theater').style.display = 'none';
    document.getElementById('game-frame').src = ""; 
    document.body.style.overflow = 'auto';
}