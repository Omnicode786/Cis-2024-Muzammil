// how to store a graph

#include <iostream>

using namespace std;

int main(){
    int n, m;
    cout <<"Enter your no of nodes and edges: ";

    cin >> n >> m;
    int adj[n+1][n+1];

    for (int i = 0; i < m; i++)
    {
        int u, v;
        cout<<"Enter the edge connected: ";
        cin >> u >> v;
        adj[u][v] = 1;
        adj[v][u] = 1;

    }
    

}