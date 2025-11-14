def DFS(vis,node,adj, n):
    vis[node] = 1
    
    for i in adj.get(node, []):

        if (not vis[i]):
            DFS(vis,i,adj,n)



def numberofProvinces(adj, n):
    vis = [0] * (n+1)
    count = 0
    for i in range(1,n+1):
        if not vis[i]:
            count+=1
            DFS(vis, i, adj, n)
    return count
def main():
    adj = {
        1: [2],
        2:[1,3],
        3: [2]
    }

    n = 3
    vis = [0] * (n+1)
    provinces = numberofProvinces(adj,n)
    # Time complexity explanation:
    # The queue pops exactly N times (one per node).
    # The inner loop processes all edges across the whole traversal → total 2E for undirected.
    # So total complexity = O(N + 2E) = O(N + E).

    print(provinces)
if __name__ == "__main__":
    main()