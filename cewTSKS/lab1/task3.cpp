#include <stdio.h>

// height ke hisab se bona chota khaba btatahe😭
int main() {
    int height;

    printf("Enter height of person in cm: ");
    scanf("%d", &height);

    if (height < 150) {
        printf("Person is Dwarf\n");   // Agar 150 se choti hai
    } else if (height == 150) {
        printf("Person is Average\n"); // Agar 150 ke barabar hai
    } else if (height >= 165) {
        printf("Person is Tall\n");    // Agar 165 ya usse zyada hai
    } else {
        printf("Person is between Average and Tall\n"); // Agar 151-164 ke darmiyan hai
    }

    return 0;
}
