# we are basically inserting inthsi

import timeit

def insert_pos(list1,pos,data):
    return list1[:pos]  + [data] + list1[pos:]

def delete(list1,data):
    return list(x for x in list1 if x != data)

def search(list1,data):
    for idx, nums in enumerate(list1):
        if nums == data:
            return idx
    return -1


list1 = [2,3,4,23,5]

print(list1)
list1= insert_pos(list1,3,222)

print(list1)

list1 = delete(list1,4)
print(list1)

pos = search(list1,222)
print(pos)

print("Custom insert function", timeit.timeit("insert_pos(list1,55,5)",globals=globals() ,number=1000))
print("Custom delete function", timeit.timeit("delete(list1,3)",globals=globals() ,number=1000))
print("Custom search function", timeit.timeit("search(list1,222)",globals=globals() ,number=1000))

print("builtin insert function", timeit.timeit("list1.insert(55,7)",globals=globals() ,number=1000))
print("builtin delete function", timeit.timeit("list1.remove(7)",globals=globals() ,number=1000))
print("builtin search function", timeit.timeit("list1.index(3)",globals=globals() ,number=1000))