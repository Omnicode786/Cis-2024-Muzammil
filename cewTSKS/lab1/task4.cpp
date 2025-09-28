#include <stdio.h>

// dsa me kia wa he apne
void decToBinary(int n) {
    if (n > 1) {
        decToBinary(n / 2);  // Baar baar divide karke recursive call dsa me backtracking ki trah
    }
    printf("%d", n % 2);     // Remainder print karna (0 ya 1)
}

int main() {
    int num;
    printf("Enter a decimal number: ");
    scanf("%d", &num);

    printf("Binary: ");
    decToBinary(num);  // Function call
    printf("\n");

    return 0;
}
