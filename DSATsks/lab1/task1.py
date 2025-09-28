x = int(input("enter the number"))
for n in range(0, x):
    print(f"Value of n before +=1: {n}, and address is {id(n)}")
    n += 1
    print(f"Value of n before +=1: {n}, and address is {id(n)}")
    # print("*" * (n))
for n in range(-x, 0):
    print(f"Value of n before +=1: {n}, and address is {id(n)}")
    n += 1
    print(f"Value of n before +=1: {n}, and address is {id(n)}")
    # print("*" * ( - n + 1))

# my implementation but i think the above is better as there is no nested loop
n = int(input("Enter a number: "))

for i in range(0,n+1):
    for j in range(0,i):
        print("*",end='')
    print()

for i in range(0,n+1):
    for j in range(0,n-i):
        print("*",end='')
    print()
