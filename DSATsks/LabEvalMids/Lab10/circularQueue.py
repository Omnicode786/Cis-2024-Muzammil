class Queue:
    def __init__(self, maxsize):
        self.maxsize = maxsize
        self.elements = [None] * maxsize
        self.front = 0
        self.rear = maxsize - 1

    def ADDONE(self, i):
        return (i + 1) % self.maxsize
    def isFull(self):
#         We intentionally never let the queue fill completely.
# That empty space acts as a sentinel (marker) to separate the “empty” and “full” states.

# To enforce this rule, we make sure that:
        if self.ADDONE(self.ADDONE(self.rear)) == self.front:
            return True
        return False
        # essentially suppose rear is 3 and front is 0 now when inremented rolls back to 0 index so we cannot fully tel which is full and which is empty
        # so we use this neat trick to fix this suppose size 5 now at 4th position front gets back to 0
        # so now we wont be able to tell if its full or empty
        # so rear was on 2 add one makes it 3 and another add onemakes it 4 so 4 mod 4 makes it 0 and this 0 == 0 so its means its full



    def isEmpty(self):
        if self.ADDONE(self.rear) == self.front:
            return True
        return False

    def ENQUEUE(self, value):
        if self.isFull():
            print("OverFlow")
            return 
        else:

            self.rear = self.ADDONE(self.rear)
            # print("huh",self.rear)
            self.elements[self.rear] = value

    def DEQUEUE(self):
        if self.isEmpty():
            print("queue is empty")
            return

        else:
            item = self.elements[self.front]
            self.front = self.ADDONE(self.front)
            return item
            # we essentially move this forward and dont need to over ride it cas the rear coming from further pushes will clear itout itelf
    def FRONT(self):
        return self.elements[self.front]





# ---------------- DRIVER CODE ----------------

# Create a queue of size 5
q = Queue(5)

# Show initial state
print(f"Initial queue: {q.elements}")

# Enqueue some elements
q.ENQUEUE(10)
q.ENQUEUE(20)

q.ENQUEUE(30)
q.ENQUEUE(40)   # Should fill the queue

# Try to enqueue one more (should say full)
q.ENQUEUE(50)
print(f"Initial queue: {q.elements}")

# Peek at the front element
print("Front element:", q.FRONT())

# Dequeue two elements
print(q.DEQUEUE())
print(f"Initial queue: {q.elements}")

print(q.DEQUEUE())
print(f"Initial queue: {q.elements}")


# Enqueue again (tests circular wrap-around)
q.ENQUEUE(50)
q.ENQUEUE(60)
print(f"Initial queue: {q.elements}")

# Try one more enqueue (should say full again)
q.ENQUEUE(70)
print(q.DEQUEUE())

# Final state
print("Final queue:", q.elements)