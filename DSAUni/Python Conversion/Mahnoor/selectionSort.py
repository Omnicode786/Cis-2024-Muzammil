def selectionSort(list1):
    length = len(list1)

    for i in range(length):
        minindex = i
        for j in range (i+1,length):
            if (list1[minindex] > list1[j]):
                minindex = j
        list1[i],list1[minindex] = list1[minindex],list1[i]



list1 = [44,22,3,1,55,66,7,4,3]

print(list1)
selectionSort(list1)
print(list1)