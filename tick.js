// =====================
// Emoji Tic Tac Toe
// =====================

// Emoji options
const emojis = ["❌", "⭕", "🔥", "💎", "😎", "👑", "🐱", "🐶", "🍕", "⚡"];

// DOM Elements
const boardEl = document.getElementById("board");
const turnInfo = document.getElementById("turnInfo");
const startButton = document.getElementById("startGame");
const score1El = document.getElementById("score1");
const score2El = document.getElementById("score2");

const dropdownRegistry = {};
let openDropdownInstance = null;

// Game State
let board = [];
let size = 3;
let winLength = 3;
let currentPlayer = 1;
let gameOver = false;
let scores = { 1: 0, 2: 0 };
let winLineData = null;
let winLineElement = null;

// =====================
// Initialization
// =====================

if (startButton) {
  startButton.addEventListener("click", startGame);
}

window.addEventListener("DOMContentLoaded", () => {
  initDropdowns();
  turnInfo.textContent = "Select options";
});

function initDropdowns() {
  const dropdownNodes = document.querySelectorAll("[data-dropdown]");

  dropdownNodes.forEach(node => {
    const key = node.dataset.dropdown;
    if (!key) return;
    dropdownRegistry[key] = createDropdownInstance(node);
  });

  if (dropdownRegistry.p1Emoji && dropdownRegistry.p2Emoji) {
    const emojiOptions = emojis.map(symbol => ({ value: symbol, label: symbol }));
    dropdownRegistry.p1Emoji.setOptions(emojiOptions, { emit: false });
    dropdownRegistry.p2Emoji.setOptions(emojiOptions, { emit: false });
  }

  dropdownRegistry.mode?.setValue("single", { emit: false });
  dropdownRegistry.gridSize?.setValue("3", { emit: false });
  dropdownRegistry.p1Emoji?.setValue("❌", { emit: false });
  dropdownRegistry.p2Emoji?.setValue("⭕", { emit: false });

  if (dropdownRegistry.p1Emoji && dropdownRegistry.p2Emoji) {
    dropdownRegistry.p1Emoji.onChange(() => ensureDistinctEmojis("p1"));
    dropdownRegistry.p2Emoji.onChange(() => ensureDistinctEmojis("p2"));
  }
}

function ensureDistinctEmojis(changedKey) {
  const first = dropdownRegistry.p1Emoji?.getValue();
  const second = dropdownRegistry.p2Emoji?.getValue();

  if (!first || !second || first !== second) return;

  const fallback = emojis.find(emoji => emoji !== first);

  if (changedKey === "p1" && fallback) {
    dropdownRegistry.p2Emoji.setValue(fallback, { emit: false });
  } else if (changedKey === "p2" && fallback) {
    dropdownRegistry.p1Emoji.setValue(fallback, { emit: false });
  }
}

