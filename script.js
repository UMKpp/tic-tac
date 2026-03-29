let board = Array(9).fill("");
let currentPlayer = "X";
let gameMode = "";
let gameActive = false;
let level = 1;
let isComputerTurn = false;

const scores = {
    X: 0,
    O: 0,
    draws: 0
};

const winningPatterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

document.addEventListener("DOMContentLoaded", () => {
    createBoard();
    updateCurrentPlayerDisplay();
    updateScoreboard();
    updateLevelDisplay();
});

function createBoard() {
    const gameBoard = document.getElementById("gameBoard");
    gameBoard.innerHTML = "";

    for (let i = 0; i < 9; i++) {
        const cell = document.createElement("button");
        cell.className = "cell";
        cell.dataset.index = i;
        cell.addEventListener("click", () => handleCellClick(i));
        gameBoard.appendChild(cell);
    }
}

function startGame(mode) {
    gameMode = mode;
    document.getElementById("gameModeSelection").classList.add("hidden");
    document.getElementById("gameInterface").classList.remove("hidden");
    document.getElementById("gameMode").textContent =
        `Mode: ${mode === "human" ? "Play with Friend" : "Play with Computer"}`;

    level = 1;
    updateLevelDisplay();
    resetGame();
}

function resetGame() {
    board = Array(9).fill("");
    currentPlayer = "X";
    gameActive = true;
    isComputerTurn = false;

    updateCurrentPlayerDisplay();
    document.getElementById('gameMessage').innerHTML = '';

    createBoard(); // Revert to static 3x3 board creation
}

function handleCellClick(index) {
    if (!gameActive || board[index] !== "" || isComputerTurn) {
        return;
    }

    makeMove(index, currentPlayer);

    const winnerData = getWinnerData();
    if (winnerData) {
        endRound(winnerData.player, winnerData.pattern);
        return;
    }

    if (isDraw()) {
        scores.draws++;
        updateScoreboard();
        gameActive = false;
        document.getElementById("gameMessage").innerHTML =
            `<div class="draw-message">🤝 It's a draw! Replay this level.</div>`;
        document.getElementById("gameControls").innerHTML = `
            <button class="reset-btn action-btn" onclick="resetGame()">New Game</button>
            <button class="mode-btn action-btn" onclick="backToModeSelection()">Home</button>
        `;
        return;
    }

    currentPlayer = currentPlayer === "X" ? "O" : "X";
    updateCurrentPlayerDisplay();

    if (gameMode === "computer" && currentPlayer === "O") {
        makeComputerMove();
    }
}

function makeMove(index, player) {
    board[index] = player;
    const cell = document.querySelector(`.cell[data-index="${index}"]`);
    cell.textContent = player;
    cell.classList.add(player.toLowerCase());
    cell.disabled = true;
}

function makeComputerMove() {
    if (!gameActive) return;

    isComputerTurn = true;

    document.getElementById('gameMessage').innerHTML =
        '<div class="computer-thinking">🤖 Computer is thinking...</div>';

    setTimeout(() => {
        const bestMove = getBestMove();

        if (bestMove !== null && gameActive) {
            makeMove(bestMove, "O");

            if (checkWinner(board, "O")) {
                document.getElementById('gameMessage').innerHTML =
                    '<div class="winner-message">🤖 Computer wins!</div>';
                gameActive = false;
                disableAllCells();
                isComputerTurn = false;
                return;
            }

            if (isDraw(board)) {
                document.getElementById('gameMessage').innerHTML =
                    '<div class="draw-message">🤝 It\'s a draw!</div>';
                gameActive = false;
                isComputerTurn = false;
                return;
            }

            currentPlayer = "X";
            updateCurrentPlayerDisplay();
        }

        isComputerTurn = false;
    }, 800);
}

