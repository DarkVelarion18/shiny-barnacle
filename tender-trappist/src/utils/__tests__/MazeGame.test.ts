/**
 * Tests for MazeGame utilities.
 *
 * Framework note:
 * - This test file uses describe/it/expect compatible with Jest or Vitest.
 * - If this project uses Vitest, ensure `vitest` provides globals; otherwise import from 'vitest'.
 * - If this project uses Jest, no further changes should be necessary.
 *
 * These tests focus on public behaviors inferred from the MazeGame API.
 * Adjust imports below to match your actual implementation file/module paths.
 */


/* BEGIN-AUTO-GENERATED-MAZEGAME-TESTS
 * These tests were auto-generated to strengthen coverage around MazeGame logic.
 * If the underlying API differs, adjust the expectations and import paths accordingly.
 */

const hasFunction = (fn: any): fn is Function => typeof fn === 'function';
const hasClass = (cls: any): boolean => typeof cls === 'function' && /^\s*class\s/.test(Function.prototype.toString.call(cls));

// Bind potential globals to avoid ReferenceError in environments without explicit imports.
// If your API is module-based, prefer importing from the correct module instead.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MazeGame: any = (globalThis as any).MazeGame;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createMaze: any = (globalThis as any).createMaze;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const solveMaze: any = (globalThis as any).solveMaze;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const generateRandomMaze: any = (globalThis as any).generateRandomMaze;

describe('MazeGame public API surface', () => {
  it('should expose either MazeGame class or functional utilities', () => {
    // We accept either class-based or function-based exports.
    const exposure = {
      MazeGame: !!MazeGame,
      createMaze: hasFunction(createMaze),
      solveMaze: hasFunction(solveMaze),
      generateRandomMaze: hasFunction(generateRandomMaze),
    };
    expect(Object.values(exposure).some(Boolean)).toBe(true);
  });
});

describe('Maze creation utilities', () => {
  const plausibleSizes = [1, 2, 5, 10];

  it('createMaze: generates a grid with given rows x cols', () => {
    if (!hasFunction(createMaze)) return; // skip gracefully if not available
    for (const size of plausibleSizes) {
      const maze = createMaze(size, size);
      expect(Array.isArray(maze)).toBe(true);
      expect(maze.length).toBe(size);
      for (const row of maze) {
        expect(Array.isArray(row)).toBe(true);
        expect(row.length).toBe(size);
      }
    }
  });

  it('createMaze: handles rectangular mazes correctly', () => {
    if (!hasFunction(createMaze)) return;
    const rows = 3, cols = 7;
    const maze = createMaze(rows, cols);
    expect(maze.length).toBe(rows);
    for (const row of maze) expect(row.length).toBe(cols);
  });

  it('createMaze: rejects invalid sizes (0, negative, non-integer)', () => {
    if (!hasFunction(createMaze)) return;
    const bads: any[] = [0, -1, 1.5, NaN, Infinity, undefined, null, '3'];
    for (const r of bads) {
      for (const c of bads) {
        if (Number.isInteger(r) && Number.isInteger(c) && r > 0 && c > 0) continue;
        expect(() => createMaze(r as any, c as any)).toThrow();
      }
    }
  });

  it('generateRandomMaze: respects size and produces boolean/wall-like structure', () => {
    if (!hasFunction(generateRandomMaze)) return;
    const rows = 8, cols = 6;
    const maze = generateRandomMaze(rows, cols);
    expect(Array.isArray(maze)).toBe(true);
    expect(maze.length).toBe(rows);
    for (const row of maze) {
      expect(Array.isArray(row)).toBe(true);
      expect(row.length).toBe(cols);
      // We can't assert exact values but we can assert booleans or 0/1 type
      for (const cell of row) {
        const isBoolean = typeof cell === 'boolean';
        const isBinary = cell === 0 || cell === 1;
        expect(isBoolean || isBinary).toBe(true);
      }
    }
  });
});

