// js/main.js

function hostGame() {
    console.log("Create Room Button Clicked!");
    
    // 1. Generate a 5-character alphanumeric code
    const roomCode = Math.random().toString(36).substring(2, 7).toUpperCase();
    console.log("Generated Room Code:", roomCode);
    
    // 2. Launch the game
    if (typeof launchMultiplayerGame === "function") {
        launchMultiplayerGame(roomCode);
    } else {
        console.error("Error: launchMultiplayerGame function not found in gameLoader.js");
    }
}

function joinGame() {
    const input = document.getElementById('roomCodeInput');
    const code = input.value.trim().toUpperCase();

    if (code.length === 5) {
        launchMultiplayerGame(code);
    } else {
        alert("Please enter a 5-character code.");
    }
}

// Start Dashboard
document.addEventListener('DOMContentLoaded', () => {
    console.log("Dashboard Loaded. Ready for input.");
    renderSidebar();
    renderGameGrid();
});