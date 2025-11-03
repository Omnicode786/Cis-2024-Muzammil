def ShellSort(nums):
    size = len(nums)

    k = size // 2
    while k > 0:
        for i in range(k, size):
            j = i
            key = nums[i]
            while j >= k and nums[j-k] > key: 
            #  if j is not greater or equal tok then we will have -ve indecis   
                nums[j] = nums[j-k]
                j = j-k
            nums[j] = key
        k = k//2


nums = [33,2,1,0,333,32,321,421,12]
print(nums)
ShellSort(nums)
print(nums)