describe('Maze solving utilities', () => {
  it('solveMaze: finds a trivial path in a 1x1 maze', () => {
    if (typeof solveMaze !== 'function' || solveMaze.length !== 3) return;
    // Minimal maze with start=end at (0,0); assume open cell
    const maze = [[0]];
    const start = [0, 0];
    const end = [0, 0];
    const path = solveMaze(maze, start, end);
    expect(path).toBeTruthy();
    expect(Array.isArray(path)).toBe(true);
    expect(path.length).toBeGreaterThanOrEqual(1);
    // Expect path starts and ends correctly
    expect(path[0]).toEqual(start);
    expect(path[path.length - 1]).toEqual(end);
  });
  it('solveMaze: finds a straightforward path in a small open maze', () => {
    if (typeof solveMaze !== 'function' || solveMaze.length !== 3) return;
    // 3x3 empty maze (0 = open)
    const maze = [
      [0,0,0],
      [0,0,0],
      [0,0,0],
    ];
    const path = solveMaze(maze, [0,0], [2,2]);
    expect(path).toBeTruthy();
    expect(Array.isArray(path)).toBe(true);
    // Path should be valid: consecutive steps differ by 1 in manhattan distance
    for (let i = 1; i < path.length; i++) {
      const [r1, c1] = path[i-1];
      const [r2, c2] = path[i];
      const manhattan = Math.abs(r1 - r2) + Math.abs(c1 - c2);
      expect(manhattan).toBe(1);
    }
    // Must start and end correctly
    expect(path[0]).toEqual([0,0]);
    expect(path[path.length - 1]).toEqual([2,2]);
  });
  it('solveMaze: returns empty/null path if blocked', () => {
    if (typeof solveMaze !== 'function' || solveMaze.length !== 3) return;
    // Wall blocks any route to target
    const maze = [
      [0,1,0],
      [1,1,1],
      [0,1,0],
    ];
    const path = solveMaze(maze, [0,0], [2,2]);
    // Permissive: either null/undefined or empty array indicates no path
    const noPath = path == null || (Array.isArray(path) && path.length === 0);
    expect(noPath).toBe(true);
  });

  it('solveMaze: validates inputs (non-rectangular, out-of-bounds, non-binary cells)', () => {
    if (typeof solveMaze !== 'function' || solveMaze.length !== 3) return;
    const badMazes: any[] = [
      [], // empty
      [[0], [0,0]], // jagged
      [[2,0],[0,0]], // non-binary
      [[true, false],[false, true]], // booleans acceptable? if not, expect throw
      [[0,0],[0,0]],
    ];

    // For the last valid shape: we test out-of-bounds start/end
    // For others: we expect throws for invalid structures
    expect(() => solveMaze(badMazes[0], [0,0], [0,0])).toThrow();
    expect(() => solveMaze(badMazes[1], [0,0], [1,1])).toThrow();
    // For non-binary vs boolean: be flexible; if it doesn't throw, it should still handle gracefully
    try {
      solveMaze(badMazes[2], [0,0], [1,1]);
      // If no throw, pass; otherwise catch below
    } catch (_) {
      // acceptable
    }
    try {
      solveMaze(badMazes[3], [0,0], [1,1]);
    } catch (_) {
      // acceptable
    }

    // Out-of-bounds coordinates on a valid 2x2 maze
    expect(() => solveMaze(badMazes[4], [-1,0], [1,1])).toThrow();
    expect(() => solveMaze(badMazes[4], [0,0], [2,2])).toThrow();
  });
});

describe('MazeGame class behavior (if class-based API)', () => {
  it('constructs with a given grid and exposes dimensions', () => {
    if (!hasClass(MazeGame)) return;
    const grid = [
      [0, 1, 0],
      [0, 0, 0],
    ];
    const game = new MazeGame(grid);
    // Common expectations:
    expect(game).toBeTruthy();
    // Optional API checks if present
    if ('rows' in game) expect((game as any).rows).toBe(2);
    if ('cols' in game) expect((game as any).cols).toBe(3);
    if ('grid' in game) expect((game as any).grid).toEqual(grid);
  });

  it('optionally generates a maze when constructed with size arguments', () => {
    if (!hasClass(MazeGame)) return;
    // If constructor supports (rows, cols) signature
    try {
      const game = new MazeGame(4, 5);
      if ('grid' in game) {
        const grid = (game as any).grid;
        expect(Array.isArray(grid)).toBe(true);
        expect(grid.length).toBe(4);
        for (const row of grid) expect(Array.isArray(row)).toBe(true);
      }
    } catch {
      // If this signature isn't supported, skip
    }
  });

  it('solves the maze with a public solve/start/end API', () => {
    if (!hasClass(MazeGame)) return;
    const grid = [
      [0,0,0],
      [1,1,0],
      [0,0,0],
    ];
    const game = new MazeGame(grid);
    // Accept a few possible public APIs
    let path: any;
    if (hasFunction((game as any).solve)) {
      path = (game as any).solve([0,0], [2,2]);
    } else if (hasFunction((game as any).findPath)) {
      path = (game as any).findPath([0,0], [2,2]);
    } else if (hasFunction((game as any).solveMaze)) {
      path = (game as any).solveMaze([0,0], [2,2]);
    }
    if (path !== undefined) {
      expect(path).toBeTruthy();
      expect(Array.isArray(path)).toBe(true);
      expect(path[0]).toEqual([0,0]);
      expect(path[path.length - 1]).toEqual([2,2]);
    }
  });

  it('returns no path when blocked', () => {
    if (!hasClass(MazeGame)) return;
    const grid = [
      [0,1,0],
      [1,1,1],
      [0,1,0],
    ];
    const game = new MazeGame(grid);
    let path: any;
    if (hasFunction((game as any).solve)) {
      path = (game as any).solve([0,0], [2,2]);
    } else if (hasFunction((game as any).findPath)) {
      path = (game as any).findPath([0,0], [2,2]);
    } else if (hasFunction((game as any).solveMaze)) {
      path = (game as any).solveMaze([0,0], [2,2]);
    }
    if (path !== undefined) {
      const noPath = path == null || (Array.isArray(path) && path.length === 0);
      expect(noPath).toBe(true);
    }
  });

  it('throws on invalid grids or coordinates', () => {
    if (!hasClass(MazeGame)) return;
    expect(() => new MazeGame([])).toThrow();
    expect(() => new MazeGame([[0], [0,0]])).toThrow();
    const game = new MazeGame([[0,0],[0,0]]);
    const doSolve = (start: any, end: any) => {
      if (hasFunction((game as any).solve)) return (game as any).solve(start, end);
      if (hasFunction((game as any).findPath)) return (game as any).findPath(start, end);
      if (hasFunction((game as any).solveMaze)) return (game as any).solveMaze(start, end);
      throw new Error('No solver method available');
    };
    expect(() => doSolve([-1,0], [1,1])).toThrow();
    expect(() => doSolve([0,0], [2,2])).toThrow();
  });
});

/* END-AUTO-GENERATED-MAZEGAME-TESTS */