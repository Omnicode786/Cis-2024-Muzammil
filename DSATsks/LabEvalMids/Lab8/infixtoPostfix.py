from Stack import Stack

def infixToPostfix(expression):
    stack = Stack()
    output = ""
    operators  = "+-*/^"
    def precedence(ch):
        if ch in ['+', '-']:
            return 1
        elif ch in ['*', '/']:
            return 2
        else: return 3

    stack.push('(')
    expression += ')'

    for token in expression:
        if token.isalnum():
            output+=token
        elif token == '(':
            stack.push(token)
        elif token in operators:
            while not (stack.isEmpty()) and  precedence(stack.top()) >= precedence(token):
                output += stack.pop()
            stack.push(token)
        elif token == ')':
            while not stack.isEmpty() and  stack.top() != '(':
                output += stack.pop()
            stack.pop()
        
    return output
    

expr = "2+((9-3)/2+7)*4-6"
print("Infix to Postfix:", infixToPostfix(expr))
