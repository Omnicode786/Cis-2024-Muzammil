import numpy as np

from scipy.sparse import csc_matrix

B = [
    [5, -7, 0, 0],
    [1, 4, 3, 0],
    [0, 9, -3, 6],
    [0, 0, 2, 4]
]

sparsed = csc_matrix(B)
print(sparsed)

denseform = sparsed.data
print(denseform)

expanded = sparsed.toarray()
print(expanded)