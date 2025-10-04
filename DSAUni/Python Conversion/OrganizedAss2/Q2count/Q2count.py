
# len_x.py
def len_x(a, x):
    from linkedlist import Linknode

    count = 0
    while a is not None:
        if a.data == x:
            count += 1
        a = a.next
    return count