function createDropdownInstance(root) {
  const trigger = root.querySelector("[data-dropdown-trigger]");
  const valueEl = root.querySelector("[data-dropdown-value]");
  const menu = root.querySelector("[data-dropdown-menu]");

  if (!trigger || !valueEl || !menu) {
    return {
      root,
      trigger,
      menu,
      getValue: () => null,
      setValue: () => {},
      setOptions: () => {},
      close: () => {},
      onChange: () => {},
    };
  }

  let optionButtons = Array.from(menu.querySelectorAll("[data-dropdown-option]"));
  const listeners = [];
  let value = null;

  trigger.setAttribute("aria-expanded", "false");
  menu.setAttribute("tabindex", "-1");

  function notify(newValue) {
    listeners.forEach(callback => {
      try {
        callback(newValue);
      } catch (error) {
        console.error(error);
      }
    });
  }

  function setValueInternal(newValue, { label, emit = true } = {}) {
    if (newValue === undefined || newValue === null) return;

    const option = optionButtons.find(btn => btn.dataset.value === newValue);
    const display = label ?? option?.textContent.trim() ?? newValue;

    value = newValue;
    valueEl.textContent = display;
    root.dataset.value = newValue;

    optionButtons.forEach(btn => {
      const isSelected = btn.dataset.value === newValue;
      btn.classList.toggle("dropdown__option--selected", isSelected);
      btn.setAttribute("aria-selected", isSelected);
    });

    if (emit) {
      notify(newValue);
    }
  }

  function closeDropdown() {
    root.classList.remove("dropdown--open");
    trigger.setAttribute("aria-expanded", "false");
    if (openDropdownInstance === api) {
      openDropdownInstance = null;
    }
  }

  function openDropdown() {
    if (openDropdownInstance && openDropdownInstance !== api) {
      openDropdownInstance.close();
    }
    root.classList.add("dropdown--open");
    trigger.setAttribute("aria-expanded", "true");
    openDropdownInstance = api;
  }

  function attachOptionHandlers() {
    optionButtons.forEach(option => {
      option.setAttribute("role", "option");
      option.addEventListener("click", () => {
        setValueInternal(option.dataset.value, { label: option.textContent.trim() });
        closeDropdown();
      });
    });
  }

  function setOptionsInternal(items = [], { emit = false } = {}) {
    menu.innerHTML = "";

    const fragment = document.createDocumentFragment();
    items.forEach(item => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "dropdown__option";
      btn.dataset.dropdownOption = "";
      btn.dataset.value = item.value;
      btn.textContent = item.label ?? item.value;
      btn.setAttribute("role", "option");
      fragment.appendChild(btn);
    });

    menu.appendChild(fragment);
    optionButtons = Array.from(menu.querySelectorAll("[data-dropdown-option]"));
    attachOptionHandlers();

    const defaultValue = root.dataset.default;
    const fallbackValue = items.find(item => item.value === defaultValue)?.value ?? items[0]?.value;

    if (fallbackValue) {
      const fallbackLabel = items.find(item => item.value === fallbackValue)?.label;
      setValueInternal(fallbackValue, { label: fallbackLabel, emit });
    }
  }

  attachOptionHandlers();

  const api = {
    root,
    trigger,
    menu,
    getValue: () => value,
    setValue: (newValue, options) => setValueInternal(newValue, options),
    setOptions: (items, options) => setOptionsInternal(items, options),
    close: () => closeDropdown(),
    onChange(callback) {
      if (typeof callback === "function") {
        listeners.push(callback);
      }
    },
  };

  trigger.addEventListener("click", event => {
    event.stopPropagation();
    if (root.classList.contains("dropdown--open")) {
      closeDropdown();
    } else {
      openDropdown();
    }
  });

  menu.addEventListener("click", event => event.stopPropagation());

  const defaultValue = root.dataset.default;
  const fallbackValue = optionButtons.find(btn => btn.dataset.value === defaultValue)?.dataset.value
    ?? optionButtons[0]?.dataset.value;

  if (fallbackValue) {
    setValueInternal(fallbackValue, { emit: false });
  }

  return api;
}

document.addEventListener("click", event => {
  if (openDropdownInstance && !openDropdownInstance.root.contains(event.target)) {
    openDropdownInstance.close();
  }
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && openDropdownInstance) {
    openDropdownInstance.close();
  }
});

// =====================
// Game Setup
// =====================

function startGame() {
  if (!dropdownRegistry.gridSize || !dropdownRegistry.p1Emoji || !dropdownRegistry.p2Emoji || !dropdownRegistry.mode) {
    return;
  }

  const selectedSize = parseInt(dropdownRegistry.gridSize.getValue(), 10);
  size = Number.isInteger(selectedSize) ? selectedSize : 3;
  winLength = size === 3 ? 3 : 4;

  board = Array(size * size).fill("");
  currentPlayer = 1;
  gameOver = false;
  clearWinLine();

  boardEl.classList.remove("board--hidden");
  renderBoard();
  updateTurnText();
  startButton.textContent = "Start Game";
}

// =====================
// Board Rendering
// =====================

function renderBoard() {
  boardEl.innerHTML = "";
  // Use flexible columns so a 6x6 grid fits on small screens.
  boardEl.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
  // Expose the column count to CSS as a custom property for any layout tweaks.
  boardEl.style.setProperty('--cols', size);

  board.forEach((cell, index) => {
    const div = document.createElement("div");
    div.className = "cell";
    div.textContent = cell;
    div.addEventListener("click", () => handleMove(index));
    boardEl.appendChild(div);
  });
}

// =====================
// Game Logic
// =====================

function handleMove(index) {
  if (board[index] !== "" || gameOver) return;

  const emoji =
    currentPlayer === 1
      ? dropdownRegistry.p1Emoji?.getValue()
      : dropdownRegistry.p2Emoji?.getValue();

  if (!emoji) return;

  board[index] = emoji;
  renderBoard();

  const winInfo = checkWin(emoji);

  if (winInfo) {
    drawWinLine(winInfo);
    finishGame(`Player ${currentPlayer} Wins 🎉`);
    scores[currentPlayer]++;
    updateScores();
    return;
  }

  if (board.every(cell => cell !== "")) {
    finishGame("It's a Draw 🤝");
    return;
  }

  currentPlayer = currentPlayer === 1 ? 2 : 1;
  updateTurnText();

  // Computer move (Single Player)
  if (dropdownRegistry.mode?.getValue() === "single" && currentPlayer === 2) {
    setTimeout(computerMove, 350);
  }
}

