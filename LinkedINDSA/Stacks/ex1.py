stack = []


chars = "in(struc)t(io)ns"

def valid(chars):
    for ch in chars:
        if ch == '{' or ch == '(' or ch == '[':
            stack.append(ch)
        elif ch == '}' or ch == ')' or ch == ']':
            if len(stack) <= 0:
                return False
            else:

                top = stack[-1]
                if top == '{' and ch == '}' or top == '(' and ch == ')' or top == '[' and ch == ']':
                    stack.pop()
                else:
                    return False


    return isempty(stack)


def isempty(stack):
    if len(stack) > 0:
        return False
    else:
        return True

print(valid(chars))