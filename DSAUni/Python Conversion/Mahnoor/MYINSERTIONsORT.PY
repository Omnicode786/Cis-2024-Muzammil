def insertionSort2(arr):
    length = len(arr)
    for i in range (1,length):
        j = i
        while j> 0 and arr[j-1] > arr[j]:
            arr[j], arr[j-1]    = arr[j-1],arr[j]
            j= j - 1


def main():
    arr = [44,443,32,1,34,4,5,76]
    print(arr)
    insertionSort2(arr)
    print(arr)
main()