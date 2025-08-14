/**
 * Test suite for MazeSolver (BFS/DFS).
 * Testing framework: Jest (TypeScript). Assumes ts-jest or a similar transformer is configured.
 *
 * We construct lightweight Cell graph structures and a stub Maze implementation
 * to verify traversal, path reconstruction, and messaging behavior without relying
 * on the full rendering stack.
 */

import type { Maze } from '../Maze';
import type { Player } from '../Player';
import type { Cell, IsSolvingRef } from '../../types/maze';

// Mock constants to skip visualization delay
jest.mock('../constants', () => ({
  DELAY_MS: 0,
}));

// Import after mocks so MazeSolver picks up the mocked constants
import { MazeSolver } from '../MazeSolver';

class StubRenderer {
  public draw = jest.fn();
}

// Simple cell factory to avoid importing types directly beyond aliases.
// We ensure fields exist that MazeSolver touches.
function makeCell(id: string): Cell & { id: string } {
  return {
    id,
    isExplored: false,
    visited: false,
    isPath: false,
    parent: null as any,
    distance: undefined as any,
  } as any;
}

function linkLinearPath(cells: Array<Cell & { id: string }>): Map<string, (Cell & { id: string })[]> {
  // Build a linear chain neighbors map: c0 -> c1 -> c2 -> ...
  const neighbors = new Map<string, (Cell & { id: string })[]>();
  for (let i = 0; i < cells.length; i++) {
    const current = cells[i];
    const next = cells[i + 1];
    neighbors.set(
      current.id,
      next ? [next] : []
    );
  }
  // By default for cells not in the path, no neighbors
  return neighbors;
}

function makeMaze({
  start,
  end,
  neighbors,
  markResetSpy,
}: {
  start: Cell & { id: string };
  end: Cell & { id: string };
  neighbors: Map<string, (Cell & { id: string })[]>;
  markResetSpy?: jest.Mock;
}): Maze {
  const resetSpy = markResetSpy ?? jest.fn();

  const maze: Partial<Maze> = {
    startCell: start as unknown as Maze['startCell'],
    endCell: end as unknown as Maze['endCell'],
    resetCellsForSolution: () => {
      // Reset flags that solver uses
      for (const [, list] of neighbors.entries()) {
        for (const cell of list) {
          cell.isExplored = false;
          cell.isPath = false;
          cell.parent = null as any;
          (cell as any).distance = undefined;
        }
      }
      // Also reset start and end
      (start as any).isExplored = false;
      (start as any).isPath = false;
      (start as any).parent = null;
      (start as any).distance = undefined;

      (end as any).isExplored = false;
      (end as any).isPath = false;
      (end as any).parent = null;
      (end as any).distance = undefined;

      resetSpy();
    },
    getNeighbors: (c: Cell) => {
      const id = (c as any).id as string;
      return neighbors.get(id) ?? [];
    },
  };

  return maze as Maze;
}

