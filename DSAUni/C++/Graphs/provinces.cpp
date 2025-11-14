#include <bits/stdc++.h>
using namespace std;

void dfs(int node, vector<int> &vis, vector<int> adj[]) {
    vis[node] = 1;
    cout << node << " "; // optional visual trace

    for (auto it : adj[node]) {
        if (!vis[it]) {
            dfs(it, vis, adj);
        }
    }
}

int numberofProvinces(vector<int> &vis, vector<int> adj[], int n) {
    int count = 0;
    for(int i = 1; i <= n; i++) {
        if (!vis[i]) {
            count++;
            dfs(i, vis, adj);
            cout << endl; // separate each province visually
        }
    }
    return count;
}

int main() {
    vector<int> adj[] = {
        {},          // 0 unused
        {2, 3},     // 1
        {5, 6},     // 2
        {1, 4, 7},  // 3
        {3, 8},     // 4
        {2},        // 5
        {2},        // 6
        {3, 8},     // 7
        {4, 7}      // 8
    };

    int n = 8;
    vector<int> vis(n+1, 0);

    cout << "\nDFS traversal by province:\n";
    int provinces = numberofProvinces(vis, adj, n);

    cout << "\nNumber of Provinces: " << provinces << endl;

    return 0;
}
