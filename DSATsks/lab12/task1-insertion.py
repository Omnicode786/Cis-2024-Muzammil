def insertionSort(nums):
    size = len(nums)
    for i in range (size):
        j = i
        while j >0 and nums[j-1] > nums[j]:
            nums[j-1],nums[j] = nums[j],nums[j-1]
            j = j-1




nums = [4234,32,3,2,1,333,43231,12,23,4,23]

print(nums)
insertionSort(nums)
print(nums)