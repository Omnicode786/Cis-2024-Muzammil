// 4. Write a C program to search for an element in an array using pointers.
#include <stdio.h>
int main(){
    int arr[5] = {4,5,6,7,8};
    int *p = arr;
    int search = 5;
    for (int i = 0; i < 5; i++)
    {   
        if (*(p+i) == search){
            printf("The search was found at index %d",i);
            return i;
        }
    }
    return -1;
}