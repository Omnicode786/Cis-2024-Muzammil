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
int nodecount = 0;

void TraverseTreePreOrder(Tree *tree)
{
    if (tree == NULL)
        return;
    cout << tree->data << " ";
    nodecount++;
    TraverseTreePreOrder(tree->left);
    TraverseTreePreOrder(tree->right);
}
void InOrder(Tree *tree)
{
    if (tree == NULL)
        return;

    InOrder(tree->left);
    cout << tree->data << " ";
    InOrder(tree->right);
}

// post order
void PostOrder(Tree *tree)
{
    if (tree == NULL)
        return;

    PostOrder(tree->left);
    PostOrder(tree->right);
    cout << tree->data << " ";
}

// Level Order

void LevelOrder(Tree *tree)
{
    queue<Tree *> q;
    q.push(tree);
    q.push(NULL);
    while (q.size() > 0)
    {
        Tree *curr = q.front();
        q.pop();

        if (curr == NULL)
        {
            if (!q.empty())
            {
                cout << '\n';
                q.push(NULL);
                continue;
            }
            else
            {
                break;
            }
        }

        cout << curr->data << "  ";
        if (curr->left != NULL)
            q.push(curr->left);
        if (curr->right != NULL)
            q.push(curr->right);
    }
    cout << '\n';
}

int height(Tree *tree)
{
    if (tree == NULL)
        return 0;
    int left = height(tree->left);
    int right = height(tree->right);

    return max(right, left) + 1;
}

int count(Tree *tree)
{
    if (tree == NULL)
    {
        return 0;
    }
    int leftCount = count(tree->left);

    int rightCount = count(tree->right);

    return rightCount + leftCount + 1;
}


// sum of nodes
// TC O(n)  
int Sumation = 0;
int Sum(Tree* tree){
    if (tree == NULL) return 0;
    Sumation = Sumation + tree->data;
    Sum(tree->left);
    Sum(tree->right);

    return Sumation;

}


int main()
{
    Tree *tree1 = new Tree(6);
    cout << tree1->data << ' ';
    // because the tree variable is essentially a pointer
    vector<int> seq = {5, 3, 2, -1, -1, 4, -1, -1, 10, 22, 1, 3, -1, -1, 4, -1, -1, 9, -1, -1, 33, 2, -1, -1, -1};
    Tree *tree = BuiltTree(seq);

    // printing all left notes
    Tree *a = tree;

    cout << "PreOrder Traversal" << "\n";
    TraverseTreePreOrder(tree);

    cout << '\n'
         << '\n';
    cout << "InOrder Traversal" << "\n";

    InOrder(tree);
    cout << '\n'
         << '\n';
    cout << "PostOrder Traversal" << "\n";

    PostOrder(tree);
    cout << '\n'
         << '\n';

    cout << "Level ORder Traversal" << "\n";

    LevelOrder(tree);
    cout << '\n'
         << '\n';

    cout << nodecount;
    cout << '\n'
         << '\n';

    cout << height(tree);

    cout << '\n'
         << '\n';

    cout << count(tree);


    cout << '\n';
    cout <<Sum(tree);


}
