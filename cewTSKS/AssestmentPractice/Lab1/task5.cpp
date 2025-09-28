// Write a function to calculate the nth Fibonacci number and call it recursively to print the
// Fibonacci series. 

#include <stdio.h>
int fibonachi(int n){
    if (n == 0) return 0;
    if (n == 1) return 1;

    return fibonachi(n-1) + fibonachi(n-2);


}
int main(){

int n;
    printf("enter the number yoiu want fibonachi sequence of: ");
    scanf("%d", &n);
for (int i = 1; i < n; i++)
{
    printf("%d, ",fibonachi(i));
}


}