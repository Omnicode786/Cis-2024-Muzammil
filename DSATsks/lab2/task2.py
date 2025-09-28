import timeit

# dict insert
def dict_insert(d, k, v):
    d2 = d.copy()
    d2[k] = v
    return d2

# diction delete
def dict_delete(d, k):
    d2 = {}
    for key in d:
        if key != k:
            d2[key] = d[key]
    return d2

# dict search
def dict_search(d, k):
    for key in d:
        if key == k:
            return d[key]
    return None


# tuple insert
def tuple_insert(t, data, pos):
    return t[:pos] + (data,) + t[pos:]

# tuple delete
def tuple_delete(t, data):
    return tuple(x for x in t if x != data)

# tuple search
def tuple_search(t, data):
    for i in range(len(t)):
        if t[i] == data:
            return i
    return -1


d = {1:"a", 2:"b", 3:"c"}
t = (1,2,3,4,5)

# checking outputs
print("Custom dict insert:", dict_insert(d, 4, "z"))
print("Custom dict delete:", dict_delete(d, 2))
print("Custom dict search:", dict_search(d, 3))

print("Custom tuple insert:", tuple_insert(t, 99, 2))
print("Custom tuple delete:", tuple_delete(t, 3))
print("Custom tuple search:", tuple_search(t, 4))


# timings
print("\n Dictionary timings")
print("Insert custom:", timeit.timeit("dict_insert(d,4,'z')", globals=globals(), number=1000))
print("Insert built-in:", timeit.timeit("d2=d.copy(); d2[4]='z'", globals=globals(), number=1000))

print("Delete custom:", timeit.timeit("dict_delete(d,2)", globals=globals(), number=1000))
print("Delete built-in:", timeit.timeit("d2=d.copy(); d2.pop(2)", globals=globals(), number=1000))

print("Search custom:", timeit.timeit("dict_search(d,3)", globals=globals(), number=1000))
print("Search built-in:", timeit.timeit("d.get(3)", globals=globals(), number=1000))

print("\nTuple timings")
print("Insert custom:", timeit.timeit("tuple_insert(t,99,2)", globals=globals(), number=1000))
print("Insert built-in:", timeit.timeit("l=list(t); l.insert(2,99); tuple(l)", globals=globals(), number=1000))

print("Delete custom:", timeit.timeit("tuple_delete(t,3)", globals=globals(), number=1000))
print("Delete built-in:", timeit.timeit("l=list(t); l.remove(3); tuple(l)", globals=globals(), number=1000))

print("Search custom:", timeit.timeit("tuple_search(t,4)", globals=globals(), number=1000))
print("Search built-in:", timeit.timeit("t.index(4)", globals=globals(), number=1000))
