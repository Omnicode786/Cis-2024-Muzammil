class Linknode:
    def __init__(self, data):
        self.data = data
        self.next = None
    

    def insert(self, data):
        x = Linknode(data)
        x.next = self.next
        self.next = x
    def ins_tail(self,x):
        a = self 
        while a.next.next is not None:
            a = a.next
        a.insert(x)

    
a = Linknode(5)
a.insert(7)
a.insert(3)
a.insert(9)
a.insert(3)
a.insert(9)
a.insert(3)
a.ins_tail(8)
a.ins_tail(46446)


b = a

while b is not None:
    print(b.data, end=" ")
    b = b.next

