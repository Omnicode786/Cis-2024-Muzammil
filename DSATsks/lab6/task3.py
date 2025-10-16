class Node:
    def __init__(self, item=None):
        self.item = item
        self.next = None
        self.prev = None


class DoublyLinkedList:
    def __init__(self):
        self.head = Node()  # Dummy head node
        self.tail = self.head
        self.size = 0

    # --- Insertion at a given index ---
    def insert(self, index, item):
        if index < 0 or index > self.size:
            print("Invalid index")
            return

        cursor = self.head
        for _ in range(index):
            cursor = cursor.next

        new_node = Node(item)
        new_node.next = cursor.next
        new_node.prev = cursor

        if cursor.next:
            cursor.next.prev = new_node
        cursor.next = new_node

        if cursor == self.tail:
            self.tail = new_node

        self.size += 1

    # --- Search for an item ---
    def search(self, item):
        cursor = self.head.next
        position = 0
        while cursor:
            if cursor.item == item:
                return position
            cursor = cursor.next
            position += 1
        return -1  # Not found

    # --- Delete a node with a given item ---
    def delete(self, item):
        cursor = self.head.next
        while cursor:
            if cursor.item == item:
                if cursor.next:
                    cursor.next.prev = cursor.prev
                cursor.prev.next = cursor.next

                if cursor == self.tail:
                    self.tail = cursor.prev

                self.size -= 1
                return True
            cursor = cursor.next
        return False  # Item not found

    # --- Display the list forward ---
    def display_forward(self):
        current = self.head.next
        while current:
            print(current.item, end=" <-> ")
            current = current.next
        print("None")

    # --- Display the list backward ---
    def display_backward(self):
        current = self.tail
        while current != self.head:
            print(current.item, end=" <-> ")
            current = current.prev
        print("None")

# Create doubly linked list
dll = DoublyLinkedList()

# Insert elements
dll.insert(0, 10)  # Insert at head
dll.insert(1, 20)  # Insert at index 1
dll.insert(1, 15)  # Insert at index 1

print("Doubly Linked List (Forward):")
dll.display_forward()  # Expected: 10 <-> 15 <-> 20 <-> None

print("Doubly Linked List (Backward):")
dll.display_backward()  # Expected: 20 <-> 15 <-> 10 <-> None

# Search elements
print("Search 15:", dll.search(15))  # Expected: 1
print("Search 100:", dll.search(100))  # Expected: -1

# Delete elements
dll.delete(15)
print("After deleting 15 (Forward):")
dll.display_forward()  # Expected: 10 <-> 20 <-> None

dll.delete(10)
print("After deleting 10 (Forward):")
dll.display_forward()  # Expected: 20 <-> None

print("After deleting 10 (Backward):")
dll.display_backward()  # Expected: 20 <-> None