function endRound(winner, pattern) {
    gameActive = false;
    scores[winner]++;
    updateScoreboard();
    highlightWinningCells(pattern);
    disableAllCells();

    const winnerText =
        gameMode === "computer" && winner === "O"
            ? "🤖 Computer wins this level!"
            : `🎉 Player ${winner} wins this level!`;

    if (level < 10) {
        level++;
        updateLevelDisplay();
        document.getElementById("gameMessage").innerHTML = `
            <div class="winner-message">${winnerText}</div>
            <div class="level-message">Welcome to Level ${level}!</div>
        `;
        document.getElementById("gameControls").innerHTML = `
            <button class="reset-btn action-btn" onclick="resetGame()">New Game</button>
            <button class="mode-btn action-btn" onclick="proceedToNextLevel()">Next Level</button>
            <button class="mode-btn action-btn" onclick="backToModeSelection()">Home</button>
        `;
    } else {
        document.getElementById("gameMessage").innerHTML = `
            <div class="winner-message">${winnerText}</div>
            <div class="level-message">🏆 You completed all 10 levels!</div>
        `;
        document.getElementById("gameControls").innerHTML = `
            <button class="reset-btn action-btn" onclick="resetGame()">New Game</button>
            <button class="mode-btn action-btn" onclick="backToModeSelection()">Home</button>
        `;
    }
}

function proceedToNextLevel() {
    resetGame();
}

function backToModeSelection() {
    document.getElementById("gameInterface").classList.add("hidden");
    document.getElementById("gameModeSelection").classList.remove("hidden");
    level = 1;
    updateLevelDisplay();
    resetGame();
}

function updateCurrentPlayerDisplay() {
    const playerText =
        gameMode === "computer" && currentPlayer === "O"
            ? "Current Player: Computer"
            : `Current Player: ${currentPlayer}`;

    document.getElementById("currentPlayer").textContent = playerText;
}

function updateScoreboard() {
    document.getElementById("playerXScore").textContent = scores.X;
    document.getElementById("playerOScore").textContent = scores.O;
    document.getElementById("draws").textContent = scores.draws;
}

function updateLevelDisplay() {
    document.getElementById("levelDisplay").textContent = `Level: ${level}`;
}

function disableAllCells() {
    document.querySelectorAll(".cell").forEach(cell => {
        cell.disabled = true;
    });
}

function highlightWinningCells(pattern) {
    pattern.forEach(index => {
        const cell = document.querySelector(`.cell[data-index="${index}"]`);
        if (cell) {
            cell.classList.add("winning-cell");
        }
    });
}

function getWinnerData() {
    for (const pattern of winningPatterns) {
        const [a, b, c] = pattern;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return { player: board[a], pattern };
        }
    }
    return null;
}

function isDraw() {
    return board.every(cell => cell !== "");
}

function getBestMove() {
    // Check if the bot can win in the next move
    for (let i = 0; i < board.length; i++) {
        if (board[i] === "") {
            board[i] = "O";
            if (checkWinner(board, "O")) {
                board[i] = ""; // Reset the move
                return i;
            }
            board[i] = "";
        }
    }

    // Block the player from winning in the next move
    for (let i = 0; i < board.length; i++) {
        if (board[i] === "") {
            board[i] = "X";
            if (checkWinner(board, "X")) {
                board[i] = ""; // Reset the move
                return i;
            }
            board[i] = "";
        }
    }

    // Take the center if available
    if (board[4] === "") {
        return 4;
    }

    // Take a random corner if available
    const corners = [0, 2, 6, 8];
    for (let corner of corners) {
        if (board[corner] === "") {
            return corner;
        }
    }

    // Take any available space
    for (let i = 0; i < board.length; i++) {
        if (board[i] === "") {
            return i;
        }
    }

    return null; // No moves left
}

function checkWinner(board, player) {
    for (const pattern of winningPatterns) {
        const [a, b, c] = pattern;
        if (board[a] !== "" && board[a] === board[b] && board[a] === board[c]) {
            return true;
        }
    }
    return false;
}

// Add logic for bot vs player game with 10 levels
function startBotVsPlayerGame() {
    gameMode = "computer";
    level = 1;
    document.getElementById("gameModeSelection").classList.add("hidden");
    document.getElementById("gameInterface").classList.remove("hidden");
    document.getElementById("gameMode").textContent = "Mode: Play with Computer";
    resetGame();
}

function levelUp() {
    if (level < 10) {
        level++;
        updateLevelDisplay();
        document.getElementById('gameMessage').innerHTML =
            `<div class="winner-message">🎉 Level Up! Welcome to Level ${level}!</div>`;
        resetGame();
    } else {
        document.getElementById('gameMessage').innerHTML =
            `<div class="winner-message">🏆 Congratulations! You completed all 10 levels!</div>`;
        gameActive = false;
    }
}