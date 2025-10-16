def store_tridiagonal(B):
    n = len(B)
    size_U = 3 * n - 2
    U = [0] * size_U
    for j in range(n):
        for k in range(n):
            if j == k:  # main diagonal
                L = j
                U[L] = B[j][k]
            elif k == j + 1:  # upper diagonal
                L = n + j
                U[L] = B[j][k]
            elif k == j - 1:  # lower diagonal
                L = 2 * n - 1 + (j - 1)
                U[L] = B[j][k]
    return U
B = [
    [5, -7, 0, 0],
    [1, 4, 3, 0],
    [0, 9, -3, 6],
    [0, 0, 2, 4]
]
U = store_tridiagonal(B)
print("U =", U)
