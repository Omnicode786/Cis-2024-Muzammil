class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

class Linkedlist:
    def __init__(self):
        self.head= None
    def insert(self,data):
        new_node = Node(data)
        new_node.next = self.head
        self.head = new_node

    def inser_at_pos(self,pos,data):
        x = Node(data)
        if pos == 0:
            
            x.next = self.head
            self.head = x
            return
        current = self.head
        count = 0
        while current is not None and count < pos - 1:
                current = current.next
                count += 1

            # If index is out of range
        if current is None:
            raise IndexError("Index out of range")
        x.next = current.next
        current.next = x

    def printList(self):
         current= self.head
         while current is not None:
              print(current.data, end=" ")
              current = current.next
    def search(self,data):
         current = self.head
         index = 0
         while current is not None:
              if current.data == data:
                  return index
              index +=1
              current = current.next
         return -1 
    def delete(self,data):
         current = self.head
         while current.next.data != data:
              current = current.next
         current.next = current.next.next

a = Linkedlist()
a.insert(8)
a.insert(78)

a.inser_at_pos(1,9)
a.inser_at_pos(0,95)

a.printList()
print()
found = a.search(4)
print(found)
a.delete(78)

a.printList()