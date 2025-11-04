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
            return ""
        else:
            item = self.stack.pop()
            self.top_index -= 1
            return item
    
    def top(self):
        if self.isEmpty():
            return ""
        else:
            return self.stack[self.top_index]
    
    def printStack(self):
        print(self.stack)


def infixToPostfix(expression):
    stack = Stack()
    output = ""
    operators  = "+-*/^"
    
    def precedence(ch):
        if ch in ['+', '-']:
            return 1
        elif ch in ['*', '/']:
            return 2
        else:
            return 3

    stack.push('(')
    expression += ')'

    for token in expression:
        if token.isalnum():
            output += token
        elif token == '(':
            stack.push(token)
        elif token in operators:
            while not stack.isEmpty() and stack.top() != '(' and precedence(stack.top()) >= precedence(token):
                output += stack.pop()
            stack.push(token)
        elif token == ')':
            while stack.top() != '(':
                output += stack.pop()
            stack.pop()
        
    return output
    

expr2 = "((a+b)/c)"
print("Infix to Postfix:", infixToPostfix(expr2))
