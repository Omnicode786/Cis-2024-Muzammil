def DFS(vis,node,adj, n, res):
    vis[node] = 1
    res.append(node)
    
    for i in adj.get(node, []):

        if (not vis[i]):
            DFS(vis,i,adj,n,res)

    return res


def main():
    adj = {
        1: [2],
        2:[1,3],
        3: [2]
    }

    n = 9
    vis = [0] * (n+1)
    res = []
    res = DFS(vis,1,adj,n,res)
    print("DFS Traversal:", )
    print(res)
    # Time complexity explanation:
    # The queue pops exactly N times (one per node).
    # The inner loop processes all edges across the whole traversal → total 2E for undirected.
    # So total complexity = O(N + 2E) = O(N + E).

if __name__ == "__main__":
    main()