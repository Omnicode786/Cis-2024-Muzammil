import Stack as st

# get yourself a post fix expression

tokens = "a+(a+b)/d"
stack = st.Stack(50)
display = st.Stack(50)
size = len(tokens)

def precedence(ch):
    if ch == '^':
        return 3
    elif ch == '/' or ch == '*':
        return 2
    elif ch == '+' or ch == '-':
        return 1
    else:
        return 0


for i in range(size):
    print(tokens[i],end=" ")
    print(stack.stk, end=" ")
    print(display.stk)
  
    Precedence = precedence(tokens[i])
    top = stack.topofstk
    StackPrecedence = precedence(top)
    if tokens[i] == '(':
            stack.push(tokens[i])
            # print(stack.stk)
    if Precedence > 0:
        
        if StackPrecedence < Precedence:
            stack.push(tokens[i])
            # print(stack.stk)

            print("hello")

        else:
            # print("hello")
        
            while StackPrecedence > Precedence:
                item = stack.pop()
                print("hello")
                display.push(item)
                StackPrecedence = precedence(stack.topofstk)
            stack.push(tokens[i])
    
    else:
        if tokens[i] == ')':
            # while stack.topofstk != '(':
                # item = stack.pop()
                pass
                # print("popping")
                # print(stack.stk)
                # if item != '(':
                #     display.push(item)
        if tokens[i] != '(' and tokens[i] != ')':
            display.push(tokens[i])

print("final")
print(display.stk)

print(display.topofstk)