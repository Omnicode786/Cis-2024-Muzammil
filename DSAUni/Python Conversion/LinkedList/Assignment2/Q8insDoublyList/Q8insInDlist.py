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

    def insAtY(self,X, Y):
        a = self 
        while a is not None:
            if a.data == Y:
                a.insert(X)
                return
            a = a.next
            
        print(f"Node with data {Y} not found.")


a = DoublyList(5)

a.insert(6478)
a.insert(641452)
a.insert(67542)
a.insert(86453)


b = a



while b is not None:
    print(b.data)
    b = b.next

a.insAtY(44,86453)
a.insAtY(454,5)
a.insAtY(9534,6478)

b = a



while b is not None:
    print(b.data)
    b = b.next