def bubbleSort(list1):
    length = len(list1)
    swapp = False
    for i in range(length):
        swapp = False
        for j in range (length - 1-i):
            if list1[j] > list1[j+1]:
                list1[j],list1[j+1] = list1[j+1], list1[j]
                swapp = True
            if swapp is not True:
                break


list1 = [44,3,2,66,8,22,444]
print(list1)

bubbleSort(list1)
print(list1)