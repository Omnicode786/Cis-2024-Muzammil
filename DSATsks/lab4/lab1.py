mata = [[1,2,3],[4,5,6],[7,8,9]]
matb = [[1,2,3],[4,5,6],[7,8,9]]


m = len(mata)
n = len(matb[0])
p = len(matb) 

matc = [[0 for _ in range(n)] for _ in range(m)]

for i in range(m):
    for j in range(n):
        for k in range(p):
            matc[i][j] += mata[i][k]*matb[k][j]


for row in matc:
    print(row)
