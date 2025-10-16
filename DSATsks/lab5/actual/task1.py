#A5.1

def storeTriangular(A):
    n = len(A)
    U = [0] * (n * (n + 1) // 2) 
    i = 0
    for j in range(n):
        for k in range(j + 1):
            U[i] = A[j][k]
            i += 1
    return U

# A5.2

def retrieveTriangular(U, n):
    A = [[0]*n for _ in range(n)]
    for j in range(n):
        for k in range(n):
            if k <= j:
             idx = (j*(j+1))//2 + k
             A[j][k] = U[idx]
            else:
                A[j][k] = 0
    return A

A = [
    [1, 0, 0],
    [4, 5, 0],
    [7, 8, 9]
]
U = storeTriangular(A)
print("Stored U:", U)
n = len(A)  
retrieved_A = retrieveTriangular(U, n)
print("Retrieved A:")
for row in retrieved_A:
    print(row)