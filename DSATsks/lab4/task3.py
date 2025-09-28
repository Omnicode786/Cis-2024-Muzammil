def matmul(A, B):
    rA, cA = len(A), len(A[0])
    rB, cB = len(B), len(B[0])
    
    # check condition
    if cA != rB:
        print("Matrix multiplication not possible: columns of A must equal rows of B")
        return None
    
    C = [[0 for _ in range(cB)] for _ in range(rA)]
    
    # multiply
    for i in range(rA):
        for j in range(cB):
            for k in range(cA):
                C[i][j] += A[i][k] * B[k][j]
    return C


# Example
A = [[1, 2, 3],
     [4, 5, 6]]

B = [[7, 8],
     [9, 10],
     [11, 12]]

C = matmul(A, B)
print("Resultant Matrix C:")
for row in C:
    print(row)
