#include <stdio.h>
// TASK1
int main() {
    int n, i, sum = 0;

    printf("Enter n: ");
    scanf("%d", &n);

    // --- Using for loop ---
    printf("\nUsing for loop:\n");
    sum = 0;
    for (i = 1; i <= 2*n; i += 2) {  // Sirf odd numbers print karne ke liye i+=2 % ka bhi use kr skte
        printf("%d ", i);
        sum += i;
    }
    printf("\nSum = %d\n", sum);

    // --- Using while loop ---
    printf("\nUsing while loop:\n");
    sum = 0;
    i = 1;
    int count = 0;
    while (count < n) {
        printf("%d ", i);
        sum += i;
        i += 2;
        count++;
    }
    printf("\nSum = %d\n", sum);

    // --- Using do-while loop can be done wit any other loop as well
    printf("\nUsing do-while loop:\n");
    sum = 0;
    i = 1;
    count = 0;
    do {
        printf("%d ", i);
        sum += i;
        i += 2;
        count++;
    } while (count < n);
    printf("\nSum = %d\n", sum);

    return 0;
}
