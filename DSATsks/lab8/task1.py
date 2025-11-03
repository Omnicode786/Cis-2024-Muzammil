from Stack import Stack

def evaluatePostFix(expression):
    s = Stack()
    expression += ')'
    operators = set(['+', '-', '*', '/'])

    expression.replace(' ','')
    exp = "".join(expression.split())
    tokens= expression.strip()
    
    
    for token in tokens:
        if token == ' ':
            continue
        if token == ')':
            break
        elif token not in operators:
            num = int(token)
            s.push(num)
        else:
            Top = s.pop()
            NextTop = s.pop()

            if token == '+':
                s.push(NextTop+Top)
            elif token == '-':
                s.push(NextTop-Top)
            elif token == '*':
                s.push(NextTop*Top)
            elif token == '/':
                s.push(NextTop/Top)


    return s.top()  #final evaluated value


postfix_expr = "3 4 + 2 * 7 /"  # ((3 + 4) * 2) / 7
result = evaluatePostFix(postfix_expr)
print("Value of postfix expression:", result)