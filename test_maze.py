from maze import solve, growing_tree


def test_solve():
    maze = [[4, 12, 12, 12, 10], [6, 12, 12, 12, 9], [5, 12, 12, 12, 10], [6, 12, 12, 12, 9], [5, 12, 12, 12, 8]]
    solution = [[x, 0] for x in range(5)] + [[x, 1] for x in reversed(range(5))] + [[x, 2] for x in range(5)] + \
        [[x, 3] for x in reversed(range(5))] + [[x, 4] for x in range(5)]
    assert solve(maze, [0, 0], [4, 4]) == solution

    maze[4][0] = maze[3][0] = 4
    assert solve(maze, [0, 0], [4, 4]) is None


def test_growing_tree():
    size = 10
    maze = growing_tree(size, size)

    for x in range(size):
        assert solve(maze, [x, 0], [size - x - 1, size - 1]) is not None

    for y in range(1, size - 1):
        assert solve(maze, [0, y], [size - 1, size - y - 1]) is not None
