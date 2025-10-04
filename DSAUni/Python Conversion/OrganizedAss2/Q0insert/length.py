

# length.py
def length(a):
    from linkedlist import Linknode

    len = 1
    while a.next != None:
        len += 1
        a = a.next
    return len
