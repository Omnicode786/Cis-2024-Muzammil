# remove duplciates from the list


mynum = [1,1,2,2,3,4,5,5,6]
unique_num = []
# my initial thought
for num in mynum:
    if num not in unique_num:
        unique_num.append(num)
print(unique_num)
# better approach

unique_num2 = list(set(mynum))
print(unique_num2)