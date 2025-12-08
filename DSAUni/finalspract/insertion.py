def insertionSort(val):
    m = len(val)
    for i in range(1,m):
        x = val[i]
        j = i-1
        while j >= 0 and val[j] > x:
            val[j+1] = val[j]
            j -= 1
        val[j+1] = x
    return val


nums = [43,43,2,42,1,424,52,5,2,1,4,5,6,7,7,4]
insertionSort(nums)
print(nums)