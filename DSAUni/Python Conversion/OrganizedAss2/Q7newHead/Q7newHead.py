

# newHead.py
def newHead(a, x):
    from linkedlist import Linknode
    while a.next is not None:
        if a.data == x:
            a.data = a.next.data
            a.next = a.next.next
        a = a.next