describe('MazeSolver', () => {
  let player: Player;
  let renderer: StubRenderer;
  let showMessage: jest.Mock;
  let isSolvingRef: IsSolvingRef;

  beforeEach(() => {
    player = {} as Player;
    renderer = new StubRenderer();
    showMessage = jest.fn();
    isSolvingRef = { current: false };
    jest.spyOn(global.Math, 'random').mockReturnValue(0.42); // Deterministic for DFS shuffle
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('solveBFS finds a simple linear path and reconstructs it correctly', async () => {
    // Arrange: linear path s -> a -> b -> e
    const s = makeCell('s');
    const a = makeCell('a');
    const b = makeCell('b');
    const e = makeCell('e');
    const neighbors = linkLinearPath([s, a, b, e]);

    // Include end in map so accessing neighbors for end returns []
    neighbors.set(e.id, []);

    const maze = makeMaze({ start: s, end: e, neighbors });
    const solver = new MazeSolver(maze, player, renderer as any, showMessage, isSolvingRef);

    // Act
    await solver.solveBFS();

    // Assert
    // Path flags
    expect(s.isPath).toBe(true);
    expect(a.isPath).toBe(true);
    expect(b.isPath).toBe(true);
    expect(e.isPath).toBe(true);

    // Distances assigned by BFS
    expect(s.distance).toBe(0);
    expect(a.distance).toBe(1);
    expect(b.distance).toBe(2);
    expect(e.distance).toBe(3);

    // Message and rendering
    expect(showMessage).toHaveBeenCalledWith('Path found using BFS!');
    expect(renderer.draw).toHaveBeenCalled(); // Initial draw + final draw at least
    // isSolvingRef toggled properly
    expect(isSolvingRef.current).toBe(false);
  });

  test('solveDFS finds a simple linear path and reconstructs it correctly', async () => {
    // Arrange: linear path s -> n1 -> n2 -> e
    const s = makeCell('s');
    const n1 = makeCell('n1');
    const n2 = makeCell('n2');
    const e = makeCell('e');
    const neighbors = linkLinearPath([s, n1, n2, e]);
    neighbors.set(e.id, []);

    const maze = makeMaze({ start: s, end: e, neighbors });
    const solver = new MazeSolver(maze, player, renderer as any, showMessage, isSolvingRef);

    // Act
    await solver.solveDFS();

    // Assert: path is reconstructed from end back to start
    expect(s.isPath).toBe(true);
    expect(n1.isPath).toBe(true);
    expect(n2.isPath).toBe(true);
    expect(e.isPath).toBe(true);

    expect(showMessage).toHaveBeenCalledWith('Path found using DFS!');
    expect(renderer.draw).toHaveBeenCalled();
    expect(isSolvingRef.current).toBe(false);
  });

  test('BFS reports no path when end is unreachable', async () => {
    // Arrange: s -> a -> b, but e is isolated
    const s = makeCell('s');
    const a = makeCell('a');
    const b = makeCell('b');
    const e = makeCell('e');
    const neighbors = linkLinearPath([s, a, b]);
    // End has no incoming edges; also ensure cells map includes end
    neighbors.set(e.id, []);
    neighbors.set(b.id, []); // tail

    const maze = makeMaze({ start: s, end: e, neighbors });
    const solver = new MazeSolver(maze, player, renderer as any, showMessage, isSolvingRef);

    // Act
    await solver.solveBFS();

    // Assert
    expect(showMessage).toHaveBeenCalledWith('No path found using BFS. All reachable cells explored!');
    // No isPath should be set on e
    expect(e.isPath).toBe(false);
    // Start is explored but since no path, reconstructPath not marking path from end to start
    expect(s.isPath).toBe(false);
    expect(isSolvingRef.current).toBe(false);
  });

  test('DFS reports no path when end is unreachable', async () => {
    // Arrange: a single-node graph at start, end isolated
    const s = makeCell('s');
    const e = makeCell('e');
    const neighbors = new Map<string, (Cell & { id: string })[]>();
    neighbors.set(s.id, []);
    neighbors.set(e.id, []);

    const maze = makeMaze({ start: s, end: e, neighbors });
    const solver = new MazeSolver(maze, player, renderer as any, showMessage, isSolvingRef);

    // Act
    await solver.solveDFS();

    // Assert
    expect(showMessage).toHaveBeenCalledWith('No path found using DFS. All reachable cells explored!');
    expect(e.isPath).toBe(false);
    expect(s.isPath).toBe(false);
    expect(isSolvingRef.current).toBe(false);
  });

  test('BFS handles edge case where start equals end', async () => {
    const s = makeCell('s');
    const neighbors = new Map<string, (Cell & { id: string })[]>();
    neighbors.set(s.id, []);

    const maze = makeMaze({ start: s, end: s, neighbors });
    const solver = new MazeSolver(maze, player, renderer as any, showMessage, isSolvingRef);

    await solver.solveBFS();

    // Path should consist of the single start/end cell
    expect(s.isPath).toBe(true);
    expect(showMessage).toHaveBeenCalledWith('Path found using BFS!');
    expect(isSolvingRef.current).toBe(false);
  });

  test('DFS handles edge case where start equals end', async () => {
    const s = makeCell('s');
    const neighbors = new Map<string, (Cell & { id: string })[]>();
    neighbors.set(s.id, []);

    const maze = makeMaze({ start: s, end: s, neighbors });
    const solver = new MazeSolver(maze, player, renderer as any, showMessage, isSolvingRef);

    await solver.solveDFS();

    expect(s.isPath).toBe(true);
    expect(showMessage).toHaveBeenCalledWith('Path found using DFS!');
    expect(isSolvingRef.current).toBe(false);
  });

  test('isSolvingRef is set to true at start and reset to false at end (BFS)', async () => {
    const s = makeCell('s');
    const e = makeCell('e');
    const neighbors = linkLinearPath([s, e]);
    neighbors.set(e.id, []);
    const maze = makeMaze({ start: s, end: e, neighbors });
    const solver = new MazeSolver(maze, player, renderer as any, showMessage, isSolvingRef);

    expect(isSolvingRef.current).toBe(false);
    const solvePromise = solver.solveBFS();
    // Immediately after call, it should have been set true
    expect(isSolvingRef.current).toBe(true);
    await solvePromise;
    expect(isSolvingRef.current).toBe(false);
  });

  test('renderer.draw is called initially and after reconstructing path (BFS)', async () => {
    const s = makeCell('s');
    const e = makeCell('e');
    const neighbors = linkLinearPath([s, e]);
    neighbors.set(e.id, []);
    const maze = makeMaze({ start: s, end: e, neighbors });
    const solver = new MazeSolver(maze, player, renderer as any, showMessage, isSolvingRef);

    renderer.draw.mockClear();
    await solver.solveBFS();

    // At least two draws: once at start of solve, once after reconstructPath in handleSolutionResult
    expect(renderer.draw.mock.calls.length).toBeGreaterThanOrEqual(2);
    // Validate last draw used the same maze and player references
    const lastCall = renderer.draw.mock.calls[renderer.draw.mock.calls.length - 1];
    expect(lastCall[0]).toBe(maze);
    expect(lastCall[1]).toBe(player);
  });
});