class Linknode:
    def __init__(self, data):
        self.data = data
        self.next = None
    

    def insert(self, data):
        x = Linknode(data)
        x.next = self.next
        self.next = x
    
    def length(self):
        len = 1
        a = self
        while a.next != None:
            
            len +=1
            a = a.next


        return len
    def len_x(self,x):
        len = 0
        a = self
        while a is not None:
            if a.data == x:
                len += 1
            a = a.next
        return len
    
a = Linknode(5)
a.insert(7)
a.insert(3)
a.insert(9)
a.insert(7)
a.insert(7)
a.insert(7)
a.insert(7)


b = a
while b is not None:
    print(b.data, end=" ")
    b = b.next
print("length of x")
# print(a.length())
print(a.len_x(7))

