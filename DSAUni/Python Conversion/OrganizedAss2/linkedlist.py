# linklist.py

# Importing the functions from subdirectories
from Q0insert.insert import insert
from Q0insert.length import length
from Q1del.Q1del import del_x
from Q2count.Q2count import len_x
from Q3deltail.Q3taildel import del_tail
from Q4CombList.Q4CombList import combine
from Q6insAtail.Q6insattail import ins_tail
from Q7newHead.Q7newHead import newHead
from Q10BubbleSortOnList.Q10bubbleSortOnList import bubbleSort

# The main Linknode class
class Linknode:
    def __init__(self, data):
        self.data = data
        self.next = None


# Testing the Insert Functionality
print("Testing Insert Functionality:")
a = Linknode(5)
insert(a, 7)
insert(a, 9)
b = a
while b is not None:
    print(b.data, end=" ")
    b = b.next
print("\n")

# Testing the Length Functionality
print("Testing Length Functionality:")
print("Length of the list:", length(a))
print("\n")

# Testing the Delete Value Functionality
print("Testing Delete Value Functionality (Deleting 9):")
del_x(a, 9)
b = a
while b is not None:
    print(b.data, end=" ")
    b = b.next
print("\n")

# Testing the Count Occurrences of X Functionality
print("Testing Count Occurrences of X (Counting 7):")
print("Occurrences of 7:", len_x(a, 7))
print("\n")

# Testing the Delete Tail Functionality
print("Testing Delete Tail Functionality:")
del_tail(a)
b = a
while b is not None:
    print(b.data, end=" ")
    b = b.next
print("\n")

# Testing the Combine Lists Functionality
print("Testing Combine Lists Functionality:")
c = Linknode(10)
insert(c, 15)
combine(a, c)
b = a
while b is not None:
    print(b.data, end=" ")
    b = b.next
print("\n")

# Testing the Insert at Tail Functionality
print("Testing Insert at Tail Functionality:")
ins_tail(a, 20)
b = a
while b is not None:
    print(b.data, end=" ")
    b = b.next
print("\n")

# Testing the New Head Functionality
print("Testing New Head Functionality (Changing head to 7):")
newHead(a, 7)
b = a
while b is not None:
    print(b.data, end=" ")
    b = b.next
print("\n")

# Testing the Bubble Sort Functionality
print("Testing Bubble Sort Functionality:")
bubbleSort(a)
b = a
while b is not None:
    print(b.data, end=" ")
    b = b.next
print("\n")
