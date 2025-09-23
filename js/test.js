function stripMatrix(matrix) {
    return matrix.filter(row => row.some(cell => cell !== 0));
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

function calculateGaps(board, height) {
    return 0;
}

function calculateB2B(board, height) {
    return 0;
}

function evaluateBoard(board, blockMatrix, column) {
    const row = getTopRow(board, blockMatrix, column);

    for (let r = row; r < (row + blockMatrix.length); r++) {
        for (let c = column; c < column + blockMatrix[0].length; c++) {
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

    return wellPotential + flatness * -2 + gaps * -3 + maintainsB2B * 5;
}

// S PIECE
const rotations = [[[0,0,0,0],[0,1,2,0],[3,4,0,0],[0,0,0,0]],[[0,0,0,0],[0,3,0,0],[0,4,1,0],[0,0,2,0]],[[0,0,0,0],[0,0,0,0],[0,4,3,0],[2,1,0,0]],[[0,0,0,0],[2,0,0,0],[1,4,0,0],[0,3,0,0]]]
// Z PIECE
// const rotations = [[[0,0,0,0],[1,2,0,0],[0,3,4,0],[0,0,0,0]],[[0,0,0,0],[0,0,1,0],[0,3,2,0],[0,4,0,0]],[[0,0,0,0],[0,0,0,0],[4,3,0,0],[0,2,1,0]],[[0,0,0,0],[0,4,0,0],[2,3,0,0],[1,0,0,0]]]

// rotations.forEach(rotation => {
//     const board = [[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0]];
//     const blockMatrix = stripMatrix(rotation);
//     console.log(JSON.stringify(rotation).replaceAll("],", "],\n "));
//     console.log(JSON.stringify(board).replaceAll("],", "],\n "));
//     console.log(evaluateBoard(board, blockMatrix, 6))
// })

const board = [[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0]];
const blockMatrix = stripMatrix(rotations[1]);
console.log("Score:", evaluateBoard(board, blockMatrix, 7))
console.log(JSON.stringify(blockMatrix).replaceAll("],", "],\n "));
board.push([0,1,2,3,4,5,6,7,8,9])
console.log(JSON.stringify(board).replaceAll("],", "],\n "));
