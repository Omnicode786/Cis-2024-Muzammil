
class Linknode:
    def __init__(self, data):
        self.data = data
        self.next = None
    

    def insert(self, data):
        x = Linknode(data)
        x.next = self.next
        self.next = x

    def BubbleSort(self):

        a = self
        swap = False
        while a.next is not None:
            swap = False
            b = a.next
            while b is not None:
                if a.data > b.data:
                    temp = a.data 
                    a.data = b.data
                    b.data = temp
                    swap = True
                b = b.next
            if swap is False:
                return
            a = a.next




a = Linknode(7)
a.insert(56)
a.insert(1)
a.insert(3)
a.insert(94)
a.insert(645)

b = a
print("A:")
while b is not None:
    print(b.data, end=" ")
    b = b.next

a.BubbleSort()
b = a
print("A:")
while b is not None:
    print(b.data, end=" ")
    b = b.next
