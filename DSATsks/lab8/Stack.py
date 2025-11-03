class Stack:
    def __init__(self):
        self.stack = []
        self.maxofstack = 50
        self.top_index = -1
    
    def isEmpty(self):
        return self.top_index == -1
    def isFull(self):
        return self.top_index >= self.maxofstack - 1
    
    def push(self, value):
        if self.isFull():
            return -1
        else:
            self.stack.append(value)
            self.top_index += 1
    
    def pop(self):
        if self.isEmpty():
            return -1
        else:
            item = self.stack.pop()
            self.top_index -= 1
            return item
    def top(self):
        if self.isEmpty():
            return -1
        else:
            return self.stack[self.top_index]
    def printStack(self):
        print(self.stack)




