def DFS(vis,node,adj, n):

    vis[node] = 1
    for i in adj[node]:
        if (not vis[i]):
            DFS(vis,i,adj,n)


def numberofProvinces(adj, n):
    vis = [0] * (n+1)
    count = 0
    for i in range(n+1):
        if not vis[i]:
            count+=1
            DFS(vis, i, adj, n)


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


    province = numberofProvinces(adj,n)
    print("BFS Traversal:", *province)

    # Time complexity explanation:
    # The queue pops exactly N times (one per node).
    # The inner loop processes all edges across the whole traversal → total 2E for undirected.
    # So total complexity = O(N + 2E) = O(N + E).

if __name__ == "__main__":
    main()