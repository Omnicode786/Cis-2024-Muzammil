class Node:
    def __init__(self, data=None):
        self.data = data  
        self.next = None  
class LinkedList:
    def __init__(self):
        self.head = Node()
        self.tail = self.head

    def append(self, data):
        new_node = Node(data)
        self.tail.next = new_node
        self.tail = new_node

    def printList(self):
        current = self.head.next 
        while current:
            print(current.data, end=" ")
            current = current.next
        print("None")


ll = LinkedList()       
ll.append(10)          
ll.append(20)
ll.append(30)

print("Linked List:")
ll.printList()
