import numpy as np
from scipy.sparse import csr_matrix

dense_matrix = np.array([
    [1, 0, 0, 0, 2, 0],
    [0, 0, 3, 0, 0, 4],
    [5, 0, 0, 6, 0, 0]
])

sparse_csr = csr_matrix(dense_matrix)
print("Non-zero values:", sparse_csr.data)

print("Dense form:\n", sparse_csr.toarray())
