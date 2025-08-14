export const MAZE_CONFIG = {
    CELL_SIZE: 30,
    PLAYER_SIZE: 18, // 60% of CELL_SIZE
    DOT_RADIUS: 4.5, // 15% of CELL_SIZE
    MIN_MAZE_SIZE: 5,
    MAX_MAZE_SIZE: 50,
    DEFAULT_MAZE_SIZE: 15
} as const;

export const COLORS = {
    PLAYER: '#ef4444',
    START: '#ffffff',
    END: '#ffffff',
    EXPLORED: '#10b981',
    GRID: '#94a3b8',
    PATH_DOT: '#000000',
    BACKGROUND: '#ffffff',
    BORDER: '#334155'
} as const;

export const DELAY_MS = 20; // Visualization delay in milliseconds