// =====================
// Smarter Computer AI
// =====================

function computerMove() {
  if (gameOver) return;

  const aiEmoji = dropdownRegistry.p2Emoji?.getValue();
  const humanEmoji = dropdownRegistry.p1Emoji?.getValue();

  if (!aiEmoji || !humanEmoji) return;

  // 1️⃣ Win if possible
  let move = findBestMove(aiEmoji);
  if (move !== null) {
    handleMove(move);
    return;
  }

  // 2️⃣ Block opponent win
  move = findBestMove(humanEmoji);
  if (move !== null) {
    handleMove(move);
    return;
  }

  // 3️⃣ Take center if available
  const center = Math.floor(board.length / 2);
  if (board[center] === "") {
    handleMove(center);
    return;
  }

  // 4️⃣ Pick best available position
  const emptyCells = board
    .map((v, i) => (v === "" ? i : null))
    .filter(i => i !== null);

  if (emptyCells.length > 0) {
    const randomIndex =
      emptyCells[Math.floor(Math.random() * emptyCells.length)];
    handleMove(randomIndex);
  }
}

// Try a move and see if it wins
function findBestMove(emoji) {
  for (let i = 0; i < board.length; i++) {
    if (board[i] === "") {
      board[i] = emoji;
  const isWin = Boolean(checkWin(emoji));
      board[i] = "";
      if (isWin) return i;
    }
  }
  return null;
}

// =====================
// Win Detection (3x3 & 6x6)
// =====================

function checkWin(emoji) {
  const directions = [
    [1, 0],   // vertical
    [0, 1],   // horizontal
    [1, 1],   // diagonal \
    [1, -1],  // diagonal /
  ];

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      for (let [dx, dy] of directions) {
        let count = 0;
        const cells = [];

        for (let k = 0; k < winLength; k++) {
          const r = row + dx * k;
          const c = col + dy * k;

          if (
            r < 0 || c < 0 ||
            r >= size || c >= size ||
            board[r * size + c] !== emoji
          ) {
            break;
          }

          count++;
          cells.push(r * size + c);
        }

        if (count === winLength) {
          return {
            cells,
            start: { row, col },
            direction: { dx, dy },
          };
        }
      }
    }
  }
  return null;
}

// =====================
// UI Helpers
// =====================

function updateTurnText() {
  turnInfo.textContent = `Player ${currentPlayer}`;
}

function updateScores() {
  score1El.textContent = scores[1];
  score2El.textContent = scores[2];
}

function finishGame(message) {
  gameOver = true;
  turnInfo.textContent = message;
  startButton.textContent = "Restart Game";
}

function clearWinLine() {
  winLineData = null;
  boardEl.querySelectorAll(".cell--winner").forEach(cell => {
    cell.classList.remove("cell--winner");
  });
  if (winLineElement) {
    winLineElement.remove();
    winLineElement = null;
  }
}

function drawWinLine(info) {
  winLineData = info;

  requestAnimationFrame(() => {
    const cells = Array.from(boardEl.querySelectorAll(".cell"));
    info.cells.forEach(index => {
      const cell = cells[index];
      if (cell) {
        cell.classList.add("cell--winner");
      }
    });

    const firstCell = cells[info.cells[0]];
    const lastCell = cells[info.cells[info.cells.length - 1]];
    if (!firstCell || !lastCell) return;

    const boardRect = boardEl.getBoundingClientRect();
    const startRect = firstCell.getBoundingClientRect();
    const endRect = lastCell.getBoundingClientRect();

    const startX = startRect.left + startRect.width / 2 - boardRect.left;
    const startY = startRect.top + startRect.height / 2 - boardRect.top;
    const endX = endRect.left + endRect.width / 2 - boardRect.left;
    const endY = endRect.top + endRect.height / 2 - boardRect.top;

    const length = Math.hypot(endX - startX, endY - startY);
    const angle = Math.atan2(endY - startY, endX - startX) * (180 / Math.PI);

    if (!winLineElement) {
      winLineElement = document.createElement("div");
      winLineElement.className = "board__win-line";
      boardEl.appendChild(winLineElement);
    }

    winLineElement.style.width = `${length}px`;
    winLineElement.style.transform = `translate(${startX}px, ${startY}px) rotate(${angle}deg)`;
    winLineElement.style.opacity = "1";
  });
}