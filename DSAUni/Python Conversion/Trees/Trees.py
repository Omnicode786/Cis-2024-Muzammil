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
        if m == node:
            return True
        return False


    # to check if the tree is an acbt or not
    def isACBT(self):
        if self == None:
            return True
        if self.isPerfect():
            return True
        if self.left == None and self.right is not None:
            return False
        lh = self.left.height()
        if self.right == None:
            if lh == 1:
                return True
            else: return False
        rh = self.right.height()
        if rh == lh:
            return True
        if lh == rh+1:
            return True
        return False


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

seq = [5, 3, 2, -1, -1, 4, -1, -1, 10, 22, 1, 3, -1, -1, 4, -1, -1, 9, -1, -1, 33, 2, -1, -1, -1]
seq = [None if x == -1 else x for x in seq]
tree = build_tree(seq)

tree.LevelOrder()

print()
node = tree.search(33)
print(node.data)
print(node.left.data)

print(tree.height())
print(tree.nodeCount())

print(tree.edges())
print(tree.isPerfect())