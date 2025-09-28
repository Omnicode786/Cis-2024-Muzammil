def take_input():
    arr = list(map(int, input("Enter sorted numbers separated by space: ").split()))
    # check if sorted
    if arr != sorted(arr):
        print("Warning: Data is not sorted!")
    return arr

def binary_search_insert(arr, x):
    low, high = 0, len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == x:
            return mid, arr  # found
        elif arr[mid] < x:
            low = mid + 1
        else:
            high = mid - 1
    arr.insert(low, x)
    return -1, arr


arr = take_input()
x = int(input("Enter number to search: "))
pos, arr = binary_search_insert(arr, x)
if pos != -1:
    print(f"Element found at index {pos}")
    print("Updated array:", arr)
    
else:
    print("Element not found. Inserted into array.")
    print("Updated array:", arr)
