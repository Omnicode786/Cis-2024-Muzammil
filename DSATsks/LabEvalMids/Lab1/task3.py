nums= [2,2,4,3,4,23,3,2,1,2,3,4,5,6]

unique_nums = []
for num in nums:
    if num not in unique_nums:
        unique_nums.append(num)

print(unique_nums)
unique_nums = []
# a better appraoch wil be

unique_nums = list(set(nums))
print(unique_nums)
# this will sort as well so better i thinkso
