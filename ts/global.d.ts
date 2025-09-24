export {};

type BlockSet = {
    blocks: Record<number, number[][]>,
}

type BlockSets = {
    blocks: Record<number, BlockSet>
}

type Move = {
    col: number,
    rot: number
}

type Tetris = {
    matrix: number[][],
    testBoard: string,
    testScores: Scores,
    blockSets: Record<number, BlockSets>,
    activeBlock: Block,
    queue: Block[],
    nextMove: Move,
    placedBlocks: number,
    hardDrop: VoidFunction,
    blockInHold: Block | null,
    paused: boolean,
    gameEnded: boolean
}

declare global {
    interface Window {
        __game: Tetris;
        Game
    }
}