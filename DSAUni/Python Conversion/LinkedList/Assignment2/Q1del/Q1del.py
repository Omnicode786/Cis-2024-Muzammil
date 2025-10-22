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
    # def del_x(self,x):
    #     len = self.length()
    #     a = self
    #     b = a.next
    #     for i in range(len):
    #         if a.data == x and a == self:
    #             a.next = None
    #             a = a.next
    #             b = b.next
            
    #         elif b.data == x:
    #             a.next = b.next
    #             b = b.next
    #         if b.next != None:
    #             a.next = b
    #             b = b.next
    #         return a

    def del_x(self,x):
 
        while self.data == x:
            self.data = self.next.data
            self.next = self.next.next
        
        a = self
        while a is not None and a.next is not None:
            if a.next.data == x:
                a.next = a  .next.next
            else:
                a = a.next


a = Linknode(5)
a.insert(7)
a.insert(3)
a.insert(9)
a.insert(3)
a.insert(9)
a.insert(3)
b = a
while b is not None:
    print(b.data, end=" ")
    b = b.next
print("length")
print(a.length())

a.del_x(9)
b = a
while b is not None:
    print(b.data, end=" ")
    b = b.next
print("length")
print(a.length())