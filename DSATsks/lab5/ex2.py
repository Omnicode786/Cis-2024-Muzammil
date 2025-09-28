sparse_matrix = [[3,0,0],[4,6,0],[4,0,0]]

n = int(len(sparse_matrix))


print(n)
size = int((0.5)*n*(n+1))
U =[0 for _ in range(size)] 

print(U)
i = 0
for row in sparse_matrix:
    for j, value in enumerate(row):
        if value != 0:
            U[i] = value
            i = i+1
            print(value)
print(U)
