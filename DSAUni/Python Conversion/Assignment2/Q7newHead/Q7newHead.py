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
        while a.next != None:
            if a.data == x:
                self.data = a.data
                self.next = a.next
            a = a.next



    
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

a.newHead(853)
print()

print("New head")
b = a

while b is not None:
    print(b.data, end=" ")
    b = b.next