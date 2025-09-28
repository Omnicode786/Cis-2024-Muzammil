#include <stdio.h>
// rem struct node linked list
struct Distance {
    int feet;
    int inch;
};
int main() {
    struct Distance d1, d2, sum;
    printf("Enter 1st distance (feet inch): ");
    scanf("%d %d", &d1.feet, &d1.inch);
    printf("Enter 2nd distance (feet inch): ");
    scanf("%d %d", &d2.feet, &d2.inch);
    sum.feet = d1.feet + d2.feet;
    sum.inch = d1.inch + d2.inch;
// if >  12 inch make itr feet
    if (sum.inch >= 12) {
        sum.feet += sum.inch / 12;
        sum.inch = sum.inch % 12;
    }
    printf("Sum of distances = %d feet %d inch\n", sum.feet, sum.inch);
    return 0;}