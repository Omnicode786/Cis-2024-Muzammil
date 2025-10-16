# triangular matrix store in U

MAt = [[1,0,0,0,0],[1,2,0,0,0],[1,2,3,0,0],[1,2,3,4,0],[1,2,3,4,5]]

def storeTriangle(MAt):
        
    row = len(MAt)
    col = len(MAt[0])
    size = row*(row+1)//2
    U = [0] * size

    for j in range(row):
        for k in range(col):
            L = (j*(j+1)//2) +k
            if k<=j:
                U[L] = MAt[j][k]


    print(U)
    return U

U = storeTriangle(MAt)

def retrieveTriangle(U, row):
    A = [[0]*row for _ in range(row)]
    for j in range(row):
        for k in range(row):
            L = (j*(j+1)//2) + k
            if k <= j:
                A[j][k] = U[L]
    print(A)

retrieveTriangle(U,5)
5

