class Node:
    def __init__(self, data):
        self.data = data
        self.next = None
        self.prev = None
class LinkedList:
    def __init__(self):
        self.head = None
    def insert(self,data):
        x = Node(data)

        if self.head == None:
            self.head = x
            return
        else:
            
            current = self.head
            while current.next:
                current = current.next
            
            x.prev = current
            current.next = x
    def display_forward(self):
        current = self.head
        print("Forward:", end=" ")
        while current:
            print(current.data, end=" <-> ")
            last = current
            current = current.next
        print("None")

    def delete(self,data):
        if data == self.head.data:
            self.head = self.head.next
            return
        current = self.head

        while current is not None and current.data != data:
            current = current.next
        
        if current is None:
            print(f"Value {data} not found in the list.")
            return
        if current.next:
            current.next.prev = current.prev
        if current.prev:
            current.prev.next = current.next
    
    def search(self,data):
        current = self.head
        pos = 0
        while current:
            if current.data == data:
                print(pos)
                return pos
            pos += 1
            current = current.next
        print("DAta was not found")
        return -1


dll = LinkedList()
dll.insert(10)
dll.insert(20)
dll.insert(30)

dll.delete(30)
dll.display_forward()
print()
dll.insert(3)
dll.insert(40)
dll.insert(70)
dll.display_forward()
dll.search(70)
