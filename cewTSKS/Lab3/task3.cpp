// 3. Write a C program to input and print array elements using pointers.
// // 

#include <stdio.h>


int main(){
int len = 0;
printf("Enter the length of the string: ");
scanf("%d", &len);

char arr[len + 1];

char *p = arr;

    printf("Enter the string: ");
getchar();
for (int i = 0; i < len; i++)
{
    scanf("%c",(p+i));

}
*(p+len) = '\0'; 

printf("The entered string was: ");
for (int i = 0; i < len; i++)
{
    printf("%c",*(p+i));
    
}
printf("\n");


}
