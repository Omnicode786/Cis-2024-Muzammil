#include <bits/stdc++.h>
using namespace std;

vector<int> bfsTraverse(int n, vector<int> adj[]) {
    vector<int> vis(n + 1, 0);  // allow 0..n inclusive
    vector<int> bfs;
    queue<int> q;

    vis[1] = 1;   // start BFS from node 0
    q.push(1);

    while (!q.empty()) {
        int node = q.front();
        q.pop();
        bfs.push_back(node);

        for (auto it : adj[node]) {
            if (!vis[it]) {
                vis[it] = 1;
                q.push(it);
            }
        }
    }

    return bfs;
}

int main() {
 vector<int> adj[] = {
        {},
        {2,6},      // 1
        {1,3,4},    // 2
        {2},        // 3
        {2,5},      // 4
        {4,8},      // 5
        {1,7,9},    // 6
        {6,8},      // 7
        {5,7},      // 8
        {6}         // 9
    };
    int n = 9;  // highest node index
    vector<int> order = bfsTraverse(n, adj);

    cout << "BFS Traversal: ";
    for (int v : order) cout << v << " ";
    cout << endl;

    return 0;
}

// runs on all degrees while q not empty  that while loop runs forr or all the neighbours

//  so q will Nrun n times then another while will addddd total degrees which is 2E

// so  the time complexity will be O(N) + O(2E)