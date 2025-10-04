
# bubbleSort.py
def bubbleSort(a):
    from linkedlist import Linknode
    swap = False
    while a.next is not None:
        swap = False
        b = a.next
        while b is not None:
            if a.data > b.data:
                a.data, b.data = b.data, a.data
                swap = True
            b = b.next
        if not swap:
            return
        a = a.next
