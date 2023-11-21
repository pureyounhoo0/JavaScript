
import BLOCKS from "./blocks.js";

// DOM
const playground = document.querySelector(".playground > ul");
const gameText = document.querySelector(".game-text");
const scoreDisplay = document.querySelector(".score");
const restartButton = document.querySelector(".game-text > button");

// Game settings
const GAME_ROWS = 20;
const GAME_COLS = 10;

// Variables
let score = 0;
let duration = 500;
let downInterval;
let tempMovingItem;
let isGameOver = false;

const movingItem = {
    type: "",
    direction: 3,
    top: 0,
    left: 0,
};


function init() {
    tempMovingItem = { ...movingItem };
    score = 0;
    duration = 500;
    updateScoreDisplay();
    for (let i = 0; i < GAME_ROWS; i++) {
        prependNewLine();
    }
    generateNewBlock();
    startGame();
}

function prependNewLine() {
    const li = document.createElement("li");
    const ul = document.createElement("ul");
    for (let j = 0; j < GAME_COLS; j++) {
        const matrix = document.createElement("li");
        ul.prepend(matrix);
    }
    li.prepend(ul);
    playground.prepend(li);
}

// Render the blocks on the playground
function renderBlocks(moveType = "") {
    const { type, direction, top, left } = tempMovingItem;
    const movingBlocks = document.querySelectorAll(".moving");
    movingBlocks.forEach(moving => {
        moving.classList.remove(type, "moving");
    });

    const reachedBottom = !checkBlockMovement("top", 1); // Check if the block has reached the bottom
    if (moveType === "top" && top === 0 && !reachedBottom) {
        return; // Do nothing if the block is at the top but not at the bottom
    }

    BLOCKS[type][direction].some(block => {
        const x = block[0] + left;
        const y = block[1] + top;
        const target = playground.childNodes[y] ? playground.childNodes[y].childNodes[0].childNodes[x] : null;
        const isAvailable = checkEmpty(target);
        if (isAvailable) {
            target.classList.add(type, "moving");
        } else {
            tempMovingItem = { ...movingItem };
            if (moveType === 'retry') {
                clearInterval(downInterval);
                showGameOverText();
            }
            setTimeout(() => {
                renderBlocks('retry');
                if (moveType === "top") {
                    seizeBlock();
                }
                renderBlocks();
            }, 0);
            return true;
        } 
    });

    movingItem.left = left;
    movingItem.top = top;
    movingItem.direction = direction;
}

function seizeBlock() {
    const movingBlocks = document.querySelectorAll(".moving");
    movingBlocks.forEach(moving => {
        moving.classList.remove("moving");
        moving.classList.add("seized");
    });

    checkLines();
    generateNewBlock();
}


function checkLines() {
    const childNodes = playground.childNodes;
    childNodes.forEach(child => {
        let matched = true;
        child.children[0].childNodes.forEach(li => {
            if (!li.classList.contains("seized")) {
                matched = false;
            }
        });
        if (matched) {
            child.remove();
            prependNewLine();
            score++;
            updateScoreDisplay();
        }
    });
}


function generateNewBlock() {
    clearInterval(downInterval);

    const blockArray = Object.entries(BLOCKS);
    const randomIndex = Math.floor(Math.random() * blockArray.length);
    movingItem.type = blockArray[randomIndex][0];
    movingItem.top = 0;
    movingItem.left = Math.floor(GAME_COLS / 2) - Math.floor(BLOCKS[movingItem.type][0].length / 2);
    movingItem.direction = 0;
    tempMovingItem = { ...movingItem };

    downInterval = setInterval(() => {
        moveBlock('top', 1);
    }, duration);

    renderBlocks();
}


function checkEmpty(target) {
    if (!target || target.classList.contains("seized")) {
        return false;
    }
    return true;
}


function checkBlockMovement(moveType, amount = 1) {
    const { type, direction, top, left } = tempMovingItem;

    for (const block of BLOCKS[type][direction]) {
        const x = block[0] + left;
        const y = block[1] + top + amount;

        if (y >= GAME_ROWS || (playground.childNodes[y] && !checkEmpty(playground.childNodes[y].childNodes[0].childNodes[x]))) {
            return false;
        }
    }

    return true;
}


function moveBlock(moveType, amount) {
    if (checkBlockMovement(moveType, amount)) {
        tempMovingItem[moveType] += amount;
        renderBlocks(moveType);
    } else if (moveType === 'top') {
        seizeBlock();
    }
}


function changeDirection() {
    tempMovingItem.direction = (tempMovingItem.direction + 1) % 4;
    renderBlocks();
}


function dropBlock() {
    clearInterval(downInterval);
    downInterval = setInterval(() => {
        moveBlock("top", 1);
    }, 10);
}


function showGameOverText() {
    gameText.style.display = "flex";
}


function updateScoreDisplay() {
    scoreDisplay.innerText = score;
}

document.addEventListener("keydown", e => {
    if (!isGameOver) {
        switch (e.keyCode) {
            case 39:
                moveBlock("left", 1);
                break;
            case 37:
                moveBlock("left", -1);
                break;
            case 40:
                moveBlock("top", 1);
                break;
            case 38:
                changeDirection();
                break;
            case 32:
                dropBlock();
                break;
            default:
                break;
        }
    }
});


restartButton.addEventListener("click", () => {
    playground.innerHTML = "";
    gameText.style.display = "none";
    isGameOver = false;
    init();
});


init();

function startGame() {
    const speedIncreaseInterval = 30000;

    setInterval(() => {
        duration = Math.max(100, duration - 50);
        clearInterval(downInterval);
        downInterval = setInterval(() => {
            moveBlock('top', 1);
        }, duration);
    }, speedIncreaseInterval);
}


