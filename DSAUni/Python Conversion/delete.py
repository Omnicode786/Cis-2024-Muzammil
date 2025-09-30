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