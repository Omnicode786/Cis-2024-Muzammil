import sys
import os

# Add the parent directory to sys.path so Python can find Q0insert
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from Q0insert.insert import insert

def ins_tail(a, x):
    from linkedlist import Linknode
    while a.next is not None:
        a = a.next
    insert(a, x)  # Using the insert function to insert at the tail
