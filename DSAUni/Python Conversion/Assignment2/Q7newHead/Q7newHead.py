class Linknode:
    def __init__(self, data):
        self.data = data
        self.next = None
    

    def insert(self, data):
        x = Linknode(data)
        x.next = self.next
        self.next = x
    def newHead(self,x):
        a = self
        H = self
        while a.next != None:
            if a.data == x:
                H.data = a.data
                H.next = a.next
                
            a = a.next



    
def newHEAD(H,val):
    a = H
    while a.next != None:
        if a.data == val:
            H.data = a.data
            H.next = a.next
            return H
        a = a.next
    return H

a = Linknode(5)
a.insert(7)
a.insert(853)
a.insert(345)
a.insert(954)
a.insert(46)
a.insert(3)
a.insert(9)
a.insert(3)
a.insert(9)

b = a

while b is not None:
    print(b.data, end=" ")
    b = b.next
a.newHead(3)
print()

print("New head")
b = a

while b is not None:
    print(b.data, end=" ")
    b = b.next

# a.newHead(853)



print()

print("New head")
b = newHEAD(a,46)

while b is not None:
    print(b.data, end=" ")
    b = b.next