class DoublyList:
    def __init__(self, data):
        self.data = data
        self.left = None
        self.next = None
    def insert(self, data):
        x = DoublyList(data)
        x.next = self.next
        if self.next is not None:
            self.next.left = x
        self.next = x
        x.left = self



def addd11(L1,L2):
  if L1 is None:
    return L2
  if L2 is None:
    return L1
  
  a = L1
  b = L2
  
  while a.left is not None:
    a = a.left
  
  while b.left is not None:
    b = b.left
  
  while a is not None and b is not None:
    a.data = a.data + b.data
    c = a
    d = b
    a = a.next
    b = b.next
  
  if a is None and b is not None:
    c.next = b
    b.left = c
  
  if b is None and a is not None:
    d.next = a
    a.left = d
  
  return L1


a = DoublyList(7)
a.insert(7)
a.insert(9)
a.insert(4)
a.insert(54)

b = DoublyList(6)


b.insert(12)
b.insert(2)
b.insert(66)

b.insert(5)
b.insert(9)

d = a
while d.next is not None:
   print(d.data)
   d= d.next
print()
print()


d = b
while d.next is not None:
   print(d.data)
   d= d.next
print()
print()
print()

c = addd11(a,b)

d = c
while d.next is not None:
   print(d.data)
   d= d.next