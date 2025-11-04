class CircularQueue:
    def __init__(self, maxsize):
        self.maxsize = maxsize
        self.nums = [None] * maxsize
        self.front = 0
        self.rear = self.maxsize - 1
    

    def ADDONE(self, i):
        return (i + 1) % self.maxsize

    def isFull(self):
        if self.ADDONE(self.ADDONE(self.rear)) == self.front:
            return True
        return False
    def isEmpty(self):
        if self.ADDONE(self.rear) == self.front:
            return True
        return False

    def Enqueue(self,value):
        if self.isFull():
            print("OverFlow")
            return
        else:
            self.rear = self.ADDONE(self.rear)
            self.nums[self.rear] = value
    
    def Dequeue(self):
        if self.isEmpty():
            print("Queue is Empty")
            return
        else:
            front = self.nums[self.front]
            self.front = self.ADDONE(self.front)
            return front
    def FRONT(self):
        return self.nums[self.front]
    


queue = CircularQueue(5)
queue.Enqueue(77)
queue.Enqueue(77)
queue.Enqueue(77)
queue.Enqueue(755)
print(queue.Dequeue())
queue.Dequeue()
queue.Dequeue()

queue.Dequeue()
queue.Dequeue()
queue.Dequeue()
queue.Dequeue()

queue.Dequeue()


print(queue.nums)