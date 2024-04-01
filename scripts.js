// DOM elements
const boardContainer = document.getElementById('board-container');
const solutionBoard = document.getElementById('solution-board');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const solveBtn = document.getElementById('solve-btn');
const hideSolutionBtn = document.getElementById('hide-solution-btn');
const timerDisplay = document.getElementById('timer');
const boardSizeSelect = document.getElementById('board-size');
const themeSelect = document.getElementById('theme-select');
const playerNameInput = document.getElementById('player-name');
const slogan = document.getElementById('slogan');
const celebrationModal = document.getElementById('celebration');
const closeCelebrationBtn = document.getElementById('close-celebration');

// Game variables
let board = [];
let solvedBoard = [];
let difficulty = 9; // Default difficulty (9x9 board)
let timer;
let timerStarted = false;
let playerName = '';
let solutionShown = false;

// Array of funny and unique slogans
const slogans = [
    "Sudoku: Solving puzzles, one box at a time!",
    "Sudoku: The ultimate brain teaser!",
    "Sudoku: Where numbers meet logic!",
    "Sudoku: Unleash your inner math genius!",
    "Sudoku: The ultimate brain workout!",
    // Add more slogans here
];

// Function to initialize the game board
function initializeBoard() {
    // Clear existing board
    boardContainer.innerHTML = '';
    solutionBoard.innerHTML = '';

    // Get the selected board size
    const size = difficulty;

    // Create board based on difficulty
    for (let i = 0; i < size * size; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.contentEditable = false; // Disable cell editing initially
        boardContainer.appendChild(cell);
    }

    // Set board container dimensions
    boardContainer.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    boardContainer.style.gridTemplateRows = `repeat(${size}, 1fr)`;

    // Reset game variables
    board = [];
    solvedBoard = [];
    solveBtn.disabled = true;
    hideSolutionBtn.style.display = 'none';
}

// Function to generate a new Sudoku puzzle
function generateSudokuPuzzle() {
    const size = difficulty;
    const emptyCells = Math.floor(size * size * 0.5); // 50% of cells will be empty

    // Initialize board and solvedBoard with zeros
    board = Array(size * size).fill(0);
    solvedBoard = Array(size * size).fill(0);

    // Fill the solvedBoard with a valid Sudoku solution
    generateSudokuSolution(solvedBoard, size);

    // Remove some cells from the solvedBoard to create the puzzle
    let removedCells = 0;
    while (removedCells < emptyCells) {
        const row = Math.floor(Math.random() * size);
        const col = Math.floor(Math.random() * size);
        const index = row * size + col;

        if (solvedBoard[index] !== 0) {
            board[index] = solvedBoard[index];
            solvedBoard[index] = 0;
            removedCells++;
        }
    }

    // Update the board display
    updateBoardDisplay();
}

// Function to generate a valid Sudoku solution
function generateSudokuSolution(board, size) {
    function isValid(board, row, col, num, size) {
        // Check row and column
        for (let i = 0; i < size; i++) {
            if (board[row * size + i] === num || board[i * size + col] === num) {
                return false;
            }
        }

        // Check 3x3 box
        const boxRow = Math.floor(row / Math.sqrt(size)) * Math.sqrt(size);
        const boxCol = Math.floor(col / Math.sqrt(size)) * Math.sqrt(size);
        for (let i = boxRow; i < boxRow + Math.sqrt(size); i++) {
            for (let j = boxCol; j < boxCol + Math.sqrt(size); j++) {
                if (board[i * size + j] === num) {
                    return false;
                }
            }
        }

        return true;
    }

    function solveSudokuHelper(board, row, col, size) {
        if (row === size) {
            return true; // Base case: all cells filled
        }

        const nextRow = col === size - 1 ? row + 1 : row;
        const nextCol = col === size - 1 ? 0 : col + 1;

        if (board[row * size + col] !== 0) {
            return solveSudokuHelper(board, nextRow, nextCol, size); // Skip pre-filled cells
        }

        for (let num = 1; num <= size; num++) {
            if (isValid(board, row, col, num, size)) {
                board[row * size + col] = num;

                if (solveSudokuHelper(board, nextRow, nextCol, size)) {
                    return true; // Solution found
                }

                board[row * size + col] = 0; // Backtrack
            }
        }

        return false; // No solution found
    }

    solveSudokuHelper(board, 0, 0, size);
}
// Function to update the board display
function updateBoardDisplay() {
    const cells = boardContainer.querySelectorAll('.cell');
    cells.forEach((cell, index) => {
        cell.textContent = board[index] || '';
        cell.contentEditable = board[index] === 0; // Allow editing only for empty cells

        // Reset cell styles
        cell.classList.remove('default-value', 'user-input', 'incorrect');

        if (board[index] !== 0) {
            cell.classList.add('default-value');
        }
    });
}

