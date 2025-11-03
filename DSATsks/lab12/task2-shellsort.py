def ShellSort(nums):

    size = len(nums)
    k = size // 2

    while k > 0:
        for i in range(k,size):
            key = nums[i]
            j = i
            while j >= k and nums[j-k] > key:
                nums[j] = nums[j-k]
                j = j-k
            nums[j] = key
        k = k // 2


nums = [3,43,1,3,43,3,43,2,4,53]
print(nums)

ShellSort(nums)
print(nums)

