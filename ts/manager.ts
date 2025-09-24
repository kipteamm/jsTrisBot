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

type Scores = {
    well: number,
    gaps: number,
    flat: number,
    b2b: number
}

type Evaluation = {
    score: number;
    bestBoard: string,
    bestRot: string,
    bestScores: Scores,
    rot: number;
    col: number;
}

interface TrimmedBlock {
    matrix: number[][];
    offset: number;
    width: number;
}

function sendKeyEvent(name: string, keyCode: number) {
    const eventDict = {
        key: name,
        code: name,
        keyCode: keyCode,
        which: keyCode,
        bubbles: true,
        cancelable: true,
        composed: true
    }
    const keyboardEvent = new KeyboardEvent("keydown", eventDict);
    document.dispatchEvent(keyboardEvent);
    // console.log("DOWN", name);
    
    setTimeout(() => {
        const keyboardEvent = new KeyboardEvent("keyup", eventDict);
        document.dispatchEvent(keyboardEvent);
        // console.log("UP", name);
    }, Math.floor(Math.random() * (21) + 20))
}

window.addEventListener("keydown", (event) => {
    if (event.key !== "p") return;
    window.__game.paused = !window.__game.paused;
    if (!window.__game.paused) place();
}, true);

function stripMatrix(fullMatrix: number[][]): TrimmedBlock {
    let top = fullMatrix.length, bottom = -1;
    let left = fullMatrix[0].length, right = -1;

    for (let r = 0; r < fullMatrix.length; r++) {
        for (let c = 0; c < fullMatrix[r].length; c++) {
            if (fullMatrix[r][c] !== 0) {
                if (r < top) top = r;
                if (r > bottom) bottom = r;
                if (c < left) left = c;
                if (c > right) right = c;
            }
        }
    }

    if (right === -1) return { matrix: [], offset: 0, width: 0 };

    const width = right - left + 1;
    const trimmed = fullMatrix.slice(top, bottom + 1).map(row => row.slice(left, right + 1));

    return { matrix: trimmed, offset: left, width };
}

function getTopRow(board: number[][], blockMatrix: number[][], column: number) {
    const height = blockMatrix.length;
    const width = blockMatrix[0].length;

    for (let r = board.length - height; r >= 0; r--) {
        let collision = false;

        for (let br = 0; br < height && !collision; br++) {
            for (let bc = 0; bc < width && !collision; bc++) {
                if (blockMatrix[br][bc] !== 0 && board[r + br][column + bc] !== 0) {
                    collision = true;
                }
            }
        }

        if (!collision) return r;
    }

    return -1;
}

function calculateWellPotential(board: number[][]) {
    let emptyCount = 0;

    for (let col = 0; col < 10; col++) {
        const empty = board.filter(row => row[col] === 0).length;
        if (empty) emptyCount++
        else if (emptyCount) return -100;
    }

    return emptyCount > 1 ? -100 : 100;
}

function calculateFlatness(board: number[][], height: number) {
    let messiness = 0;
    for (let r = height + 1; r < 20; r++) {
        const percentage = board[r].filter(a => a !== 0).length / 10;
        const emptinessPenalty = (1 - percentage) * r;
        
        messiness += emptinessPenalty * emptinessPenalty;
        if (percentage === 1) break;
    }
    return messiness;
}

function calculateGaps(board: number[][]) {
    let gaps = 0;
    for (let r = 19; r > 0; r--) {
        const row = board[r];
        let rowGaps = 0;
        
        for (let c = 0; c < 10; c++) {
            if (row[c] === 0 && board[r - 1][c] !== 0) rowGaps++
        }

        gaps += rowGaps * r;
    }

    return gaps * 10;
}

function calculateB2B(board: number[][]) {
    let consecutiveFull = 0;

    for (let r = 0; r < board.length; r++) {
        if (board[r].every(cell => cell !== 0)) {
            consecutiveFull++;
            if (consecutiveFull === 4) return 100;
        } else {
            consecutiveFull = 0;
        }
    }

    return 0;
}

