// how to store a graph

#include <iostream>
#include <vector>
using namespace std;

int main(){
    int n, m;
    cout <<"Enter your no of nodes and edges: ";

    cin >> n >> m;
    vector <int> adjList[n+1];

// bigO (E)
    for (int i = 0; i < m; i++)
    {
        int u, v;
        cout<<"Enter the edge connected: ";
        cin >> u >> v;
        adjList[u].push_back(v);
        adjList[v].push_back(u); // if a directed graph then we remove this line


        // on the U th index can you please store u cas its a neighbour and viceversa


    }
    return 0;

}