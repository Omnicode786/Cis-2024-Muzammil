// Write a program in C to convert a decimal number to a binary number using functions.

#include <stdio.h>

int convertToBinary(int n){
    int  binary = 0;
    if (n == 0)
    {
        return binary;
    }
    int lastbit = n%2;
    binary += binary*10 + lastbit;
    convertToBinary(n/2);

 // my initial thought the problem was i am setting bianry to 0 so cannot happen i need to return somehting }

}
int dectoBin(int n){
    if (n== 0){
        return 0;
    }
    return (n%2) + 10*dectoBin(n/2);


}

int main(){

    printf("The binary number of 9 is: %d",dectoBin(9));



}