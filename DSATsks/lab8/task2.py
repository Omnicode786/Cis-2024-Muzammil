from Stack import Stack

# Helper function to define operator precedence
def precedence(op):
    if op == '+' or op == '-':
        return 1
    elif op == '*' or op == '/':
        return 2
    return 0  # For non-operators

# Function to convert infix expression to postfix
def infix_to_postfix(expression):
    s = Stack()
    s.push('(')          # Step 1: Push '(' onto stack
    expression += ')'    # Step 1: Add ')' at the end

    postfix = []         # Resulting postfix expression

    # Split expression by spaces for multi-digit numbers
    tokens = expression.split()

    for token in tokens:
        if token.isalnum():  # Operand (numbers or variables)
            postfix.append(token)
        elif token == '(':    # Left parenthesis
            s.push(token)
        elif token in '+-*/':  # Operator
            while not s.is_empty() and s.top() != '(' and precedence(s.top()) >= precedence(token):
                postfix.append(s.pop())
            s.push(token)
        elif token == ')':    # Right parenthesis
            while not s.is_empty() and s.top() != '(':
                postfix.append(s.pop())
            if not s.is_empty() and s.top() == '(':
                s.pop()  # Remove '('

    return ' '.join(postfix)  # Convert list to string

# Example usage
infix_expr = "3 + 4 * 2 / ( 1 - 5 )"
postfix_expr = infix_to_postfix(infix_expr)
print("Postfix expression:", postfix_expr)
