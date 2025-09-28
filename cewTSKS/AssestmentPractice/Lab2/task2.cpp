// Write a C program to make the following pattern as a pyramid with an asterisk.
//  *
//  * *
// * * *
// * * * *


#include <stdio.h>

int main(){
    int n = 5;

    for (int i = 0; i < n; i++)
    {
        for (int space = 0; space < n - i; space++)
        {
            printf(" ");
        }
        for (int j = 0; j <= i; j++)
        {
            printf("* ");
        }
        printf("\n");
        
    }
    


}