function evaluateBoard(blockMatrix: number[][], column: number): number {
    const board: number[][] = structuredClone(window.__game.matrix);
    const row = getTopRow(board, blockMatrix, column);
    if (row === -1) return Number.NEGATIVE_INFINITY;

    for (let r = row; r < (row + blockMatrix.length); r++) {
        for (let c = column; c < column + blockMatrix[0].length; c++) {
            board[r][c] = blockMatrix[r - row][c - column] || board[r][c];
        }
    }

    let height = 0;
    for (let i = 19; i >= 0; i--) {
        height = i;
        if (board[i].every(a => a === 0)) break;
    }

    const wellPotential = calculateWellPotential(board);
    const flatness = calculateFlatness(board, height);
    const gaps = calculateGaps(board);
    const maintainsB2B = calculateB2B(board);

    window.__game.testBoard = JSON.stringify(board);
    window.__game.testScores = {well: wellPotential * 2, flat: flatness * -2, gaps: gaps * -4, b2b: maintainsB2B * 5};

    return (wellPotential * 3) + (flatness * -2) + (gaps * -4) + (maintainsB2B * 5);
}

function evaluate(block: Block): Evaluation {
    const blockSet = window.__game.blockSets[block.set];
    let bestBoard = "";
    let bestRot = "";
    let bestScores = {well: 0, flat: 0, gaps: 0, b2b: 0};
    let bestScore = Number.NEGATIVE_INFINITY;
    let bestMove = {rot: 0, col: 0};

    for (let rot = 0; rot < 4; rot++) {
        const { matrix, offset, width } = stripMatrix(blockSet.blocks[block.id].blocks[rot]);

        for (let column = 0; column <= 9 - width; column++) {
            // THE OFFEST CAUSES ALL PIECES WITH A LEFTMOST COLUMN EMPTY TO NEVER BE PLACED IN THE LEFTMOST COLUMN OF THE BOARD
            const newScore = evaluateBoard(matrix, column + offset); 
            
            if (newScore < bestScore) continue; 
            bestScores = window.__game.testScores;
            bestBoard = JSON.stringify(window.__game.testBoard);
            bestRot = JSON.stringify(matrix);
            bestScore = newScore;
            bestMove = {rot: rot, col: column};
        }
    }

    return { score: bestScore, bestBoard: bestBoard, bestRot: bestRot, bestScores: bestScores, ...bestMove };
}

function delay(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function place() {
    if (window.__game.paused) return;
    console.log("_________________________")

    const activeResult = evaluate(window.__game.activeBlock);
    // console.log("ACTIVE: ", activeResult.score);

    let goalCol = activeResult.col;
    let rot = activeResult.rot;

    const holdBlock = window.__game.blockInHold? window.__game.blockInHold: window.__game.queue[0]
    let hold = false;
    
    if (window.__game.activeBlock.id !== holdBlock.id) {
        const holdResult = evaluate(holdBlock);
        // console.log("HOLD: ", holdResult.score);
        hold = holdResult.score > activeResult.score;
        
        if (hold) {
            goalCol = holdResult.col;
            rot = holdResult.rot;

            console.log("HOLD");
            console.log(holdResult.bestScores)
            console.log(holdResult.bestRot.replaceAll("],", "],\n "));   
            console.log(holdResult.bestBoard.replaceAll("],", "],\n ")) 
        }
    }

    if (hold) sendKeyEvent("c", 67);
    else {
        console.log(activeResult.bestScores)
        console.log(activeResult.bestRot.replaceAll("],", "],\n "));   
        console.log(activeResult.bestBoard.replaceAll("],", "],\n ")) 
    }

    console.log({rot: rot, col: goalCol});
    switch (rot) {
        case 0: break;
        case 1: sendKeyEvent("ArrowUp", 38); break;
        case 2: sendKeyEvent("a", 65); break;
        case 3: sendKeyEvent("z", 90); break;
    }

    let col = window.__game.activeBlock.pos.x;
    while (col !== goalCol) {
        if (col < goalCol) {
            sendKeyEvent("ArrowRight", 39);
            col++;
        } else {
            sendKeyEvent("ArrowLeft", 37);
            col--;
        }
        
        await delay(Math.floor(Math.random() * (21) + 40));
    }
    
    window.__game.hardDrop()
    if (!window.__game.gameEnded) place();
    // setTimeout(place, 1000);
}

document.addEventListener("GameCaptured", () => {
    // window.__game.activeBlock
    // window.__game.matrix
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

    function GameWrapper(...args: any[]) {
        const inst = new RealGame(...args);
        window.__game = inst;
        window.__game.paused = false;
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


