#include<iostream>



using namespace std;

class Linknode{
public:
    int data;
    Linknode *next;
    
    Linknode(int val){
        data = val;
        next = nullptr;
    }

    void insert(int val){
        Linknode *x = new Linknode(val);
        x->next = this->next;
        this->next = x;
    }
    


};

int main(){

Linknode *x = new Linknode(5);
x->insert(8);
x->insert(22);
x->insert(43);
x->insert(99);
x->insert(44);
Linknode *y = x;
while (y->next != nullptr)
{
    cout << y->data <<" ";
    y = y->next; 
}




}