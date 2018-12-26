from random import randint, shuffle


def growing_tree(width, height, method='backtrack'):
    N, S, E, W = 1, 2, 4, 8
    DX = {E: 1, W: -1, N: 0, S: 0}
    DY = {E: 0, W: 0, N: -1, S: 1}
    OPPOSITE = {E: W, W: E, N: S, S: N}
    cells = []
    maze = [[0 for _ in range(width)] for _ in range(height)]
    directions = [N, S, E, W]

    x, y = randint(0, width - 1), randint(0, height - 1)
    cells.append([x, y])

    while cells:
        nxt = -1

        if method == 'prim':
            nxt = randint(0, len(cells) - 1)

        x, y = cells[nxt]
        shuffle(directions)

        for direction in directions:
            dx, dy = x + DX[direction], y + DY[direction]

            if width > dx >= 0 and height > dy >= 0 and maze[dy][dx] == 0:
                maze[y][x] |= direction
                maze[dy][dx] |= OPPOSITE[direction]
                cells.append([dx, dy])
                nxt = None

        if nxt is not None:
            cells.pop(nxt)

    return maze