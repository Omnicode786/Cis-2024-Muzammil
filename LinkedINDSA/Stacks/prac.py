

# list can aact as a stack

card_stack = []


card_stack.append("number 1")
card_stack.append("number 2")
card_stack.append("number 3")
card_stack.append("number 4")

# lifo principle will aplly 
top_card = card_stack.pop()
print(top_card)
# to peek at the top card we can use -ve indexing
print(card_stack[-1])

if not card_stack:
    print("CArd is empty")

else:
    print(len(card_stack))