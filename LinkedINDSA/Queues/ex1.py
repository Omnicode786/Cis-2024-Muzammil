# Recursive function to generate a single binary number as an integer
def generateBinary(n):
    if n == 0:
        return 0
    return n % 2 + 10 * generateBinary(n // 2)
# Time Complexity:  O(log n)   → because each recursive call divides n by 2
# Space Complexity: O(log n)   → due to recursion stack depth


# Generate binary numbers from 1 to n using Python's built-in bin() function
def generate_binary(n):
    return [bin(i)[2:] for i in range(1, n + 1)]
# Time Complexity:  O(n log n) → each bin(i) takes O(log i) time, summed over all i
# Space Complexity: O(n log n) → storing n strings, each about log(n) characters long


# Generate binary numbers using recursion for each i
def generateNBinary(n):
    binary = []
    for i in range(n + 1):
        num = generateBinary(i)
        binary.append(num)
    return binary
# Time Complexity:  O(n log n) → calling generateBinary(i) for every i from 1..n
# Space Complexity: O(n)       → output list + small recursion stack (O(log n))


# Generate binary numbers using a queue (BFS-style generation)
from collections import deque

def generateusingQUEUE(n):
    queue = deque()
    queue.append(1)
    result = []
    for i in range(n):
        num = queue.popleft()       # O(1)
        result.append(num)
        queue.append(num * 10)      # O(1)
        queue.append(num * 10 + 1)  # O(1)
    return result
# Time Complexity:  O(n) → each loop iteration dequeues once and enqueues twice (constant-time ops)
# Space Complexity: O(n) → result list + queue holding at most ~2n elements


# Testing all versions
print(generate_binary(4))

nums = generateNBinary(6)
print(nums)

nums1 = generate_binary(10)
print(nums1)

print(generateusingQUEUE(20))  # BFS-style queue-based generation

# O(n) O(n) for both space and time in queue function
