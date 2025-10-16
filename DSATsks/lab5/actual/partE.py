def retrievTridiagonal(U, n):
    B = [[0] * n for _ in range(n)]
    for j in range(n):
        B[j][j] = U[j] # main diagonal
        if j < n - 1: # upper diagonal
            B[j][j + 1] = U[n + j]
        if j > 0: # lower diagonal
            B[j][j - 1] = U[2 * n - 1 + (j - 1)]
    
    return B
U = [5, 4, -3, 4, -7, 3, 6, 1, 9, 2] 
B = retrievTridiagonal(U, 4)
# we must know B rows
print("Retrieved B:")
for row in B:
    print(row)
