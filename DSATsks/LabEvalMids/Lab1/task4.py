list1 = [3,4,32,4,4,(4,6),23,4]


def counttillTupple(list1):
    count = 0

    for i in range(len(list1)):
        if isinstance(list1[i], tuple):
            return i,count
        count +=1
        
    return -1,count

doesTuppleExist, count = counttillTupple(list1)
print(doesTuppleExist,count)

print(list1[doesTuppleExist])