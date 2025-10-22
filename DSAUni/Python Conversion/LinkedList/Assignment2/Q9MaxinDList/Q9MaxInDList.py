class DoublyList:
    def __init__(self, data):
        self.data = data
        self.prev = None
        self.next = None
    def insert(self, data):
        x = DoublyList(data)
        x.next = self.next
        if self.next is not None:
            self.next.prev = x
        self.next = x
        x.prev = self

    
    def MaxinDoublyList(self):
        a = self
        max = 0 
        while a is not None:
            if a.data > max:
                max = a.data
            a = a.next
        return max




a = DoublyList(5)

a.insert(6478)
a.insert(641452)
a.insert(67542)
a.insert(86453)


b = a


while b is not None:
    print(b.data)
    b = b.next

print("Max in the lsit is the number")
print(a.MaxinDoublyList())