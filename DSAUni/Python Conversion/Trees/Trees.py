from collections import deque

class Tree:
    def __init__(self, value):
        self.data = value
        self.left = None
        self.right = None


    def LevelOrder(self):
        q = deque()
        q.append(self)

        while q:
            node = q.popleft()
            print(node.data, end=" ")
            if node.left is not None:
                q.append(node.left)
            if node.right is not None:
                q.append(node.right)



    def search(self, target):
        node = self
        if node == None:
            return None
        if node.data == target:
            return node
        if node.left:
         found = node.left.search(target)
         if found:
             return found
        if node.right:
           found =   node.right.search(target)
           if found:
                return found

    def height(self):
        if self == None:
         return 0
        if self.right and self.left == None: return 1
        lh = 0
        rh = 0
        if self.left:
            lh = self.left.height()
        if self.right:
            rh = self.right.height()
        return 1 + max(lh, rh)
    
# no of nodes in the tree
    def nodeCount(self):
        if self == None:
            return
        rc = 0
        lc = 0
        if self.right:
            rc= self.right.nodeCount()
        if self.left:
            lc = self.left.nodeCount()

        return 1 + rc + lc


    # no of edges we know that thenumber of edges in a binary tree is simply node count  - 1

    def edges(self):
        nodes = self.nodeCount()
        return nodes - 1


    # is perfect
    def isPerfect(self):
        height = self.height()
        nodes = self.nodeCount()

        m = pow(2,height) - 1
        if m == nodes:
            return True
        return False


    # to check if the tree is an acbt or not
    def isACBT(self):
        if self.isPerfect():
            return True
        if self.left is None:
            return False
        hl = self.left.height()
        if self.right is None:
            if hl == 1:
                return True
            return False
        hr = self.right.height()
        if hl == hr and self.left.isPerfect():
            return self.right.isACBT()
        if hl == hr + 1 and self.right.isPerfect():
            return self.left.isACBT()
        return False



    def isStrictlyBinary(self):
        if self.left == None and self.right == None:
            return True
        if self.left == None or self.right == None:
            return False
        return self.right.isStrictlyBinary() and self.left.isStrictlyBinary()

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


idx = -1

def build_tree(sequence):
    global idx
    idx += 1

    if sequence[idx] == None:
        return None

    root = Tree(sequence[idx])
    root.left = build_tree(sequence)
    root.right = build_tree(sequence)

    return root


# Driver code

seq = [3,5,4,-1,-1,6,-1,-1,6,-1,-1,-1]
seq = [None if x == -1 else x for x in seq]
tree = build_tree(seq)

tree.LevelOrder()

print()
node = tree.search(33)
# print(node.data)
# print(node.left.data)

print(tree.height())
print(tree.nodeCount())

print("No of edges")
print(tree.edges())
print("Is PERFECT")
print(tree.isPerfect())
print("Is acbt")

print(tree.isACBT())
print("Is sbt")

print(tree.isStrictlyBinary())
print()
bfs = tree.BreadthFirstTraversal()
print()

print(tree.isAlmostCompletemyver())