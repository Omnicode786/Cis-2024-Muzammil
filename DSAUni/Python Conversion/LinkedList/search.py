def search(self,val):
        a = self
        b = None
        
        if a.data == val:
            return True,a,b
        b = a.next
        while b is not None:
            
            if b.data == val:
                return True,a,b
            a = b
            b = b.next
        return False,a,b           
