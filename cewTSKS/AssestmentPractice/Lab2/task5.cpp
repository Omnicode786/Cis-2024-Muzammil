// 5. Write a C program to print all unique elements in an array.

#include <stdio.h>

int main(){
    int n;
    printf("Enter the size of array: ");
    scanf("%d", &n);

    int arr[n];
    printf("Enter the numbers: ");
    for (int i = 0; i < n; i++)
    {
        scanf("%d", &arr[i]);
    }
        int unique = 0;

    for (int i = 0; i < n; i++)
    {
        int count = 0;
        for (int j = 0; j < n; j++)
        {
            if (arr[i] == arr[j] && i != j)
            {
                count++;
            }
          
            
        }
          if (!count){
                printf("%d ", arr[i]);
                unique++;
            }
        
    }
            printf("\n");

    printf("Unique elements: %d",unique);
    
}