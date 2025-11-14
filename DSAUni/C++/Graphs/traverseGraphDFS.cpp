#include <bits/stdc++.h>
using namespace std;

// Recursive DFS function
void dfs(int node, vector<int> &vis, vector<int> adj[], vector<int> &dfsRes) {
    vis[node] = 1;
    dfsRes.push_back(node);
    cout << node << " "; // for visual trace

    for (auto it : adj[node]) {
        if (!vis[it]) {
            dfs(it, vis, adj, dfsRes);
        }
    }
}

int main() {
    // adjacency list (1-indexed)
    vector<int> adj[] = {
        {},          // 0 unused
        {2,3},       // 1
        {5,6},     // 2
        {1,4,7},         // 3
        {3,8},       // 4
        {2},       // 5
        {2},     // 6
        {3,8},       // 7
        {4,7},       // 8
    };

    int n = 8; // number of nodes
    vector<int> vis(n + 1, 0);
    vector<int> dfsRes;

    cout << "DFS Traversal: ";
    dfs(1, vis, adj, dfsRes); // start from node 1
    cout << endl;

    // print from stored result vector
    cout << "DFS Order Stored: ";
    for (int node : dfsRes)
        cout << node << " ";
    cout << endl;

    return 0;
}
