class Node:
    def __init__(self, data=None):
        self.data = data
        self.next = None

class Linklist:
    def __init__(self):
        self.head = Node()
        self.tail = self.head
    def insert(self,data):
        x = Node(data)
        self.tail.next = x
        self.tail = x
    def printlist(self):
        b = self.head.next
        while b != None:
            print(b.data,end=" ")
            b = b.next

a = Linklist()
a.insert(5)
a.insert(6)
a.insert(8)
a.insert(43)
a.insert(4)
a.printlist()