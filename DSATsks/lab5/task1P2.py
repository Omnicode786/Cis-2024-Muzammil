U = [3, 4, 6, 4, 9, 7, 5, 6, 7, 9]
n = 4

A = [[0 for _ in range(n)] for _ in range(n)]

index = 0  

for i in range(n):
    for j in range(i + 1):  
        A[i][j] = U[index] 
        index += 1 
print(A)
