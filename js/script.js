const boardSize = 4;
const solvedTiles = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0];
let tiles = [...solvedTiles];
let moveCount = 0;
let elapsedSeconds = 0;
let timerId = null;
let winDialogTimeoutId = null;
let gameFinished = false;

const board = document.getElementById("board");
const moveCountDisplay = document.getElementById("move-count");
const timeCountDisplay = document.getElementById("time-count");
const message = document.getElementById("message");
const newGameButton = document.getElementById("new-game-button");
const simpleGameButton = document.getElementById("simple-game-button");

function isSolved() {
  return tiles.every((tile, index) => tile === solvedTiles[index]);
}

function adjacentIndexes(emptyIndex) {
  const row = Math.floor(emptyIndex / boardSize);
  const column = emptyIndex % boardSize;
  const neighbors = [];

  if (row > 0) neighbors.push(emptyIndex - boardSize);
  if (row < boardSize - 1) neighbors.push(emptyIndex + boardSize);
  if (column > 0) neighbors.push(emptyIndex - 1);
  if (column < boardSize - 1) neighbors.push(emptyIndex + 1);

  return neighbors;
}

function renderBoard() {
  board.replaceChildren();

  tiles.forEach((tile, index) => {
    if (tile === 0) {
      const empty = document.createElement("div");
      empty.className = "empty";
      empty.setAttribute("aria-label", "Empty square");
      board.appendChild(empty);
      return;
    }

    const button = document.createElement("button");
    button.type = "button";
    button.className = "tile";
    button.setAttribute("aria-label", `Tile ${tile}`);
    const imageRow = Math.floor((tile - 1) / boardSize);
    const imageColumn = (tile - 1) % boardSize;
    button.style.backgroundPosition = `${imageColumn * 100 / (boardSize - 1)}% ${imageRow * 100 / (boardSize - 1)}%`;
    button.addEventListener("click", () => moveTile(index));
    board.appendChild(button);
  });

  moveCountDisplay.textContent = moveCount;
}

function moveTile(index) {
  if (gameFinished) return;
  const emptyIndex = tiles.indexOf(0);
  if (!adjacentIndexes(emptyIndex).includes(index)) return;

  [tiles[index], tiles[emptyIndex]] = [tiles[emptyIndex], tiles[index]];
  moveCount++;
  renderBoard();

  if (isSolved()) {
    gameFinished = true;
    clearInterval(timerId);
    timerId = null;
    const result = `Congratulations! You solved the puzzle in ${moveCount} move${moveCount === 1 ? "" : "s"} and ${elapsedSeconds} seconds.`;
    message.textContent = result;
    // Give the browser a chance to paint the solved board before the dialog blocks it.
    winDialogTimeoutId = setTimeout(() => {
      winDialogTimeoutId = null;
      if (window.confirm(`${result} Play again?`)) newGame();
    }, 100);
  }
}

function startGame() {
  clearTimeout(winDialogTimeoutId);
  winDialogTimeoutId = null;
  moveCount = 0;
  elapsedSeconds = 0;
  gameFinished = false;
  message.textContent = "";
  moveCountDisplay.textContent = "0";
  timeCountDisplay.textContent = "0";
  clearInterval(timerId);
  timerId = setInterval(() => {
    elapsedSeconds++;
    timeCountDisplay.textContent = elapsedSeconds;
  }, 1000);
  renderBoard();
}

function newGame() {
  tiles = [...solvedTiles];
  let previousEmptyIndex = -1;

  // Every shuffle step is a legal move, so the result stays solvable.
  for (let move = 0; move < 150; move++) {
    const emptyIndex = tiles.indexOf(0);
    const choices = adjacentIndexes(emptyIndex).filter(index => index !== previousEmptyIndex);
    const chosenIndex = choices[Math.floor(Math.random() * choices.length)];
    [tiles[chosenIndex], tiles[emptyIndex]] = [tiles[emptyIndex], tiles[chosenIndex]];
    previousEmptyIndex = emptyIndex;
  }

  if (isSolved()) {
    const emptyIndex = tiles.indexOf(0);
    const chosenIndex = adjacentIndexes(emptyIndex)[0];
    [tiles[chosenIndex], tiles[emptyIndex]] = [tiles[emptyIndex], tiles[chosenIndex]];
  }

  startGame();
}

function simpleGame() {
  tiles = [...solvedTiles];
  const emptyIndex = tiles.indexOf(0);
  const choices = adjacentIndexes(emptyIndex);
  const chosenIndex = choices[Math.floor(Math.random() * choices.length)];
  [tiles[chosenIndex], tiles[emptyIndex]] = [tiles[emptyIndex], tiles[chosenIndex]];
  startGame();
}

newGameButton.addEventListener("click", newGame);
simpleGameButton.addEventListener("click", simpleGame);
newGame();
