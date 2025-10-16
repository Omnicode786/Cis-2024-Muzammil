
def BinarySearch(arr,target):
    if arr is not sorted(arr):
        print("Array is not sorted, sorting the array")
        arr.sort()
    size= len(arr)
    low = 0
    high = size-1
    while(low<=high):
        mid = (low + high) // 2
        if arr[mid] > target:
            high = mid-1
        elif arr[mid] < target:
            low = mid+1
        else:
            return mid
    arr.insert(low, target)
    list1= arr
    print("Target does not exist inserting in array")
    print(list1)
    return -1

list1 = [5,43,5,43,43,5,3,53,2,423]

found = BinarySearch(list1,49456)
print(found)