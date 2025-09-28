matrix = [[4,0,0],[0,5,7],[6,0,3],[6,9,8]]
sparse_list = []
sparse_matrix = {}
for i, row in enumerate(matrix):
    for j, value in enumerate(row):
        if value != 0:
            sparse_matrix[(i,j)] = value 
            sparse_list.append(value)

print(sparse_matrix)
print(sparse_list)