
# del_x.py
def del_x(a, x):
    from linkedlist import Linknode

    while a.data == x:  # If the head node contains x
        a.data = a.next.data
        a.next = a.next.next
    
    while a is not None and a.next is not None:
        if a.next.data == x:
            a.next = a.next.next
        else:
            a = a.next
# this is O(n)