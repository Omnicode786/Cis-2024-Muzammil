# matrix multiplications

# look for the pointer that will be moving

MATA = [[3,3,2],[4,5,6],[77,4,3]]
MATB = [[38,73,22,5],[4,50,3,6],[7,4,3,4]]

import timeit

colA = len(MATA[0])
rowA = len(MATA)
colB= len(MATB[0])
rowB = len(MATB)
if colA != rowB:
    print("Matrix multiplication not possible")

else:
    C = [[0 for _ in range(colB)] for _ in range(rowA)]
    start = timeit.timeit()
    for i in range(rowA):
        for j in range(colB):
            for k in range(colA):
                C[i][j] = C[i][j] + (MATA[i][k] * MATB[k][j])
                # mat[i] because that row will remain till j is not finished get it
        
    print(C)
    print("Python time: ", timeit.timeit() - start)