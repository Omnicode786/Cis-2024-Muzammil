

# del_tail.py
def del_tail(a):
    from linkedlist import Linknode
    while a is not None:
        if a.next is not None and a.next.next is None:
            a.next = None
        a = a.next
