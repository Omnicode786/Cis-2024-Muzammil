import timeit
# custom search
def custom_search(arr, x):
    for i in range(len(arr)):
        if arr[i] == x:
            return i
    return -1
# input array
arr = list(map(int, input("Enter numbers separated by space: ").split()))
x = int(input("Enter number to search: "))
# results
print("Custom search result:", custom_search(arr, x))
print("Built-in search result:", arr.index(x) if x in arr else -1)
# timings
print("Custom search time:", timeit.timeit("custom_search(arr, x)", globals=globals(), number=1000))
print("Built-in search time:", timeit.timeit("arr.index(x)", globals=globals(), number=1000))
