#include <stdio.h>

int main() {
    float height, width, perimeter, area;

    printf("Enter height of rectangle: ");
    scanf("%f", &height);  

    printf("Enter width of rectangle: ");
    scanf("%f", &width);   

    perimeter = 2 * (height + width); // Formula: 2*(L+W)
    area = height * width;            // Formula: L*W

    printf("Perimeter of rectangle = %.2f\n", perimeter);
    printf("Area of rectangle = %.2f\n", area);

    return 0;
}
