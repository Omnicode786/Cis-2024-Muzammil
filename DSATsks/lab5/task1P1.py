A = [[3,0,0],[4,6,0],[4,0,0]]

n = int(len(A))


print(n)
size = int((0.5)*n*(n+1))
U =[0 for _ in range(size)] 

i = 0
for j in range(n):
    for k in range(j+1):
        U[i] = A[j][k]
        i +=1

print(U)