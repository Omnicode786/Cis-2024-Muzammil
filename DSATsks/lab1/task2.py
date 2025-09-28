dic1 = {1:10,2:20}
dic2= {3:30,4:40}
dic3 = {5:50,6:60}

# remember key value pairings

dic4 = dic1 | dic2 | dic3
print(dic4)

#  or 

dic5 = {}
dic5.update(dic1)
dic5.update(dic2)
dic5.update(dic3)
print(dic5)