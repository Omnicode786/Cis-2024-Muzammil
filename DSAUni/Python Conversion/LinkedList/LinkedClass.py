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

