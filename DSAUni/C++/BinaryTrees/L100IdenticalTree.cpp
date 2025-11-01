#include <bits/stdc++.h>

using namespace std;

class Tree
{
public:
    int data;
    Tree *left;
    Tree *right;
    Tree(int value)
    {
        // making the root of the tree
        data = value;
        right = NULL;
        left = NULL;
    }
};

int idx = -1;
Tree *BuiltTree(vector<int> &sequence)
{
    idx++;
    if (sequence[idx] == -1)
        return NULL;

    Tree *root = new Tree(sequence[idx]);
    root->left = BuiltTree(sequence);
    root->right = BuiltTree(sequence);

    return root;
}



bool isSameTree(Tree* treeNo1, Tree* treeNo2){
    if (treeNo1 == NULL || treeNo2 == NULL)
{
    return treeNo1== treeNo2;
}

bool isLeftSame = isSameTree(treeNo1->left,treeNo2->left);
bool isRightSame = isSameTree(treeNo1->right, treeNo2->right);

return isLeftSame && isRightSame && treeNo1->data == treeNo2->data;



}

int main(){

    vector<int> treeSeq = {1,2,-1,-1,3,-1,-1};
    idx = -1;
    vector<int> treeSeq2 = {1,2,-1,-1,3,1,-1,-1,-1};
    Tree* p = BuiltTree(treeSeq);
    idx = -1;
    Tree* q = BuiltTree(treeSeq2);
cout<<"HELLO"<<p->data<<'\n';
cout<<"HELLO"<<q->data<<'\n';

bool truthyFalse = isSameTree(p,q);
cout<<truthyFalse;



}