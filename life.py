# life.py

class LifeGrid:
    """Implements the grid for Conway's Game of Life."""

    def __init__(self, numRows, numCols):
        # Create a 2D list initialized with all dead cells (False)
        self._grid = [[False for _ in range(numCols)] for _ in range(numRows)]
        self._rows = numRows
        self._cols = numCols

    # Return the number of rows.
    def numRows(self):
        return self._rows

    # Return the number of columns.
    def numCols(self):
        return self._cols

    # Configure the grid to contain the given live cell coordinates.
    def configure(self, coordList):
        # First, reset everything to dead.
        for i in range(self._rows):
            for j in range(self._cols):
                self._grid[i][j] = False

        # Now set the specified coordinates to live.
        for coord in coordList:
            row, col = coord
            if 0 <= row < self._rows and 0 <= col < self._cols:
                self._grid[row][col] = True

    # Check if a specific cell is alive.
    def isLiveCell(self, row, col):
        return self._grid[row][col]

    # Count the number of live neighbors for a given cell.
    def numLiveNeighbors(self, row, col):
        count = 0
        # Check all 8 neighboring cells.
        for i in range(row - 1, row + 2):
            for j in range(col - 1, col + 2):
                # Skip the cell itself.
                if (i, j) != (row, col) and 0 <= i < self._rows and 0 <= j < self._cols:
                    if self._grid[i][j]:
                        count += 1
        return count
