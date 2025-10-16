
# store tridiagonal matrix


B = [
    [5, -7, 0, 0],
    [1, 4, 3, 0],
    [0, 9, -3, 6],
    [0, 0, 2, 4]
]

def tridiagonal(B):
    row = len(B)
    size = 3*row -2
    U = [0]*size
    for j in range(row):
        for k in range(row):
            if j == k:
                L = j
                U[L] = B[j][k]
            if k == j+1:
                L = row + j
                U[L] = B[j][k]
            if k == j-1:
                L = 2*row -1 + (j-1)
                U[L] = B[j][k]

    print(U)
    return U

U = tridiagonal(B)


def retrieveTridiagonal(U,row):
    B = [[0 for _ in range(row)] for _ in range(row)]
    for j in range(row):
        B[j][j] = U[j]
        if j < row - 1:
            B[j][j+1] = U[row+j]
        if j > 0:
            B[j][j-1] = U[2*row -1 + (j-1)]
    print(B)
    return B

B = retrieveTridiagonal(U,4)
