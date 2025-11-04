class Queue:
    def __init__(self):
        self.values = []

    def enqueue(self, value):
        self.values.append(value)
    
    def dequeu(self):
        if self.isEmpty():
            return -1
        front = self.values[0]
        self.values = self.values[1:]
        return front
    def isEmpty(self):
        if len(self.values<= 0):
            return True
        return False

queue = Queue()

queue.enqueue(5)
queue.enqueue(234)
queue.enqueue(234)
queue.enqueue(545)
queue.enqueue(665)

queue.dequeu()
queue.dequeu()
queue.dequeu()
print(queue.values)
