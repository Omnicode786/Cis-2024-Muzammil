class Linknode:
    def __init__(self, data):
        self.data = data
        self.next = None
    

    def insert(self, data):
        x = Linknode(data)
        x.next = self.next
        self.next = x
    

    def search(self, val):
        prev = None
        curr = self
        while curr is not None:
            if curr.data == val:
                return True, prev, curr
            prev = curr
            curr = curr.next
        return False, prev, curr
    

    def delete(self, prev):
        if prev is None:
            return self.next, self.data
        else:
            target = prev.next 
            if target is None:
                return self, None
            prev.next = target.next
            return self, target.data
    

    def deletebyVal(self, val):
        found, prev, _ = self.search(val)
        if found is False:
            return self, None
        return self.delete(prev)
    

    def circularize(self):
        a = self
        b = a 
        while b.next is not None:
            b = b.next
        b.next = a
        return self
    

    def linarize(self):
        a = self
        while a.next is not self:
            a = a.next
        a.next = None



a = Linknode(5)
a.insert(7)
a.insert(3)
a.insert(9)


b = a
while b is not None:
    print(b.data, end=" ")
    b = b.next


print("Searching value")
value = a.search(7)
print("hello")
if value[0] is True:
    print(value[1].data)
    print(value[2].data)


a, delete = a.deletebyVal(3)
a, delete = a.deletebyVal(5)
a, delete = a.deletebyVal(7)
a, delete = a.deletebyVal(88)
print("deleting the value: ", delete)


b = a
while b is not None:
    print(a.data)
    b = b.next


n = int(input("How many values you want to insert: "))
for i in range(n):
    inp = int(input())
    if a is None:   
        a = Linknode(inp)
    else:
        a.insert(inp)


b = a
while b is not None:
    print(b.data, end=" ")
    b = b.next


print("Circularizing")
b = a.circularize()
c = b  

first = True
while first or b != c:
    print(b.data, end=" ")
    b = b.next
    first = False

print(b.data)
