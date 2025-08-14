export type Cell = {
    x: number;
    y: number;
    walls: {
        top: boolean;
        right: boolean;
        bottom: boolean;
        left: boolean;
    };
    visited: boolean;
    parent: Cell | null;
    isStart: boolean;
    isEnd: boolean;
    isPath: boolean;
    isExplored: boolean;
    distance: number;
};

export type Edge = {
    cell1: Cell;
    cell2: Cell;
    wall: 'top' | 'right' | 'bottom' | 'left';
    weight: number;
};

export type WallDirection = 'top' | 'right' | 'bottom' | 'left';

export type SolveAlgorithm = 'bfs' | 'dfs';

export type ShowMessageFunction = (msg: string, duration?: number) => void;

export type IsSolvingRef = {
    current: boolean;
};

export interface MazeFunctions {
    generateMaze: (newSize: number) => void;
    solveMaze: (algorithm: SolveAlgorithm) => Promise<void>;
    resetPlayer: () => void;
    stopSolution: () => void;
    showMessage?: ShowMessageFunction;
}
