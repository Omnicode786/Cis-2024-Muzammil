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
            print(f"Cannot push {value} stack is full")
        else:
            self.stack.append(value)
            self.top_index += 1
            print(f"Pushed the value {value} in the stack")
    
    def pop(self):
        if self.isEmpty():
            print("Stack underflow Cannot pop")
        else:
            item = self.stack.pop()
            self.top_index -= 1
            print(f"Popped {item} from the stack")
            return item
    def top(self):
        if self.isEmpty():
            print("Stack is empty no top elem")
        else:
            return self.stack[self.top_index]
    def printStack(self):
        print("printing the value in the stack")
        print(self.stack)




stk = Stack()
stk.printStack()

stk.push(5)
stk.push(78)
stk.push(589)
stk.push(475)
stk.push(5+6)
stk.printStack()
print(stk.pop())
stk.printStack()
print(stk.top())
