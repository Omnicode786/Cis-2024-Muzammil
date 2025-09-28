import timeit
# Dictionary algo
def dict_insert(d, key, value):
    new_d = d.copy()
    new_d[key] = value
    return new_d
def dict_delete(d, key):
    new_d = {}
    for k in d:
        if k != key:
            new_d[k] = d[k]
    return new_d
def dict_search(d, key):
    for k in d:
        if k == key:
            return d[k]
    return None
# Tuple algp
def tuple_insert(t, data, pos):
    return t[:pos] + (data,) + t[pos:]
def tuple_delete(t, data):
    new_t = ()
    for x in t:
        if x != data:
            new_t += (x,)
    return new_t
def tuple_search(t, data):
    for i in range(len(t)):
        if t[i] == data:
            return i
    return -1
test_dict = {i: i for i in range(10000)}
test_tuple = tuple(range(10000))
# geekbench
print(" Dictionary")
print("Insert - Custom:", timeit.timeit("dict_insert(test_dict, 99999, -1)", globals=globals(), number=1000))
print("Insert - Built-in:", timeit.timeit("test_dict[99999] = -1", globals=globals(), number=1000))

print("Delete - Custom:", timeit.timeit("dict_delete(test_dict, 9999)", globals=globals(), number=1000))
print("Delete - Built-in:", timeit.timeit("test_dict.pop(9999, None)", globals=globals(), number=1000))

print("Search - Custom:", timeit.timeit("dict_search(test_dict, 9999)", globals=globals(), number=1000))
print("Search - Built-in:", timeit.timeit("test_dict.get(9999)", globals=globals(), number=1000))

print("\n Tuple ")
print("Insert - Custom:", timeit.timeit("tuple_insert(test_tuple, 99999, 5000)", globals=globals(), number=1000))
print("Insert - Built-in (via list):", timeit.timeit("list(test_tuple).insert(5000, 99999); t=tuple(l)", globals=globals(), number=1000))

print("Delete - Custom:", timeit.timeit("tuple_delete(test_tuple, 9999)", globals=globals(), number=1000))
print("Delete - Built-in (via list):", timeit.timeit("list(test_tuple.remove(9999); t=tuple(l)", globals=globals(), number=1000))

print("Search - Custom:", timeit.timeit("tuple_search(test_tuple, 9999)", globals=globals(), number=1000))
print("Search - Built-in:", timeit.timeit("test_tuple.index(9999)", globals=globals(), number=1000))
