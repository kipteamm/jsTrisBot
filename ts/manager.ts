type Block = {
    id: number;
    set: number;
    pos: {
        x: number;
        y: number;
    };
    rot: number;
    item: number;
};

type Evaluation = {
    score: number;
    rot: number;
    col: number;
}

function sendKeyEvent(name: string, keyCode: number) {
    try {
        const keyboardEvent = new KeyboardEvent('keydown', {
            key: name,
            code: name,
            keyCode: keyCode,
            which: keyCode,
            bubbles: true,
            cancelable: true,
            composed: true
        });

        document.dispatchEvent(keyboardEvent);
        console.log(name);
    } catch (err) {
        console.error("Error dispatching event:", err);
    }
}

function stripMatrix(matrix: number[][]) {
    const rowsStripped = matrix.filter(row => row.some(cell => cell !== 0));

    const colsToKeep: number[] = [];
    for (let col = 0; col < matrix[0].length; col++) {
        if (rowsStripped.some(row => row[col] !== 0)) {
            colsToKeep.push(col);
        }
    }
    
    return rowsStripped.map(row => colsToKeep.map(colIndex => row[colIndex]));
}

function getTopRow(board: number[][], blockMatrix: number[][], column: number) {
    blockMatrix = stripMatrix(blockMatrix);
    let blockRow = 0;
    
    for (let r = 19; r >= 0; r--) {
        const row = board[r].slice(column, blockMatrix[0].length);
        const isValid = row.every((value, index) => value === 0 || blockMatrix[blockRow][index] === 0);

        if (!isValid) continue;
        if (blockRow + 1 === blockMatrix.length) return r;

        blockRow++;
    }

    return -1;
}

function calculateWellPotential(board: number[][], height: number) {
    return 0;
}

function calculateFlatness(board: number[][], height: number) {
    let messiness = 0;
    for (let r = height + 1; r < 20; r++) {
        const percentage = board[r].filter(a => a !== 0).length / 10;
        const rowHeightPenalty = 20 - r;
        const emptinessPenalty = (1 - percentage) * rowHeightPenalty;
        
        messiness += emptinessPenalty * emptinessPenalty;
        if (percentage === 1) break;
    }
    return messiness;
}

function calculateGaps(board: number[][], height: number) {
    return 0;
}

function calculateB2B(board: number[][], height: number) {
    return 0;
}

function evaluateBoard(blockMatrix: number[][], column: number): number {
    const board: number[][] = structuredClone(window.__game.matrix);
    const row = getTopRow(board, blockMatrix, column);

    for (let r = row; r < (row + blockMatrix.length); r++) {
        for (let c = column; c < blockMatrix[0].length; c++) {
            board[r][c] = blockMatrix[r - row][c - column];
        }
    }

    let height = 0;
    for (let i = 19; i >= 0; i--) {
        height = i;
        if (board[i].every(a => a === 0)) break;
    }

    const wellPotential = calculateWellPotential(board, height);
    const flatness = calculateFlatness(board, height);
    const gaps = calculateGaps(board, height);
    const maintainsB2B = calculateB2B(board, height);

    // console.log(wellPotential, flatness, gaps, maintainsB2B);

    return (wellPotential * 2) + (flatness * -2) + (gaps * -3) + (maintainsB2B * 5);
}

function evaluate(block: Block): Evaluation {
    // loop over all rotations
    const blockSet = window.__game.blockSets[block.set];
    let bestScore = Number.NEGATIVE_INFINITY;
    let bestMove = {rot: 0, col: 0};

    for (let rot = 0; rot < 4; rot++) {
        const blockMatrix: number[][] = stripMatrix(blockSet.blocks[block.id].blocks[rot]);

        for (let column = 0; column < 9 - blockMatrix[0].length; column++) {
            const newScore: number = evaluateBoard(blockMatrix, column);
            
            if (newScore < bestScore) continue; 
            bestScore = newScore;
            bestMove = {rot: rot, col: column};
        }
    }
    
    return { score: bestScore, ...bestMove };
}

function shouldHold() {
    if (window.__game.activeBlock.id === window.__game.queue[0].id) return false;
    
    const activeResult = evaluate(window.__game.activeBlock);
    const holdResult = evaluate(window.__game.queue[0]);
    
    console.log("ACTIVE: ", activeResult.score);
    console.log("HOLD: ", holdResult.score);

    if (activeResult.score >= holdResult.score) {
        window.__game.nextMove = {col: activeResult.col, rot: activeResult.rot};
        return false;
    }

    window.__game.nextMove = {col: holdResult.col, rot: holdResult.rot}
    return true;
}

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function place() {
    if (window.__game.placedBlocks > 4) return;

    const hold = shouldHold();
    if (hold) sendKeyEvent("c", 67);
    console.log(window.__game.nextMove);

    switch (window.__game.nextMove.rot) {
        case 0: break;
        case 1: sendKeyEvent("z", 90); break;
        case 2: sendKeyEvent("ArrowUp", 38); break;
        case 3: sendKeyEvent("a", 65); break;
    }

    console.log(window.__game.activeBlock.pos.x);

    const goalCol = window.__game.nextMove.col;
    let col = window.__game.activeBlock.pos.x;
    while (col !== goalCol) {
        if (col < goalCol) {
            sendKeyEvent("ArrowRight", 39);
            col++;
        } else {
            sendKeyEvent("ArrowLeft", 37);
            col--;
        }
    
        await delay(Math.floor(Math.random() * 310) + 200);

    }

    window.__game.hardDrop()
    setTimeout(place, 1000);
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
    if (typeof window.Game === 'undefined') return setTimeout(waitForGame, 100);
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


