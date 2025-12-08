def SElectionSort(val):
    m = len(val)
    for i in range (0,m):
        min = i
        for j in range(i,m):
            if val[min] > val[j]:
                min = j
        if min != i:
            val[i],val[min] = val[min], val[i]
    return val
nums = [43,43,2,42,1,424,52,5,2,1,4,5,6,7,7,4]
SElectionSort(nums)
print(nums)