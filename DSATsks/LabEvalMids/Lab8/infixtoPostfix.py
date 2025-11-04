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
            while stack.top() != '(':
                output += stack.pop()
            stack.pop()
        
    return output
    

expr2 = "((a+b)/c)^((d-e)*f)"
print("Infix to Postfix:", infixToPostfix(expr2))
