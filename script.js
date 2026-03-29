let board = [
    [" ", " ", " "],
    [" ", " ", " "],
    [" ", " ", " "]
];
let currentPlayer = "X";
let gameActive = true;
let gameMode = ""; // player 2 or pc
let isComputerTurn = false;
let scores = { X: 0, O: 0, draws: 0 };
let level = 1;

function startGame(mode) {
    gameMode = mode;
    document.getElementById('gameModeSelection').style.display = 'none';
    document.getElementById('gameInterface').style.display = 'block';

    const modeText = mode === 'human' ? '👥 Two Players' : '🤖 vs Computer';
    document.getElementById('gameMode').textContent = modeText;

    resetGame();
    initializeBoard();
}

function backToModeSelection() {
    document.getElementById('gameModeSelection').style.display = 'block';
    document.getElementById('gameInterface').style.display = 'none';
    gameMode = "";
}

function initializeBoard() {
    const gameBoard = document.getElementById('gameBoard');
    gameBoard.innerHTML = '';

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            const cell = document.createElement('button');
            cell.className = 'cell';
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.onclick = () => makeMove(i, j, cell);
            gameBoard.appendChild(cell);
        }
    }
}

function makeMove(row, col, cellElement) {
    if (!gameActive || board[row][col] !== " " || isComputerTurn) {
        return;
    }

    board[row][col] = currentPlayer;
    cellElement.textContent = currentPlayer;
    cellElement.classList.add(currentPlayer.toLowerCase());
    cellElement.disabled = true;

    if (checkWinner(board, currentPlayer)) {
        let winnerText = currentPlayer;
        if (gameMode === 'computer') {
            winnerText = currentPlayer === 'X' ? 'You' : 'Computer';
        }
        document.getElementById('gameMessage').innerHTML =
            `<div class="winner-message">🎉 ${winnerText} wins!</div>`;
        gameActive = false;
        disableAllCells();

        // Update scores
        scores[currentPlayer]++;
        updateScoreboard();
        highlightWinningCells(board, currentPlayer);

        // Level up
        if (gameMode === 'computer' && currentPlayer === 'X') {
            levelUp();
        }
        return;
    }

    if (isDraw(board)) {
        document.getElementById('gameMessage').innerHTML =
            `<div class="draw-message">🤝 It's a draw!</div>`;
        gameActive = false;

        // Update scores
        scores.draws++;
        updateScoreboard();
        return;
    }

    currentPlayer = currentPlayer === "X" ? "O" : "X";
    updateCurrentPlayerDisplay();

    if (gameMode === 'computer' && currentPlayer === 'O') {
        setTimeout(makeComputerMove, 500);
    }
}

function updateCurrentPlayerDisplay() {
    let playerText = currentPlayer;
    if (gameMode === 'computer') {
        playerText = currentPlayer === 'X' ? 'Your turn (X)' : 'Computer thinking... (O)';
    } else {
        playerText = `Player ${currentPlayer}`;
    }
    document.getElementById('currentPlayer').textContent = `Current: ${playerText}`;
}

function makeComputerMove() {
    if (!gameActive) return;

    isComputerTurn = true;

    document.getElementById('gameMessage').innerHTML =
        '<div class="computer-thinking">🤖 Computer is thinking...</div>';

    const bestMove = getBestMove();

    setTimeout(() => {
        if (bestMove && gameActive) {
            const cellIndex = bestMove.row * 3 + bestMove.col;
            const cellElement = document.querySelectorAll('.cell')[cellIndex];

            document.getElementById('gameMessage').innerHTML = '';

            // Computer makes its move
            board[bestMove.row][bestMove.col] = 'O';
            cellElement.textContent = 'O';
            cellElement.classList.add('o');
            cellElement.disabled = true;

            // Check for winner
            if (checkWinner(board, 'O')) {
                document.getElementById('gameMessage').innerHTML =
                    '<div class="winner-message">🤖 Computer wins!</div>';
                gameActive = false;
                disableAllCells();
                isComputerTurn = false;
                return;
            }

            // Check for draw
            if (isDraw(board)) {
                document.getElementById('gameMessage').innerHTML =
                    '<div class="draw-message">🤝 It\'s a draw!</div>';
                gameActive = false;
                isComputerTurn = false;
                return;
            }

            currentPlayer = 'X';
            updateCurrentPlayerDisplay();
        }
        isComputerTurn = false;
    }, 800);
}

function getBestMove() {
    if (level <= 3) {
        return getRandomMove();
    } else if (level <= 6) {
        return getIntermediateMove();
    } else {
        return getAdvancedMove();
    }
}

function getRandomMove() {
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[i][j] === " ") {
                return { row: i, col: j };
            }
        }
    }
    return null;
}

