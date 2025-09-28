// 2. Write a program in C to print a string in reverse using pointers.



#include <iostream>

int main(){

    char str[100];
    char *p = str;

    printf("Enter the string: ");
    scanf("%s", str);
    while (*p != '\0')
    {
        p++;
    }
    printf("the reverse string\n");
    while (p > str)
    {
        p--;
        printf("%c",*p);
    }
    
    



}