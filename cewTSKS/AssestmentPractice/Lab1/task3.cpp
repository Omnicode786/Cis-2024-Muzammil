// Write a C program to accept the height of a person in centimeters and categorize the person
// according to his height. (Height < 150cm – Dwarf, Height=150cm – Average, Height>=165cm –
// Tall).


#include <stdio.h>

int main(){

    float cm;
    printf("Enter the height in centimeters: ");
    scanf("%f",&cm);

    if (cm < 150)
    {
        printf("The person is a dwarf\n");
    }
    else if (cm >= 150 && cm < 165)
    {
        printf("The person is of average height\n");
        
    }
    else{
        printf("The person is tall\n");
    }
    
    


}