class Node:
    def __init__(self, data):
        self.data = data
        self.next = None


class LinkedQueue:
    def __init__(self):
        self.front = None
        self.rear = None
    

    def isEmpty(self):
        if self.front == self.rear:
            return True
        return False
    
    def enqueue(self, value):
        x = Node(value)
        if self.front == None:
            self.front = self.rear = x
    
        else:
            self.rear.next = x
            self.rear = x
        
    
    def dequeue(self):
        if self.isEmpty():
            print("Queue is empty")
            return
    
        else:
            self.front = self.front.next
            if self.front is None:
                self.rear = None
    
    def display(self):
        temp = self.front

        while temp is not None:
            print(temp.data)
            temp = temp.next

    def FRONT(self):
        if self.isEmpty():
            print("The queue is empty")
            return
        return self.front.data


q = LinkedQueue()

q.enqueue(10)
q.enqueue(20)
q.enqueue(30)
print("Queue after enqueueing 3 elements:")
q.display()

print("Front element:", q.FRONT())

q.dequeue()
print("\nQueue after one dequeue:")
q.display()

q.dequeue()
q.dequeue()
q.dequeue()  # Try to dequeue from empty queue