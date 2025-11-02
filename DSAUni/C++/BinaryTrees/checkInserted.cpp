#include <bits/stdc++.h>
using namespace std;


int searchInsert(vector<int>& nums, int target) {
        int index = 0;
        int size = nums.size();
        for (int i = 0; i < nums.size(); i++){
            if (target == nums[i]){
                return i;
            }
            if (target < nums[i]){
                index = i;
            }
            else if (target>nums[i]){
                index = i+1;
            }
        }

    return index;
    }


    int main(){

    }