# count element in a list until we find a tuple then return the addresses of the tupple as well as the list

list_not_tupple = []
tupple_index = 0

num = [1,2,3,(4,5),6]

for i,elem in enumerate(num):
    if isinstance(elem,tuple):
        tupple_index = i
        break
    list_not_tupple.append(elem)

list_addr = id(num)
print(f"the items before tupple are: {list_not_tupple}")
print(f"The index of the tuple is: {tupple_index}")
print(f"The address of the list is: {list_addr}")
print(f"The address of the tupple is: {id(num[tupple_index])}")