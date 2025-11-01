#include <bits/stdc++.h>

using namespace std;

class Tree{
    public:
        int data;
        Tree* left;
        Tree* right;
    Tree (int value){
// making the root of the tree
data = value;
right = NULL;
left = NULL;

    }

        


    


};

 
int idx = -1;
Tree* BuiltTree(vector<int>& sequence) {
    idx++;
    if (sequence[idx] == -1) return NULL;

    Tree *root = new Tree(sequence[idx]);
    root->left = BuiltTree(sequence);
    root->right = BuiltTree(sequence);

    return root;
}

int main() {
    Tree *tree1 = new Tree(6);
    cout << tree1->data<<'\n';
    // because the tree variable is essentially a pointer 
    vector <int> seq = {5,3,2,-1,-1,4,-1,-1,10,-1,-1};
    Tree *tree = BuiltTree(seq);

    // printing all left notes
    Tree* a = tree;
    while (a != NULL)
    {
        cout << a->data;
        a = a->right;
    }
    
}