function getIntermediateMove() {
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[i][j] === " ") {
                board[i][j] = "O";
                if (checkWinner(board, "O")) {
                    board[i][j] = " ";
                    return { row: i, col: j };
                }
                board[i][j] = " ";
            }
        }
    }

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[i][j] === " ") {
                board[i][j] = "X";
                if (checkWinner(board, "X")) {
                    board[i][j] = " ";
                    return { row: i, col: j };
                }
                board[i][j] = " ";
            }
        }
    }

    if (board[1][1] === " ") {
        return { row: 1, col: 1 };
    }

    const corners = [{ row: 0, col: 0 }, { row: 0, col: 2 }, { row: 2, col: 0 }, { row: 2, col: 2 }];
    for (let corner of corners) {
        if (board[corner.row][corner.col] === " ") {
            return corner;
        }
    }

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[i][j] === " ") {
                return { row: i, col: j };
            }
        }
    }

    return null;
}

function checkWinner(board, player) {
    // check rows
    for (let i = 0; i < 3; i++) {
        if (board[i][0] === player && board[i][1] === player && board[i][2] === player) {
            return true;
        }
    }

    // check columns
    for (let i = 0; i < 3; i++) {
        if (board[0][i] === player && board[1][i] === player && board[2][i] === player) {
            return true;
        }
    }

    // check diagonals
    if (board[0][0] === player && board[1][1] === player && board[2][2] === player) {
        return true;
    }
    if (board[0][2] === player && board[1][1] === player && board[2][0] === player) {
        return true;
    }

    return false;
}

function isDraw(board) {
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[i][j] === " ") {
                return false;
            }
        }
    }
    return true;
}

function disableAllCells() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => cell.disabled = true);
}

function resetGame() {
    board = [
        [" ", " ", " "],
        [" ", " ", " "],
        [" ", " ", " "]
    ];
    currentPlayer = "X";
    gameActive = true;
    isComputerTurn = false;

    updateCurrentPlayerDisplay();
    document.getElementById('gameMessage').innerHTML = '';

    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.textContent = '';
        cell.className = 'cell';
        cell.disabled = false;
    });
}

function updateScoreboard() {
    document.getElementById('playerXScore').textContent = scores.X;
    document.getElementById('playerOScore').textContent = scores.O;
    document.getElementById('draws').textContent = scores.draws;
}

function highlightWinningCells(board, player) {
    const winningCombination = getWinningCombination(board, player);
    if (winningCombination) {
        winningCombination.forEach(([row, col]) => {
            const cellIndex = row * 3 + col;
            const cellElement = document.querySelectorAll('.cell')[cellIndex];
            cellElement.classList.add('winning-cell');
        });
    }
}

function getWinningCombination(board, player) {
    // Check rows
    for (let i = 0; i < 3; i++) {
        if (board[i][0] === player && board[i][1] === player && board[i][2] === player) {
            return [[i, 0], [i, 1], [i, 2]];
        }
    }

    // Check columns
    for (let i = 0; i < 3; i++) {
        if (board[0][i] === player && board[1][i] === player && board[2][i] === player) {
            return [[0, i], [1, i], [2, i]];
        }
    }

    // Check diagonals
    if (board[0][0] === player && board[1][1] === player && board[2][2] === player) {
        return [[0, 0], [1, 1], [2, 2]];
    }
    if (board[0][2] === player && board[1][1] === player && board[2][0] === player) {
        return [[0, 2], [1, 1], [2, 0]];
    }

    return null;
}

function levelUp() {
    if (level < 10) {
        level++;
        updateLevelDisplay();
        document.getElementById('gameMessage').innerHTML =
            `<div class="winner-message">🎉 Level Up! Welcome to Level ${level}!</div>`;
        document.getElementById('gameControls').innerHTML = `
            <button class="reset-btn" onclick="resetGame()">🔄 New Game</button>
            <button class="mode-btn" onclick="proceedToNextLevel()">⏭️ Proceed to Level ${level}</button>
            <button class="mode-btn" onclick="backToModeSelection()">🏠 Home</button>
        `;
    } else {
        document.getElementById('gameMessage').innerHTML =
            `<div class="winner-message">🏆 Congratulations! You completed all 10 levels!</div>`;
        gameActive = false;
        document.getElementById('gameControls').innerHTML = `
            <button class="reset-btn" onclick="resetGame()">🔄 New Game</button>
            <button class="mode-btn" onclick="backToModeSelection()">🏠 Home</button>
        `;
    }
}

function proceedToNextLevel() {
    resetGame();
    document.getElementById('gameMessage').innerHTML = '';
    if (gameMode === 'computer' && currentPlayer === 'O') {
        setTimeout(makeComputerMove, 500); // Ensure bot starts if it's its turn
    }
}