// Function to solve the Sudoku puzzle
function solveSudoku() {
    // Update the solution board with the solved puzzle
    updateSolutionBoard();

    // Highlight incorrect user inputs
    highlightIncorrectInputs();

    // Show the "Hide Solution" button
    hideSolutionBtn.style.display = 'inline-block';
    solutionShown = true;
}

// Function to update the solution board
function updateSolutionBoard() {
    // Clear existing solution board
    solutionBoard.innerHTML = '';

    // Create solution board based on difficulty
    const size = difficulty;

    for (let i = 0; i < size * size; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell', 'solution-cell');
        cell.textContent = solvedBoard[i] || '';
        if (board[i] !== 0) {
            cell.classList.add('default-value');
        } else {
            cell.classList.add('solution-value');
        }
        solutionBoard.appendChild(cell);
    }

    // Set solution board dimensions
    solutionBoard.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    solutionBoard.style.gridTemplateRows = `repeat(${size}, 1fr)`;
}

// Function to highlight incorrect user inputs
function highlightIncorrectInputs() {
    const cells = boardContainer.querySelectorAll('.cell');
    cells.forEach((cell, index) => {
        const userInput = cell.textContent.trim();
        const correctValue = solvedBoard[index];
        if (userInput !== '' && userInput !== correctValue && board[index] === 0) {
            cell.classList.add('incorrect');
        } else {
            cell.classList.remove('incorrect');
        }
    });
}

// Function to handle user input
function handleUserInput(event) {
    const cell = event.target;
    const value = cell.textContent.trim();
    const index = Array.from(boardContainer.querySelectorAll('.cell')).indexOf(cell);

    // Validate user input (e.g., only allow numbers between 1 and difficulty)
    if (/^[1-9]$/.test(value) || value === '') {
        board[index] = value === '' ? 0 : parseInt(value);
        cell.classList.add('user-input');
    } else {
        cell.textContent = '';
    }
}

// Function to start the timer
function startTimer() {
    if (!timerStarted) {
        timerStarted = true;
        let seconds = 0;
        let minutes = 0;
        let hours = 0;

        timer = setInterval(() => {
            seconds++;
            if (seconds === 60) {
                seconds = 0;
                minutes++;
            }
            if (minutes === 60) {
                minutes = 0;
                hours++;
            }
            const formattedTime = `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
            timerDisplay.textContent = formattedTime;
        }, 1000);
    }
}

// Function to reset the timer
function resetTimer() {
    timerStarted = false;
    clearInterval(timer);
    timerDisplay.textContent = '00:00:00';
}

// Helper function to pad single digits with leading zero
function padZero(value) {
    return value.toString().padStart(2, '0');
}

// Function to check if the puzzle is solved
function checkSolution() {
    const cells = boardContainer.querySelectorAll('.cell');
    let isSolved = true;

    cells.forEach((cell, index) => {
        const userInput = cell.textContent.trim();
        const correctValue = solvedBoard[index];
        if (userInput !== correctValue) {
            isSolved = false;
        }
    });

    return isSolved;
}

// Function to show the celebration modal
function showCelebrationModal() {
    celebrationModal.style.display = 'block';
}

// Event listeners
startBtn.addEventListener('click', () => {
    startTimer();
    generateSudokuPuzzle();
    solveBtn.disabled = false;
});
resetBtn.addEventListener('click', resetGame);
solveBtn.addEventListener('click', solveSudoku);
hideSolutionBtn.addEventListener('click', () => {
    solutionBoard.style.display = 'none';
    hideSolutionBtn.style.display = 'none';
    solutionShown = false;
});

boardSizeSelect.addEventListener('change', () => {
    difficulty = parseInt(boardSizeSelect.value);
    initializeBoard();
});

themeSelect.addEventListener('change', applyTheme);

closeCelebrationBtn.addEventListener('click', () => {
    celebrationModal.style.display = 'none';
});

// Function to reset the game
function resetGame() {
    resetTimer();
    initializeBoard();
    solutionBoard.innerHTML = '';
    solutionBoard.style.display = 'grid';
    hideSolutionBtn.style.display = 'none';
    solutionShown = false;
    playerName = playerNameInput.value || 'Player';
    slogan.textContent = slogans[Math.floor(Math.random() * slogans.length)];
    solveBtn.disabled = true;
    celebrationModal.style.display = 'none';
}

// Function to apply the selected theme
function applyTheme() {
    const selectedTheme = themeSelect.value;
    document.body.className = selectedTheme;
}

// Initialize the game
resetGame();

// Add event listener for user input
const cells = boardContainer.querySelectorAll('.cell');
cells.forEach(cell => {
    cell.addEventListener('input', handleUserInput);
});

// Check for solved puzzle after every user input
cells.forEach(cell => {
    cell.addEventListener('input', () => {
        if (checkSolution() && solutionShown) {
            showCelebrationModal();
        }
    });
});