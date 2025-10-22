


class Stack:
    def __init__(self,maxstk):
        self.stk = []
        self.top = -1
        self.maxstk = maxstk
        
    def push(self,data):
        if self.top == self.maxstk - 1:
            print("Cannot push, Stack is Full.")
            return -1
        self.stk.append(data)
        self.top += 1
    def pop(self):
        if self.top < 0:
            print("Cannot pop.")
            return -1
        item = self.stk[self.top]
        self.stk.remove(item)
        self.top -= 1
        return item
    def isEmpty(self):
        if self.top == -1:
            return True
    def topofstk(self):
        return self.stk[self.top]



