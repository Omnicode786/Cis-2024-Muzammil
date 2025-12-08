from LinkedClass import Linknode

def prefixsum(inlist):
    if inlist is None:
        return
    out = Linknode(inlist.data)
    a = inlist.next
    b = out
    while a is not None:
        b.next = Linknode(b.data + a.data)
        b = b.next
        a = a.next
    
    return out
nums = [3,1,6,2]
a = Linknode(5)
for i in range(len(nums)):
    a.insert(nums[i])
    
b = prefixsum(a)

while b is not None:
    print(b.data)
    b = b.next