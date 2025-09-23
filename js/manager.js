"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function sendKeyEvent(name, keyCode) {
    try {
        const eventDict = {
            key: name,
            code: name,
            keyCode: keyCode,
            which: keyCode,
            bubbles: true,
            cancelable: true,
            composed: true
        };
        const keyboardEvent = new KeyboardEvent("keydown", eventDict);
        document.dispatchEvent(keyboardEvent);
        // console.log("DOWN", name);
        setTimeout(() => {
            const keyboardEvent = new KeyboardEvent("keyup", eventDict);
            document.dispatchEvent(keyboardEvent);
            // console.log("UP", name);
        }, Math.floor(Math.random() * (21) + 20));
    }
    catch (err) {
        console.error("Error dispatching event:", err);
    }
}
function stripMatrix(fullMatrix) {
    let top = fullMatrix.length, bottom = -1;
    let left = fullMatrix[0].length, right = -1;
    for (let r = 0; r < fullMatrix.length; r++) {
        for (let c = 0; c < fullMatrix[r].length; c++) {
            if (fullMatrix[r][c] !== 0) {
                if (r < top)
                    top = r;
                if (r > bottom)
                    bottom = r;
                if (c < left)
                    left = c;
                if (c > right)
                    right = c;
            }
        }
    }
    if (right === -1)
        return { matrix: [], offset: 0, width: 0 };
    const width = right - left + 1;
    const trimmed = fullMatrix.slice(top, bottom + 1).map(row => row.slice(left, right + 1));
    return { matrix: trimmed, offset: left, width };
}
function getAbsoluteLength(matrix) {
    let length = 4;
    for (let c = 0; c < 4; c++) {
        const column = matrix.map(row => row[c]);
        if (column.every(a => a === 0))
            length--;
    }
    console.error("THIS SHOULD NOT BE USED!!! TAKE Z OR S ROTATIONS 1 FOR INSTANCE");
    return length;
}
function getTopRow(board, blockMatrix, column) {
    let blockRow = 0;
    for (let r = 19; r >= 0; r--) {
        const row = board[r].slice(column, blockMatrix[0].length);
        const isValid = row.every((value, index) => value === 0 || blockMatrix[blockRow][index] === 0);
        if (!isValid)
            continue;
        if (blockRow + 1 === blockMatrix.length)
            return r;
        blockRow++;
    }
    return -1;
}
function calculateWellPotential(board, height) {
    return 0;
}
function calculateFlatness(board, height) {
    let messiness = 0;
    for (let r = height + 1; r < 20; r++) {
        const percentage = board[r].filter(a => a !== 0).length / 10;
        const emptinessPenalty = (1 - percentage) * r;
        messiness += emptinessPenalty * emptinessPenalty;
        if (percentage === 1)
            break;
    }
    return messiness;
}
function calculateGaps(board, height) {
    let gaps = 0;
    for (let r = 19; r > 0; r--) {
        const row = board[r];
        let rowGaps = 0;
        for (let c = 0; c < 10; c++) {
            if (row[c] === 0 && board[r - 1][c] !== 0)
                rowGaps++;
        }
        gaps += rowGaps * r;
    }
    return gaps * 10;
}
function calculateB2B(board, height) {
    return 0;
}
function evaluateBoard(blockMatrix, column) {
    const board = structuredClone(window.__game.matrix);
    const row = getTopRow(board, blockMatrix, column);
    for (let r = row; r < (row + blockMatrix.length); r++) {
        for (let c = column; c < column + blockMatrix[0].length; c++) {
            board[r][c] = blockMatrix[r - row][c - column];
        }
    }
    let height = 0;
    for (let i = 19; i >= 0; i--) {
        height = i;
        if (board[i].every(a => a === 0))
            break;
    }
    const wellPotential = calculateWellPotential(board, height);
    const flatness = calculateFlatness(board, height);
    const gaps = calculateGaps(board, height);
    const maintainsB2B = calculateB2B(board, height);
    window.__game.testBoard = JSON.stringify(board);
    window.__game.testScores = { well: wellPotential, flat: flatness, gaps: gaps, b2b: maintainsB2B };
    return (wellPotential * 2) + (flatness * -2) + (gaps * -3) + (maintainsB2B * 5);
}
function evaluate(block) {
    // loop over all rotations
    const blockSet = window.__game.blockSets[block.set];
    let bestBoard = "";
    let bestRot = "";
    let bestScores;
    let bestScore = Number.NEGATIVE_INFINITY;
    let bestMove = { rot: 0, col: 0 };
    for (let rot = 0; rot < 4; rot++) {
        const { matrix, offset, width } = stripMatrix(blockSet.blocks[block.id].blocks[rot]);
        for (let column = 0; column <= 9 - width; column++) {
            const newScore = evaluateBoard(matrix, column + offset);
            if (newScore < bestScore)
                continue;
            bestScores = window.__game.testScores;
            bestBoard = window.__game.testBoard;
            bestRot = JSON.stringify(matrix);
            bestScore = newScore;
            bestMove = { rot: rot, col: column };
        }
    }
    console.log(bestRot.replaceAll("],", "],\n "));
    // console.log(bestBoard.replaceAll("],", "],\n "));
    console.log(`wellPotential ${bestScores.well * 2}, flatness ${bestScores.flat * -2}, gaps ${bestScores.gaps * -3}, b2b ${bestScores.b2b * 5}`);
    return Object.assign({ score: bestScore }, bestMove);
}
function shouldHold() {
    if (window.__game.activeBlock.id === window.__game.queue[0].id)
        return false;
    const activeResult = evaluate(window.__game.activeBlock);
    console.log("ACTIVE: ", activeResult.score);
    const holdResult = evaluate(window.__game.queue[0]);
    console.log("HOLD: ", holdResult.score);
    if (activeResult.score >= holdResult.score) {
        window.__game.nextMove = { col: activeResult.col, rot: activeResult.rot };
        return false;
    }
    window.__game.nextMove = { col: holdResult.col, rot: holdResult.rot };
    return true;
}
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function place() {
    return __awaiter(this, void 0, void 0, function* () {
        if (window.__game.placedBlocks > 3)
            return;
        const hold = shouldHold();
        if (hold)
            sendKeyEvent("c", 67);
        console.log(window.__game.nextMove);
        switch (window.__game.nextMove.rot) {
            case 0: break;
            case 1:
                sendKeyEvent("ArrowUp", 38);
                break;
            case 2:
                sendKeyEvent("a", 65);
                break;
            case 3:
                sendKeyEvent("z", 90);
                break;
        }
        const goalCol = window.__game.nextMove.col;
        let col = window.__game.activeBlock.pos.x;
        while (col !== goalCol) {
            if (col < goalCol) {
                sendKeyEvent("ArrowRight", 39);
                col++;
            }
            else {
                sendKeyEvent("ArrowLeft", 37);
                col--;
            }
            yield delay(Math.floor(Math.random() * (21) + 40));
        }
        window.__game.hardDrop();
        setTimeout(place, 1000);
    });
}
document.addEventListener("GameCaptured", () => {
    // window.__game.activeBlock
    // window.__game.matrix board
    // window.__game.queue
    // window.__game.blockInHold
    // window.__game.holdBlock()
    // window.__game.blockSets[window.__game.activeBlock.set]
    // window.__game.checkkIntersection(x, y, null) not sure tbh
    place();
});
function waitForGame() {
    if (typeof window.Game === 'undefined')
        return setTimeout(waitForGame, 100);
    const RealGame = window.Game;
    function GameWrapper(...args) {
        const inst = new RealGame(...args);
        window.__game = inst;
        console.log("GAME CAPTURED");
        setTimeout(() => {
            document.dispatchEvent(new CustomEvent("GameCaptured"));
        }, 3000);
        return inst;
    }
    GameWrapper.prototype = RealGame.prototype;
    window.Game = GameWrapper;
}
waitForGame();
