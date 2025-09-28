// Write a C program that takes the height and width of a rectangle as an input from user and
// compute the perimeter and area of a rectangle.

#include <stdio.h>

int main(){


    float height, widht,area,perimeter;

    printf("Enter the height of the rectangle: ");
    scanf("%f",&height);

    printf("Enter the width of the rectangle: ");
    scanf("%f",&widht);

    area = height*widht;
    perimeter = 2*(height+widht);

    printf("The perimater of the rectangle is: %.2f\n",perimeter);
    printf("The area of the rectangle is: %.2f\n",area);
    

}