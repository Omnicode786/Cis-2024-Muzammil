

class Linknode:
    def __init__(self,data):
        self.data = data
        self.next = None

    def insert(self,data):
        x = Linknode(data)
        x.next = self.next
        self.next = x
    def search(self,val):
        prev = None
        curr = self
        while curr is not None:
            if curr.data == val:
                return True,prev,curr
            prev = curr
            curr = curr.next
        return False,prev,curr

    def deletebyVal(self,val):
        item = None
        a = self
        found,prev,curr = a.search(val)
        if found is not True:
            return item,self
        if prev is None:
            item = curr.data
            return item, self.next
        item = curr.data
        prev.next = curr.next
        

        return item, self


a = Linknode(5)
a.insert(7)
a.insert(3)
a.insert(9)
b = a
while b is not None:
    
    print(b.data)
    b = b.next
print("Searching value")
value = a.search(7)
print("hello")
if value[0] is True:
    print(value[1].data)

    print(value[2].data)

delete, a = a.deletebyVal(3)
delete, a = a.deletebyVal(5)
delete, a = a.deletebyVal(7)

print("deleting value the value: ", delete)
while a is not None:
    
    print(a.data)
    a = a.next
