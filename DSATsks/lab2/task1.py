import timeit

#custom insert algo
def ins(lst, data, pos):
    list1 = lst[:pos]
    list2 = lst[pos:]
    return list1 + [data] + list2

# custom delete algo 
def dele(lst, data):
    for i in range(len(lst)):
        if lst[i] == data:
            return lst[:i] + lst[i+1:]
    return lst

# custom search algo
def search(lst, data):
    for i in range(len(lst)):
        if lst[i] == data:
            return i
    return -1

test_list = list(range(10000))
# comparing the timings
print("Insert - Custom:", timeit.timeit("ins(test_list, 9999, 5000)", globals=globals(), number=1000))
print("Insert - Built-in:", timeit.timeit("test_list.insert(5000, 9999)", globals=globals(), number=1000))

print("Delete - Custom:", timeit.timeit("dele(test_list, 9999)", globals=globals(), number=1000))
print("Delete - Built-in:", timeit.timeit("test_list.remove(9999)", globals=globals(), number=1000))

print("Search - Custom:", timeit.timeit("search(test_list, 9999)", globals=globals(), number=1000))
print("Search - Built-in:", timeit.timeit("test_list.index(9999)", globals=globals(), number=1000))
