// 1. Write a program in C to swap elements using call by reference.


#include <stdio.h>

void swap(int *a ,int *b){



int temp = *a;
*a = *b;
*b = temp;


}


int main(){

int a = 6, b =7;

printf("%d %d\n",a,b);
swap(&a,&b);
printf("%d %d",a,b);
 

}