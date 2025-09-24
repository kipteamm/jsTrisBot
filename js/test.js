function stripMatrix(fullMatrix) {
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
    // const rowsStripped = matrix.filter(row => row.some(cell => cell !== 0));

    // const colsToKeep = [];
    // for (let col = 0; col < matrix[0].length; col++) {
    //     if (rowsStripped.some(row => row[col] !== 0)) {
    //         colsToKeep.push(col);
    //     }
    // }
    
    // return rowsStripped.map(row => colsToKeep.map(colIndex => row[colIndex]));
}

function getAbsoluteLength(matrix) {
    let length = 4;
    for (let c = 0; c < 4; c++) {
        const column = matrix.map(row => row[c]);
        if (column.every(a => a === 0)) length--;
    }
    return length;
}

function getTopRow(board, blockMatrix, column) {
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

function maxColumns(blockMatrix) {
    for (let i = 3; i >= 0; i--) {
        const column = blockMatrix.map(row => row[i]);
        if (column.find(a => a !== 0)) return (9 - i);
    }

    return 6;
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
        if (percentage === 1) break;
    }
    return messiness;
}

function calculateGaps(board) {
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

function calculateB2B(board) {
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

function evaluateBoard(board, blockMatrix, column) {
    const row = getTopRow(board, blockMatrix, column);
    if (row === -1) return Number.NEGATIVE_INFINITY;
    console.log(row);

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

    const wellPotential = calculateWellPotential(board, height);
    const flatness = calculateFlatness(board, height);
    const gaps = calculateGaps(board, height);
    const maintainsB2B = calculateB2B(board);

    return wellPotential + flatness * -2 + gaps * -4 + maintainsB2B * 5;
}

// S PIECE
// const rotations = [[[0,0,0,0],[0,1,2,0],[3,4,0,0],[0,0,0,0]],[[0,0,0,0],[0,3,0,0],[0,4,1,0],[0,0,2,0]],[[0,0,0,0],[0,0,0,0],[0,4,3,0],[2,1,0,0]],[[0,0,0,0],[2,0,0,0],[1,4,0,0],[0,3,0,0]]]
// Z PIECE
// const rotations = [[[0,0,0,0],[1,2,0,0],[0,3,4,0],[0,0,0,0]],[[0,0,0,0],[0,0,1,0],[0,3,2,0],[0,4,0,0]],[[0,0,0,0],[0,0,0,0],[4,3,0,0],[0,2,1,0]],[[0,0,0,0],[0,4,0,0],[2,3,0,0],[1,0,0,0]]]
// J PIECE
// const rotations = [[[0,0,0,0],[1,0,0,0],[2,3,4,0],[0,0,0,0]],[[0,0,0,0],[0,2,1,0],[0,3,0,0],[0,4,0,0]],[[0,0,0,0],[0,0,0,0],[4,3,2,0],[0,0,1,0]],[[0,0,0,0],[0,4,0,0],[0,3,0,0],[1,2,0,0]]]
// T PIECE
// const rotations = [[[0,0,0,0],[0,1,0,0],[2,3,4,0],[0,0,0,0]],[[0,0,0,0],[0,2,0,0],[0,3,1,0],[0,4,0,0]],[[0,0,0,0],[0,0,0,0],[4,3,2,0],[0,1,0,0]],[[0,0,0,0],[0,4,0,0],[1,3,0,0],[0,2,0,0]]];
// I PIECE
const rotations = [[[0,0,0,0],[1,2,3,4],[0,0,0,0],[0,0,0,0]],[[0,0,1,0],[0,0,2,0],[0,0,3,0],[0,0,4,0]],[[0,0,0,0],[0,0,0,0],[4,3,2,1],[0,0,0,0]],[[0,4,0,0],[0,3,0,0],[0,2,0,0],[0,1,0,0]]]

// rotations.forEach(rotation => {
//     const board = [[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0]];
//     const blockMatrix = stripMatrix(rotation);
//     console.log(JSON.stringify(rotation).replaceAll("],", "],\n "));
//     console.log(JSON.stringify(board).replaceAll("],", "],\n "));
//     console.log(evaluateBoard(board, blockMatrix, 6))
// })

// const board = [
//     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 9, 9, 9, 9, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 9, 9, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 9, 9, 0]
// ];
const board = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 9, 9, 9, 9, 9, 9, 9, 9, 9],
    [0, 9, 9, 9, 9, 9, 9, 9, 9, 9],
    [0, 9, 9, 9, 9, 9, 9, 9, 9, 9],
    [0, 9, 9, 9, 9, 9, 9, 9, 9, 9]
];
const { matrix, offset, width } = stripMatrix(rotations[3]);
// console.log("Score:", evaluateBoard(board, blockMatrix, 0))
console.log(JSON.stringify(matrix).replaceAll("],", "],\n "));
console.log(evaluateBoard(board, matrix, 0 + offset))
console.log(JSON.stringify(board).replaceAll("],", "],\n "));