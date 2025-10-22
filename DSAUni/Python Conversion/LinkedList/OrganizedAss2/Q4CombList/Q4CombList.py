

# combine.py
def combine(a, list2):
    from linkedlist import Linknode
    while a.next is not None:
        a = a.next
    a.next = list2
# this is O(n)