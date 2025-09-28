    #include <stdio.h>

    // Task4
    int main() {
        char str[200];
        int i = 0;

        printf("Enter a sentence: ");
        gets(str);

        while (str[i] != '\0') {
            if (str[i] >= 'a' && str[i] <= 'z') {
                str[i] = str[i] - 32; 
            } else if (str[i] >= 'A' && str[i] <= 'Z') {
                str[i] = str[i] + 32; // Uppercase ko lowercase
            }
            i++;
        }

        printf("Converted sentence: %s\n", str);

        return 0;
    }
