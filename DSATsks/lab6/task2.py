
class Node:
    def __init__(self, item=None, next=None):
        self.item = item
        self.next = next

class LinkedList:
    def __init__(self):
        self.head = Node()  # Dummy head node
        self.first = self.head
        self.last = self.head
        self.size = 0

    # --- Insertion at a given index ---
    def insert(self, index, item):
        if index < 0 or index > self.size:
            print("Invalid index")
            return

        cursor = self.head
        for _ in range(index):
            cursor = cursor.next

        new_node = Node(item, cursor.next)
        cursor.next = new_node

        if cursor == self.last:
            self.last = new_node

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
        cursor = self.head
        while cursor.next:
            if cursor.next.item == item:
                to_delete = cursor.next
                cursor.next = to_delete.next
                if to_delete == self.last:
                    self.last = cursor
                self.size -= 1
                return True
            cursor = cursor.next
        return False  # Item not found

    # --- Display the list ---
    def display(self):
        current = self.head.next
        while current:
            print(current.item, end=" ")
            current = current.next
        print("None")

# Create linked list
ll = LinkedList()

# Insert elements
ll.insert(0, 10)  # Insert at head
ll.insert(1, 20)  # Insert at index 1
ll.insert(1, 15)  # Insert at index 1 again

print("After insertions:")
ll.display()  # Expected: 10 -> 15 -> 20 -> None

# Search elements
print("Search 15:", ll.search(15))  # Expected: 1
print("Search 100:", ll.search(100))  # Expected: -1

# Delete elements
ll.delete(15)
print("After deleting 15:")
ll.display()  # Expected: 10 -> 20 -> None

ll.delete(10)
print("After deleting 10:")
ll.display()  # Expected: 20 -> None
