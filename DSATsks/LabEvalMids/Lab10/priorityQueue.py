class priorityQueue:
    def __init__(self):
        self.queue = []
    


    def enqueue(self,value,priority):
        self.queue.append([value,priority])
        # insert priority in c++ we use stl pq and it depends on the type of pq we are making
        # for example 
        #  priority_queue <int> pq;
        # now this int makes it behave so minimum value is removed first 
        # BUTTT
        # priority_queue<int, vector<int>, greater<int>> pqm;
        #  now maximum is on the top of the queue 

# //  this min pq is minimum heap


    def dequeue(self):

        if len(self.queue) <= 0:
            print("The queue is empty")
            return
        priortyIndex = 0

        for i in range(1, len(self.queue)):
            if self.queue[i][1] > self.queue[priortyIndex][1]:
                priortyIndex = i
        
        item = self.queue.pop(priortyIndex)
        return item

    def display(self):
        print("The queue is: ", self.queue)


pq = priorityQueue()

pq.enqueue("Clean dishes", 3)
pq.enqueue("Finish assignment", 1)
pq.enqueue("Watch TV", 4)
pq.enqueue("Reply to emails", 2)

pq.display()

pq.dequeue()
pq.dequeue()

pq.display()
