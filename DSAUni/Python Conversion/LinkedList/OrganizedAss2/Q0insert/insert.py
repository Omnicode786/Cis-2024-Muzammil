
# insert.py
def insert(a, data):
    from linkedlist import Linknode

    x = Linknode(data)  # Assuming Linknode is already defined in the main file
    x.next = a.next
    a.next = x

# this is O(1)