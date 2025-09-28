// 5. Write a C program to add two matrices using pointers.

#include <stdio.h>

int main() {
    int a[10][10], b[10][10], sum[10][10];
    int *p1 = &a[0][0], *p2 = &b[0][0], *p3 = &sum[0][0];
    int r, c, i, j;

    printf("Enter number of rows and columns: ");
    scanf("%d %d", &r, &c);

    // Input first matrix
    printf("Enter elements of first matrix:\n");
    for (i = 0; i < r; i++) {
        for (j = 0; j < c; j++) {
            scanf("%d", (p1 + i * c + j));
        }
    }

    // Input second matrix
    printf("Enter elements of second matrix:\n");
    for (i = 0; i < r; i++) {
        for (j = 0; j < c; j++) {
            scanf("%d", (p2 + i * c + j));
        }
    }

    // Add using pointers
    for (i = 0; i < r; i++) {
        for (j = 0; j < c; j++) {
            *(p3 + i * c + j) = *(p1 + i * c + j) + *(p2 + i * c + j);
        }
    }

    // Print result
    printf("Sum of matrices:\n");
    for (i = 0; i < r; i++) {
        for (j = 0; j < c; j++) {
            printf("%d ", *(p3 + i * c + j));
        }
        printf("\n");
    }

    return 0;
}
