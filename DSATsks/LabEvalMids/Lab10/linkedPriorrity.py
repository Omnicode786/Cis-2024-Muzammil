

class Node:
    def __init__(self,data, priority):
         self.data = data
         self.priority = priority
         self.next = None
        

class LinkedPQ:
    def __init__(self):
          self.front = None
          self.rear = None
    
    def isEmpty(self):
     if self.front == None:
         return True
     return False
     
    def Enqueueu(self, data, priority):
        x = Node(data, priority)
        if self.front == None:
            self.front  = self.rear = x
            return
        
            
        if priority > self.priority:
            x.next = self.next
            self.front = x
            return
        current = self.front
        while current.next is not None and current.next.priority >= priority:
            current = current.next
        
        x.next = current.next
        current.next = x

    def Dequeue(self):
            if self.isEmpty():
                print("the queue is empty")
                return
            
            item = self.front.data
            self.front = self.front.next
            if self.front is None:
                self.rear = None
            return item