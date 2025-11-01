#include <iostream>
#include <bits/stdc++.h>
using namespace std;


class LinkedList{
    public:
    int data;
    LinkedList *next;

    LinkedList(int val){
        data = val;
        next = nullptr;
    }
    void insert(int data){
        LinkedList *x = new LinkedList(data);
        x->next = this->next;
        this->next = x;
    }

};

    LinkedList* ConvertArrToLL(vector<int> &nums){
            
        int size = nums.size();
        LinkedList* head = new LinkedList(nums[0]);
        LinkedList* mover = head;
        for(int i = 0; i < size; i++){
            


            }
    }