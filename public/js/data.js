// js/data.js
const games = [
    { 
        id: 'tictactoe_bot', 
        name: 'Tic Tac Toe (VS CPU)', 
        meta: '1 Player • Offline', 
        colorClass: 'ttt-bg', 
        type: 'single' 
    },
    { 
        id: 'tictactoe_mp', 
        name: 'Tic Tac Toe (Online)', 
        meta: '2 Players • Multiplayer', 
        colorClass: 'ttt-bg', 
        type: 'multi' 
    },
        { 
        id: 'tetris',
        name: 'Cyber Tetris', 
        meta: '2 Players • Multiplayer', 
        colorClass: 'tetris-bg', 
        type: 'single' 
    },
    { 
        id: 'snake', 
        name: 'Snake retro', 
        meta: '1 Player • Arcade', 
        colorClass: 'snake-bg', 
        type: 'single' 
    }
];

const sidebarIcons = [
    { id: 'home', icon: 'fas fa-home', active: true },
    { id: 'multiplayer', icon: 'fas fa-user-friends', active: false },
    { id: 'trophy', icon: 'fas fa-trophy', active: false }
];