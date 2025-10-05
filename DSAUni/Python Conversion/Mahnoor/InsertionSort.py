

def insertionSort(arr):
    length = len(arr)
    for i in range(1,length):
        key = arr[i]
        j = i-1
        while j >= 0 and arr[j] > key:
            arr[j+1] = arr[j]
            j-=1
        arr[j+1] = key


arr = [33,4,22,11,4,5,2,32,4]

print(arr)
insertionSort(arr)
print(arr)

