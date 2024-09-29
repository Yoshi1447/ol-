const boardSize = 10;
let board = [];
let ships = [];
let isBotMode = false;
let currentShip = null;
let placedShipsCount = 0;

document.getElementById('playVsBot').onclick = () => startGame(true);
document.getElementById('playMultiplayer').onclick = () => startGame(false);

function startGame(botMode) {
    isBotMode = botMode;
    board = Array.from({ length: boardSize }, () => Array(boardSize).fill(null));
    ships = [];
    placedShipsCount = 0;
    renderBoard();
    setupShipPlacement();
    document.getElementById('gameArea').style.display = 'block';
}

function setupShipPlacement() {
    const shipElements = document.querySelectorAll('.ship');
    shipElements.forEach(ship => {
        ship.ondragstart = (event) => {
            currentShip = { size: parseInt(ship.dataset.size), element: ship.cloneNode(true) };
        };
    });

    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.ondragover = (event) => {
            event.preventDefault();
        };
        cell.ondrop = (event) => {
            const cellIndex = Array.from(cells).indexOf(cell);
            const row = Math.floor(cellIndex / boardSize);
            const col = cellIndex % boardSize;
            placeShip(row, col);
        };
    });
}

function renderBoard() {
    const boardDiv = document.getElementById('board');
    boardDiv.innerHTML = '';
    board.forEach((row, r) => {
        row.forEach((cell, c) => {
            const cellDiv = document.createElement('div');
            cellDiv.className = 'cell';
            cellDiv.setAttribute('data-row', r);
            cellDiv.setAttribute('data-col', c);
            cellDiv.onclick = () => handleCellClick(r, c);
            boardDiv.appendChild(cellDiv);
        });
    });
}

function placeShip(row, col) {
    if (currentShip && canPlaceShip(row, col, currentShip.size)) {
        for (let i = 0; i < currentShip.size; i++) {
            board[row][col + i] = 'ship';
        }
        ships.push({ size: currentShip.size, start: { row, col }, orientation: 'horizontal' });
        placedShipsCount++;
        if (placedShipsCount === 10) {
            alert("Todos os navios posicionados! Agora, comece o jogo!");
        }
        renderBoard();
        currentShip.element.remove();
        currentShip = null;
    } else {
        alert("Não é possível posicionar o navio aqui!");
    }
}

function canPlaceShip(row, col, size) {
    if (col + size > boardSize) return false; // Excede o limite do tabuleiro
    for (let i = 0; i < size; i++) {
        if (board[row][col + i]) return false; // Espaço já ocupado
    }
    return true;
}

function handleCellClick(row, col) {
    if (board[row][col] === null) {
        board[row][col] = 'miss';
        document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`).classList.add('miss');
        checkGameState();
        if (isBotMode) botTurn();
    } else if (board[row][col] === 'ship') {
        board[row][col] = 'hit';
        document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`).classList.add('hit');
        explode(row, col);
        checkGameState();
    }
}

function explode(row, col) {
    const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
    cell.classList.add('explosion');
}

function botTurn() {
    let row, col;
    do {
        row = Math.floor(Math.random() * boardSize);
        col = Math.floor(Math.random() * boardSize);
    } while (board[row][col] !== null);
    handleCellClick(row, col);
}

function checkGameState() {
    const hits = board.flat().filter(cell => cell === 'hit').length;
    if (hits >= 17) { // 17 hits para afundar 10 barcos
        document.getElementById('message').innerText = 'Você ganhou!';
    }
}
