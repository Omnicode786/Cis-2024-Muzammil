class Linknode:
    def __init__(self, data):
        self.data = data
        self.next = None
    

    def insert(self, data):
        x = Linknode(data)
        x.next = self.next
        self.next = x
    def del_tail(self):
        a = self 
        while a is not None:
            if a.next.next == None:
                a.next = None
            a = a.next


a = Linknode(5)
a.insert(7984)
a.insert(3)
a.insert(9)
a.insert(7)
a.insert(7)
a.insert(7)
a.insert(66)



b = a
while b is not None:
    print(b.data, end=" ")
    b = b.next

print("After deletion of tail from the list")

a.del_tail()

b = a
while b is not None:
    print(b.data, end=" ")
    b = b.next

