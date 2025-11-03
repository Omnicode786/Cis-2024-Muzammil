def MahnoorInsertionSort(nums):


    size = len(nums)

    for i in range(size):
        j = i-1
        while j >= 0 and nums[j] > nums[j+1]:
            nums[j+1],nums[j] = nums[j], nums[j+1]
            j = j-1


def InsertionSort(nums):


    size = len(nums)

    for i in range(size):
        j = i
        while j > 0 and nums[j-1] > nums[j]:
            nums[j-1],nums[j] = nums[j], nums[j-1]
            j = j-1


nums = [22,3,1,2,23,231,5,232,45]
print(nums)
InsertionSort(nums)
print(nums)