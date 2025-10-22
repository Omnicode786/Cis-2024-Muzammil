import os


def countNeighbours(Mat,curI,curJ):
    nei = 0
    row, col = len(Mat),len(Mat[0])

    for i in range(-1,2):
        for j in range(-1,2):
            if (curI+i<row and curJ+j < col) and not (i==0 and j== 0) and (curI+i >=0 and curJ+j >= 0):
                if Mat[curI+i][curJ+j] in [1,
                                           3] :
                    nei+=1
    return nei

mat = [
    [0,0,1,0,0,0,0,0,0,0],
    [0,0,0,1,0,0,1,0,0,0],
    [1,1,1,1,0,0,0,1,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,1,1,0,0,1,0,0,0,0],
    [0,1,1,0,0,1,0,0,0,0],
    [0,0,0,0,0,0,0,1,1,0],
    [0,0,0,0,0,0,0,1,1,0],
    [0,0,0,0,0,1,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0]
]


nei = countNeighbours(mat,2,0)
print(nei)


def Gameoflife(mat):
    rows,cols = len(mat), len(mat[0])

    for i in range(rows):
        for j in range(cols):
            neighbpurs = countNeighbours(mat,i,j)

            if mat[i][j] == 1:
                if neighbpurs in [2,3]:
                    mat[i][j] = 3
            # if its a 1 and it has less than 3 1s ten that means it will stay as a one from our truth table so no need to write the else clause
            elif mat[i][j] == 0:
                if neighbpurs == 3:
                    mat[i][j] = 2
    for i in range(rows):
        for j in range(cols):
            if mat[i][j] in [2,3]:
                mat[i][j] = 1
            else:
                mat[i][j] = 0
            
rows,cols = len(mat), len(mat[0])





import keyboard  # install with: pip install keyboard

import time
import sys

while True:
    if keyboard.is_pressed('q'):
        break

    # Move cursor to top-left of terminal
    sys.stdout.write("\033[H")

    for i in range(rows):
        for j in range(cols):
            if mat[i][j] == 1:
                sys.stdout.write("\033[92m█\033[0m")
            else:
                sys.stdout.write(" ")
        sys.stdout.write("\n")

    sys.stdout.flush()
    Gameoflife(mat)
    time.sleep(0.8)  # faster animation


# 0  0  0
# 1  0  1
# 0  1  2
# 1  1  3