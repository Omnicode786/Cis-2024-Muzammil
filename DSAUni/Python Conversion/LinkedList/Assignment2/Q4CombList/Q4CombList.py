
class Linknode:
    def __init__(self, data):
        self.data = data
        self.next = None
    

    def insert(self, data):
        x = Linknode(data)
        x.next = self.next
        self.next = x

    def combine(self,list2):
        a = self
        while a.next is not None:
           

            a = a.next
        a.next = list2

a = Linknode(5)
a.insert(7984)
a.insert(3)
a.insert(9)
a.insert(7)
a.insert(7)
a.insert(7)

a.insert(66)


c = Linknode(545)
c.insert(7984)
c.insert(34)
c.insert(94)
c.insert(4)
c.insert(457)
c.insert(547)

c.insert(646)


b = a
print("A:")
while b is not None:
    print(b.data, end=" ")
    b = b.next
print()
print("B")
d = c
while d is not None:
    print(d.data, end=" ")
    d = d.next




a.combine(c)
b = a
print("A:")
while b is not None:
    print(b.data, end=" ")
    b = b.next
print()
print("B")
d = c
while d is not None:
    print(d.data, end=" ")
    d = d.next
