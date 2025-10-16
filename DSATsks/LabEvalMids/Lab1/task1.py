x = int(input("Enter the number: "))

for i in range(x):
    i+=1
    print(id(i))

    # print("*"*i)

for i in range(-x,0):
    i+=1
    print(id(i))
    # print("*"*(-i))