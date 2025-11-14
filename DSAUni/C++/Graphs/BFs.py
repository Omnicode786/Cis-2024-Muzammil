
from collections import deque
def bfsTravel(n, adj):
    vis = [0]*(n+1)
    bfs = []
    q = deque()

    vis[1] = 1
    q.append(1)

    while len(q) != 0:
        node = q[0]
        q.popleft()
        bfs.append(node)

        for i in adj[node]:
            if not vis[i]:
                vis[i] = 1
                q.append(i)
    return bfs

    

def main():
    adj = {
        1: [2, 3,6],
        2: [3,7],
        3: [6],
        4: [3],
        5: [3,4,8],
        6: [4],
        7: [3,5],
        8: [4,9],
        9: [5,7]
    }

    n = 9
    order = bfsTravel(n, adj)

    print("BFS Traversal:", *order)

    # Time complexity explanation:
    # The queue pops exactly N times (one per node).
    # The inner loop processes all edges across the whole traversal → total 2E for undirected.
    # So total complexity = O(N + 2E) = O(N + E).

if __name__ == "__main__":
    main()