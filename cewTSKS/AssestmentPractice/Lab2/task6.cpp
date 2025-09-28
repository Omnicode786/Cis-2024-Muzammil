// 6. Write a C program to add two distances in inch-feet system using structures.

#include <stdio.h>

struct Distance
{
    int feet;
    int inch;
};


int main(){
Distance d1,d2, TotalDistance;

printf("Enter the first distance feet: ");
scanf("%d",&d1.feet);

printf("Enter the first distance inch: ");
scanf("%d",&d1.inch);

printf("Enter the second distance feet: ");
scanf("%d",&d2.feet);

printf("Enter the second distance inch: ");
scanf("%d",&d2.inch);

TotalDistance.feet = d2.feet + d1.feet;
TotalDistance.inch = d2.inch + d1.inch;

if (TotalDistance.inch >= 12){
    TotalDistance.feet += TotalDistance.inch / 12;
    TotalDistance.inch = TotalDistance.inch % 12;
}

printf("The feet is %d, the inches are %d\n", TotalDistance.feet,TotalDistance.inch);



}