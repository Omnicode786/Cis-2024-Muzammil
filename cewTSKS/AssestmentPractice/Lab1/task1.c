// Write a C program that accepts an employee's ID, total worked hours in a month and the amount
// received per hour. Print the ID and salary (with two decimal places) of the employee for a
// particular month.

#include <stdio.h>


int main(){

int id;
float Totalhours = 0;

float rate = 0;

printf("Enter your user id: ");
scanf("%d",&id);
printf("Enter the total hours worked: ");
scanf("%f",&Totalhours);
printf("Enter the pay rate: ");
scanf("%f",&rate);


float salary;
salary = Totalhours * rate;
printf("Your employee id is : %d\n", id);
printf("Your salary for this month is: %.2f\n", salary);
return 0;
}