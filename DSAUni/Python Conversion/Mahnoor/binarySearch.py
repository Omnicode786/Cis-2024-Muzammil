def binarySearch(arr,target):
    low =0
    high = len(arr) - 1

    while low <= high:
        mid = (low + high) // 2
        print(mid)
        if arr[mid] > target:
            high = mid-1
        elif arr[mid] < target:
            low = mid + 1
        else:
            return mid, arr[mid]
    return 0,-1
    
arr = [1,4,5,6,44,333,444,532,542,3555,4334,5465,44344]

target = 532

index, targeted_value = binarySearch(arr, target)
print("Index:", index)
print("Targeted Value:", targeted_value)
