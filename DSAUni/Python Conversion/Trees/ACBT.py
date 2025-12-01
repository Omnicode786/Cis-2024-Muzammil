    def BreadthFirstTraversal(self):
        q = deque()
        q.append(self)

        result = []
        while q:
            node = q.popleft()
            if node is None:
                result.append(None)
                continue
            result.append(node.data)
            q.append(node.left)
            q.append(node.right)
        return result
    
    def isAlmostCompletemyver(self):
        if self.isPerfect(): return True
        bfs = self.BreadthFirstTraversal()
        print(bfs)
        gapFound = False

        for i in range(len(bfs)):
            if bfs[i] == None:
                if  gapFound == False:
                    gapFound = True
            else:
                if gapFound == True:
                    return False
            
        
        return True