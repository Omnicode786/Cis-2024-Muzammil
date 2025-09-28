// 3. Write a C program to compare two strings without using string library functions.


#include <stdio.h>

int main(){

    char string1[100],string2[100];

    printf("Enter 1st string: ");
    scanf("%s",string1);

    printf("Enter 2nd string: ");
    scanf("%s",string2);

int i = 0;
    while (string1[i] != '\0' && string2[i] != '\0')
{

if (string1[i] != string2[i]){
printf("The two strings are not equal\n");
return -1;
}
i++;
}
if (string1[i] != '\0' || string2[i] != '\0')
{
printf("The two strings are not equal\n");
return -1;
}



printf("The two strings are equal\n");

return 0;
}


