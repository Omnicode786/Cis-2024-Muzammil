#include <stdio.h>

int main() {
    int emp_id;             // Employee ki ID store karne ke liye variable
    float hours, rate, salary; 

    printf("Enter Employee ID: ");
    scanf("%d", &emp_id);  //take user id

    printf("Enter total worked hours in a month: ");
    scanf("%f", &hours);   

    printf("Enter amount received per hour: ");
    scanf("%f", &rate);    

    salary = hours * rate; // forumula for salary

    printf("Employee ID: %d\n", emp_id);
    printf("Salary: %.2f\n", salary);  // 2 decimal places tak show karna

    return 0;
}
