# CS-218 EXAM KIT: LECTURES 13–23
## Complete Study Guide with Mathematical Derivations

---

## TABLE OF CONTENTS

1. [LECTURE 13-14: Stacks and Expression Evaluation](#lecture-13-14-stacks-and-expression-evaluation)
2. [LECTURE 15-16: Quicksort Algorithm](#lecture-15-16-quicksort-algorithm)
3. [LECTURE 17: Recursion Fundamentals](#lecture-17-recursion-fundamentals)
4. [LECTURE 19-21: Binary Trees](#lecture-19-21-binary-trees)
5. [LECTURE 22-23: Heaps and Heapsort](#lecture-22-23-heaps-and-heapsort)
6. [LECTURE 23: Binary Search Trees (BST)](#lecture-23-binary-search-trees-bst)
7. [COMPREHENSIVE EXAM CHEAT SHEET](#comprehensive-exam-cheat-sheet)

---

---

# LECTURE 13-14: STACKS AND EXPRESSION EVALUATION

## 1.1 Understanding Stacks

### Definition

A **stack** is a linear data structure following the **LIFO (Last In, First Out)** principle:
- The last item added is the first item removed
- Real-world analogy: a stack of plates, stack of books, browser back button

### Core Operations

```python
# Stack operations with their complexities:

push(x):      # Add element x to the top
pop():        # Remove and return the top element
peek():       # Look at top element without removing
isEmpty():    # Check if stack is empty
size():       # Return number of elements
```

### Time Complexity Analysis

| Operation | Time | Space | Why |
|-----------|------|-------|-----|
| push | O(1) | O(1) | Array append: just add pointer |
| pop | O(1) | N/A | Array removal from end: O(1) |
| peek | O(1) | N/A | Access array index |
| isEmpty | O(1) | N/A | Compare size to 0 |

**Space Complexity of Stack:** O(n) where n = number of elements stored (can hold up to n items)

### Implementation Consideration

**Array-based stack:**
- Use index at end of array as top
- Push: append to array
- Pop: remove from end
- Both are O(1) amortized for Python lists

**Why amortized?**
Python lists allocate extra capacity. When capacity exceeded, array resizes (O(n)), but happens infrequently, averaging O(1) per operation.

---

## 1.2 Stack Applications: Expression Evaluation

### Postfix Expression Evaluation

**What is Postfix?**
- Operator comes AFTER operands
- Example: `3 4 +` means 3 + 4 = 7
- No parentheses needed
- Unambiguous precedence

**Algorithm (Postfix Evaluation):**

```
Input: tokens = [3, 4, +, 5, *]  // represents: (3+4)*5

Stack: []

Step 1: Read 3 → operand → push(3)
  Stack: [3]

Step 2: Read 4 → operand → push(4)
  Stack: [3, 4]

Step 3: Read + → operator
  pop() → 4 (right operand)
  pop() → 3 (left operand)
  result = 3 + 4 = 7
  push(7)
  Stack: [7]

Step 4: Read 5 → operand → push(5)
  Stack: [7, 5]

Step 5: Read * → operator
  pop() → 5 (right operand)
  pop() → 7 (left operand)
  result = 7 * 5 = 35
  push(35)
  Stack: [35]

Return: 35
```

### Time Complexity Derivation

**Operations performed:**
- Read each token: n tokens total
- Each token processed once
- For operand: push → O(1)
- For operator: pop, pop, calculate, push → O(1)
- Each operation per token: O(1)

**Total work:**
T(n) = Σ(i=1 to n) O(1) = n · O(1) = O(n)

**Space Complexity:**
- Stack holds operands temporarily
- Worst case: m operands queued before operators
- For valid expression with n total tokens: maximum n/2 operands on stack
- **SC = O(n)**

---

### Infix to Postfix Conversion

**What is Infix?**
- Operator in middle: `3 + 4`
- Uses parentheses and precedence rules
- Hard for computers, easy for humans

**Conversion Algorithm (Shunting Yard):**

```
Input: "3 + 4 * 5"  (precedence: * > + > -)

Token: 3 → operand → Output: [3]

Token: + → operator
  Stack empty → push(+)
  Stack: [+], Output: [3]

Token: 4 → operand → Output: [3, 4]

Token: * → operator
  Top of stack is + (precedence + = 1, * = 2)
  * has higher precedence, so DON'T pop +
  push(*)
  Stack: [+, *], Output: [3, 4]

Token: 5 → operand → Output: [3, 4, 5]

End of input:
  Pop all remaining operators: *, then +
  Output: [3, 4, 5, *, +]

Final postfix: 3 4 5 * +
```

**Precedence Rules:**
- Higher precedence = evaluated first
- `*` and `/` have precedence 2
- `+` and `-` have precedence 1
- `(` and `)` handle grouping

### Conversion Algorithm Complexity

**Token Processing:**
- Each token processed exactly once: n tokens
- For each token: O(1) work (push, compare precedence, pop)
- Worst case: all operators have same precedence → pop all at end

**Operations per token:**
- Operand: append to output → O(1)
- Operator: compare and conditionally pop → O(1) each pop
- Parenthesis: push or pop until match → O(1)

**Total:**
- Each operator pushed once and popped once: O(n)
- Each operand processed once: O(n)
- **Time Complexity: O(n)**

**Space Complexity:**
- Operator stack: max n/2 operators
- Output list: n tokens
- **Space Complexity: O(n)**

---

## 1.3 Stack Real-World Example: Balanced Parentheses

**Problem:** Check if parentheses are balanced in expression

**Algorithm:**
```
stack = []
for each character in string:
    if char is '(' or '[' or '{':
        push(char)
    elif char is ')' or ']' or '}':
        if stack is empty:
            return False  // unmatched closing
        top = pop()
        if (top == '(' and char == ')') or (balanced pairs):
            continue
        else:
            return False  // mismatched pairs

if stack is empty:
    return True  // all matched
else:
    return False  // unmatched opening
```

**Complexity:**
- **Time: O(n)** – process each character once
- **Space: O(n)** – stack can hold all opening brackets in worst case

---

---

# LECTURE 15-16: QUICKSORT ALGORITHM

## 2.1 Quicksort Overview

### Algorithm

Quicksort is a **divide-and-conquer** sorting algorithm:

```
function quicksort(array, low, high):
    if low < high:
        pivot_index = partition(array, low, high)
        quicksort(array, low, pivot_index - 1)   // Left part
        quicksort(array, pivot_index + 1, high)  // Right part

function partition(array, low, high):
    pivot = array[high]  // Choose last element as pivot
    i = low - 1
    for j = low to high - 1:
        if array[j] <= pivot:
            i = i + 1
            swap(array[i], array[j])
    swap(array[i + 1], array[high])
    return i + 1
```

### Partition Step Visualization

```
Array: [3, 7, 2, 5, 1, 6, 4]  (pivot = 4)

i = -1 (pointer to last processed ≤ pivot)

j = 0: array[0] = 3 ≤ 4 → i = 0, swap(arr[0], arr[0]) → [3, 7, 2, 5, 1, 6, 4]
j = 1: array[1] = 7 > 4 → skip
j = 2: array[2] = 2 ≤ 4 → i = 1, swap(arr[1], arr[2]) → [3, 2, 7, 5, 1, 6, 4]
j = 3: array[3] = 5 > 4 → skip
j = 4: array[4] = 1 ≤ 4 → i = 2, swap(arr[2], arr[4]) → [3, 2, 1, 5, 7, 6, 4]
j = 5: array[5] = 6 > 4 → skip

Final swap: swap(arr[i+1], arr[high]) = swap(arr[3], arr[6])
Result: [3, 2, 1, 4, 7, 6, 5]
                ↑
            pivot at index 3

Left partition (< 4): [3, 2, 1]
Right partition (> 4): [7, 6, 5]
```

### Partition Time Complexity

**Operations in partition:**
- Initialize i: O(1)
- Loop j from low to high-1: (high - low) iterations
- Each iteration: comparison + conditional swap → O(1)
- Final swap: O(1)

**Total for partition with n elements:**
T_partition(n) = Σ(i=1 to n) O(1) = O(n)

---

## 2.2 Quicksort Time Complexity Analysis

### Best Case: Balanced Pivot

**Scenario:** Pivot always splits array into equal halves

**Recurrence Relation:**
T(n) = 2 · T(n/2) + O(n)

where:
- 2 · T(n/2) = two recursive calls on halves
- O(n) = partition operation

**Derivation using recursion tree:**

```
Level 0:      [n]
              ├─ n operations (partition)

Level 1:    [n/2]  [n/2]
            ├─ n/2 ops  ├─ n/2 ops = n total

Level 2:  [n/4][n/4][n/4][n/4]
          ├─ n/4 + n/4 + n/4 + n/4 = n total

...

Level k: 2^k subproblems of size n/2^k
         Work at level k: 2^k × (n/2^k) = n
```

**Number of levels:** 2^k = n implies k = log₂ n

**Total work:**
T(n) = n + n + n + ... + n (log₂ n times)
T(n) = n log₂ n = O(n log n)

**Space Complexity:**
- Recursion depth = number of levels = log₂ n
- Each level adds one frame to call stack
- **SC = O(log n)**

---

### Average Case

**Scenario:** Randomly chosen pivots on average split reasonably well

**Analysis:** Similar to best case. Even if split isn't exactly 50-50, if split is within constant factors (e.g., 30-70 split):

T(n) = T(0.3n) + T(0.7n) + O(n)

**Solving this recurrence:**
The recursion tree still has O(log n) levels (slightly deeper, but same order). Each level processes n total work.

T(n) = O(n log n)

**Space Complexity:** O(log n) average

---

### Worst Case: Bad Pivot

**Scenario:** Pivot always partitions into sizes 1 and n-1

**Recurrence Relation:**
T(n) = T(n-1) + T(0) + O(n)
T(n) = T(n-1) + O(n)

**Derivation:**

```
Level 0: n operations (partition)
Level 1: n-1 operations (partition on n-1 elements)
Level 2: n-2 operations
...
Level n-1: 1 operation
```

**Total work:**
T(n) = n + (n-1) + (n-2) + ... + 1

Using arithmetic series formula:
Σ(i=1 to n) i = n(n+1)/2 = (n² + n)/2 = O(n²)

**Space Complexity:**
- Recursion depth = n (one per level)
- **SC = O(n)**

**When does worst case occur?**
- Sorted array with pivot always at end
- Reverse sorted array
- Array with all equal elements (some implementations)

---

## 2.3 Quicksort Optimizations

### 1. Random Pivot Selection

**Problem:** Sorted input triggers O(n²)

**Solution:** Choose pivot randomly
```python
import random
pivot_index = random.randint(low, high)
swap(array[pivot_index], array[high])
# Then proceed with partition
```

**Effect:** Randomness ensures worst case is unlikely. Probability of O(n²) becomes exponentially small.

**Expected complexity:** O(n log n) with high probability

---

### 2. Median-of-Three Pivot

**Problem:** First/last element might be bad in structured data

**Solution:** Use median of (first, middle, last)
```python
def median_of_three(array, low, high):
    mid = (low + high) // 2
    if array[low] > array[mid]:
        swap(low, mid)
    if array[mid] > array[high]:
        swap(mid, high)
    if array[low] > array[mid]:
        swap(low, mid)
    return mid  # median is now at mid
```

**Effect:** More likely to get balanced splits. Reduces O(n²) occurrence.

---

### 3. Tail Recursion Elimination

**Problem:** Deeper recursion uses more stack space

**Solution:** Recurse on smaller partition first
```python
def quicksort_optimized(array, low, high):
    while low < high:
        pivot_index = partition(array, low, high)
        
        # Recurse on smaller partition
        if (pivot_index - low) < (high - pivot_index):
            quicksort_optimized(array, low, pivot_index - 1)
            low = pivot_index + 1  # Tail recursion: convert to loop
        else:
            quicksort_optimized(array, pivot_index + 1, high)
            high = pivot_index - 1  # Tail recursion: convert to loop
```

**Effect:** Maximum recursion depth becomes O(log n) guaranteed (recurse on smaller half, iterate on larger).

**Space improvement:** O(n) worst case → O(log n) guaranteed

---

---

# LECTURE 17: RECURSION FUNDAMENTALS

## 3.1 What is Recursion?

### Definition

A function is **recursive** if it calls itself, directly or indirectly.

**Required components:**
1. **Base case:** When to stop recursing (must terminate)
2. **Recursive case:** Break problem into smaller version of itself

### Activation Records and Call Stack

When a function is called:
1. An **activation record** (stack frame) is created
2. It stores: local variables, parameters, return address, other bookkeeping
3. Pushed onto the **call stack**
4. When function returns, the frame is popped

**Call stack example for factorial(3):**

```
Call: factorial(3)
  ├─ Frame: n=3, return address
  │  Call: factorial(2)
  │    ├─ Frame: n=2, return address
  │    │  Call: factorial(1)
  │    │    ├─ Frame: n=1, return address
  │    │    │  Call: factorial(0)
  │    │    │    ├─ Frame: n=0, return address
  │    │    │    │  Base case! return 1
  │    │    │    └─ Pop frame
  │    │    │  return 0! = 1
  │    │    └─ Pop frame
  │    │  return 1 * 1 = 1
  │    └─ Pop frame
  │  return 2 * 1 = 2
  └─ Pop frame
  return 3 * 2 = 6
```

**Maximum stack depth:** n (one frame per recursive call)

---

## 3.2 Factorial: Simple Recursion

### Definition

n! = 
  1 if n = 0
  n × (n-1)! if n > 0

### Implementation

```python
def factorial(n):
    # Base case
    if n == 0:
        return 1
    # Recursive case
    else:
        return n * factorial(n - 1)
```

### Time Complexity Derivation

**Recurrence:**
T(n) = T(n-1) + O(1)

where O(1) is the multiplication and return.

**Expansion:**
```
T(n) = T(n-1) + 1
     = T(n-2) + 1 + 1
     = T(n-3) + 1 + 1 + 1
     = ...
     = T(0) + n
     = 1 + n
```

**Therefore:** T(n) = O(n)

### Space Complexity Derivation

**Recursion depth:**
- factorial(n) calls factorial(n-1) calls ... calls factorial(0)
- Maximum simultaneous frames on stack: n
- Each frame: O(1) memory
- **SC = O(n)**

---

## 3.3 Fibonacci: Naive vs Optimized

### Naive Fibonacci

**Definition:**
F(n) = 
  1 if n = 0
  1 if n = 1
  F(n-1) + F(n-2) if n > 1

**Implementation:**
```python
def fib_naive(n):
    if n == 0 or n == 1:
        return 1
    return fib_naive(n-1) + fib_naive(n-2)
```

### Time Complexity Analysis (Naive)

**Recurrence:**
T(n) = T(n-1) + T(n-2) + O(1)

**Recursion tree for fib(5):**

```
                    fib(5)
                   /      \
               fib(4)       fib(3)
              /      \      /      \
          fib(3)   fib(2) fib(2)  fib(1)
         /     \    /   \   /   \
    fib(2) fib(1) fib(1) fib(0) fib(1) fib(0)
   /   \
fib(1) fib(0)

Notice: fib(2) computed 3 times, fib(3) computed 2 times!
```

**Count of function calls:**

Let N(n) = number of calls to fib(n)

N(n) = N(n-1) + N(n-2) + 1

This is similar to Fibonacci itself! The solution is:
N(n) ≈ φ^n

where φ = (1 + √5)/2 ≈ 1.618 (golden ratio)

**Therefore:** T(n) = Θ(2ⁿ) (exponential!)

**Example magnitudes:**
- fib(10): ~177 calls
- fib(20): ~21,891 calls
- fib(30): ~2.7 million calls
- fib(40): ~331 million calls

### Space Complexity (Naive)

**Recursion depth:**
- Longest path: fib(n) → fib(n-1) → ... → fib(0)
- Depth: n
- **SC = O(n)**

---

### Optimized Fibonacci: "goodfib"

**Key idea:** Return a pair (F(n), F(n-1))

From this, you can compute the next pair:
(F(n+1), F(n)) = (F(n) + F(n-1), F(n))

**Implementation:**
```python
def goodfib(n):
    # Base case: return (F(1), F(0))
    if n == 1:
        return (1, 0)
    
    # Recursive case
    (fib_k, fib_k_minus_1) = goodfib(n - 1)
    
    # Compute F(n) = F(n-1) + F(n-2)
    fib_n = fib_k + fib_k_minus_1
    
    # Return new pair
    return (fib_n, fib_k)
```

### Time Complexity (goodfib)

**Recurrence:**
T(n) = T(n-1) + O(1)

Each call makes ONE recursive call (not two like naive).

**Derivation:**
```
T(n) = T(n-1) + 1
     = T(n-2) + 1 + 1
     = T(n-3) + 1 + 1 + 1
     = ...
     = T(1) + (n-1)
```

**Therefore:** T(n) = O(n)

### Space Complexity (goodfib)

**Recursion depth:**
- Each call makes one recursive call
- Maximum depth: n
- **SC = O(n)**

### Comparison Table

| Aspect | Naive | Optimized |
|--------|-------|-----------|
| Time | Θ(2ⁿ) | O(n) |
| Space | O(n) | O(n) |
| Calls for n=30 | 2.7M | 30 |
| Practical | Unusable | ✓ Practical |

---

---

# LECTURE 19-21: BINARY TREES

## 4.1 Tree Terminology and Concepts

### Key Definitions

| Term | Definition | Example |
|------|-----------|---------|
| **Root** | Top node with no parent | Node at level 0 |
| **Parent** | Node that has children | Node pointing down |
| **Child** | Node below a parent | Descendants of parent |
| **Siblings** | Nodes sharing same parent | Nodes at same level under same parent |
| **Leaf** | Node with no children | Terminal node |
| **Path** | Sequence of connected nodes | Root to any node |
| **Subtree** | Node + all descendants | Any node treated as root |
| **Height** | Longest path from node to leaf | Leaf has height 1 |
| **Depth** | Distance from root to node | Root has depth 0 |
| **Size** | Total number of nodes | n |
| **Width** | Max nodes on any level | Largest level |

### Height vs Depth

```
        A (root)
       / \
      B   C
     / \
    D   E

A: height = 2 (path to D or E), depth = 0
B: height = 1 (path to D or E), depth = 1
C: height = 1 (leaf is child), depth = 1
D: height = 1 (is leaf), depth = 2
E: height = 1 (is leaf), depth = 2
```

---

## 4.2 Binary Tree Properties

### Maximum Nodes at Each Level

In a binary tree (each node has at most 2 children):
- Level 0 (root): 1 node = 2⁰
- Level 1: up to 2 nodes = 2¹
- Level 2: up to 4 nodes = 2²
- Level k: up to 2^k nodes

**Total nodes in complete tree of height h:**
N = 1 + 2 + 4 + ... + 2^(h-1) = 2^h - 1

### Height Given N Nodes

**Perfect binary tree** (all levels full):
N = 2^h - 1
N + 1 = 2^h
log₂(N + 1) = h
h = ⌈log₂(N + 1)⌉

**General binary tree:**
- Minimum height: h_min = ⌈log₂(N + 1)⌉ (balanced)
- Maximum height: h_max = N (linear: like linked list)

**Example:**
- 7 nodes: minimum height = log₂(8) = 3, maximum height = 7
- 15 nodes: minimum height = log₂(16) = 4, maximum height = 15

---

## 4.3 Types of Binary Trees

### 1. Strictly Binary (Full Binary Tree)

**Definition:** Every internal (non-leaf) node has exactly 2 children.

```
        A          ✓ Full: A has 2, B has 2, C is leaf
       / \
      B   C
     / \
    D   E
```

vs

```
        A          ✗ Not Full: C has only 1 child
       / \
      B   C
     /     \
    D       E
```

**Properties:**
- If tree has L leaves, it has L-1 internal nodes
- Total nodes = L + (L-1) = 2L - 1 (always odd)

---

### 2. Perfect Binary Tree (PBT)

**Definition:** Strictly binary AND all leaves at same level.

```
        A             ✓ Perfect
       / \
      B   C
     / \ / \
    D E F G

Height = 3, Nodes = 2^3 - 1 = 7
```

**Characteristics:**
- All levels completely filled
- Nodes = 2^h - 1
- Leaves = 2^(h-1)

---

### 3. Almost Complete Binary Tree (ACBT)

**Definition:** All levels full except possibly the last, which is filled left-to-right with no gaps.

```
        A             ✓ Almost Complete
       / \
      B   C
     / \ / \
    D E F  G

         A             ✓ Almost Complete (last level partial, left-filled)
        / \
       B   C
      / \ /
     D E F

        A             ✗ NOT Almost Complete (gap in last level)
       / \
      B   C
     / \ / \
    D E   G  (F is missing, but G is there)
```

---

## 4.4 Tree Functions and Complexity

### height() Function

**Definition:** Returns longest path from node to its deepest leaf + 1.

**Algorithm:**
```python
def height(node):
    if node is None:
        return 0
    
    if node.left is None and node.right is None:
        return 1  # Leaf node
    
    left_height = height(node.left)
    right_height = height(node.right)
    
    return max(left_height, right_height) + 1
```

**Time Complexity Derivation:**

Let T(N) = time for tree with N nodes

T(N) = T(N_L) + T(N_R) + O(1)

Each node visited exactly once:
T(N) = Σ(nodes) O(1) = O(N)

**Space Complexity:**
- Recursion depth = tree height h
- SC = O(h)
- Balanced: O(log N)
- Skewed: O(N)

---

### nodecount() Function

**Algorithm:**
```python
def nodecount(node):
    if node is None:
        return 0
    return nodecount(node.left) + nodecount(node.right) + 1
```

**Complexity:**
- **Time: O(N)** (visit each node)
- **Space: O(h)** (recursion depth)

---

### leafcount() Function

**Algorithm:**
```python
def leafcount(node):
    if node is None:
        return 0
    
    if node.left is None and node.right is None:
        return 1  # This is a leaf
    
    return leafcount(node.left) + leafcount(node.right)
```

**Complexity:**
- **Time: O(N)** (visit each node to check)
- **Space: O(h)** (recursion depth)

---

### isStrictlyBinary() Function

**Algorithm:**
```python
def isStrictlyBinary(node):
    if node is None:
        return True  # Empty is vacuously true
    
    # Leaf node (0 children) is valid
    if node.left is None and node.right is None:
        return True
    
    # Internal node must have exactly 2 children
    if (node.left is None) or (node.right is None):
        return False  # Has only 1 child → invalid
    
    # Recursively check both subtrees
    return isStrictlyBinary(node.left) and isStrictlyBinary(node.right)
```

**Time Complexity Derivation:**

T(N) = T(N_L) + T(N_R) + O(1)

In worst case (valid strictly binary tree), visit all nodes:
T(N) = O(N)

**Space Complexity:**
- **SC = O(h)**

---

### isPerfect() Function

**Definition:** A tree is perfect if it has all levels filled and all leaves at same level.

**Key insight:** For height h, a perfect binary tree has exactly 2^h - 1 nodes.

**Algorithm:**
```python
def isPerfect(node):
    h = height(node)           # O(N)
    n = nodecount(node)        # O(N)
    expected = (2 ** h) - 1    # O(log h)
    return n == expected
```

**Time Complexity:**
- height(): O(N)
- nodecount(): O(N)
- Comparison: O(1)
- **Total: O(N)**

**Space Complexity:**
- **SC = O(h)**

---

### isAlmostComplete() Function

**Definition:** ACBT must satisfy:
1. If tree is perfect → return True
2. Left subtree is perfect, right is ACBT, both have same height
3. Right subtree is perfect, left is ACBT, left is 1 level taller
4. Specific height constraints

**Algorithm (Simplified):**
```python
def isAlmostComplete(node):
    if isPerfect(node):
        return True
    
    if node.left is None:
        return False
    
    h_left = height(node.left)
    
    if node.right is None:
        return h_left == 1  # Only left child, left is leaf
    
    h_right = height(node.right)
    
    # Case 1: same height, left perfect, right almost complete
    if h_left == h_right and isPerfect(node.left):
        return isAlmostComplete(node.right)
    
    # Case 2: left 1 higher, right perfect, left almost complete
    if h_left == h_right + 1 and isPerfect(node.right):
        return isAlmostComplete(node.left)
    
    return False
```

**Time Complexity Analysis:**

In worst case, makes calls to:
- isPerfect(): O(N)
- height(): O(N) per call, called multiple times
- isAlmostComplete() on subtrees: recursive

**Recurrence:**
T(N) = T(N_L) + T(N_R) + O(N)

**Upper bound:** In worst case, processes each level with O(N) work:
T(N) ≤ O(N) + O(N log N) = O(N log N)

More precisely, for ACBT (height h = O(log N)):
T(N) = O(N log N)

**Space Complexity:**
- Recursion depth: O(h) = O(log N) for ACBT

---

## 4.5 Tree Traversals

### Depth-First Traversals (DFS)

#### Inorder (LNR): Left - Node - Right

**Algorithm:**
```python
def inorder(node):
    if node is None:
        return
    inorder(node.left)      # Traverse left subtree
    process(node)           # Process current node
    inorder(node.right)     # Traverse right subtree
```

**Visualization:**
```
        B
       / \
      A   C

Inorder: A → B → C
```

**Property:** Inorder of BST gives sorted sequence

#### Preorder (NLR): Node - Left - Right

**Algorithm:**
```python
def preorder(node):
    if node is None:
        return
    process(node)           # Process current node
    preorder(node.left)     # Traverse left subtree
    preorder(node.right)    # Traverse right subtree
```

**Visualization:**
```
        B
       / \
      A   C

Preorder: B → A → C
```

#### Postorder (LRN): Left - Right - Node

**Algorithm:**
```python
def postorder(node):
    if node is None:
        return
    postorder(node.left)    # Traverse left subtree
    postorder(node.right)   # Traverse right subtree
    process(node)           # Process current node
```

**Visualization:**
```
        B
       / \
      A   C

Postorder: A → C → B
```

### DFS Complexity

**Time Complexity Derivation:**

Each node visited exactly once:
T(N) = Σ(nodes) O(1) = O(N)

**Space Complexity:**
- Recursion depth = tree height
- SC = O(h)
- Balanced: O(log N)
- Skewed: O(N)

---

### Breadth-First Traversal (BFS / Level Order)

**Algorithm (using queue):**
```python
def bfs(root):
    if root is None:
        return
    
    queue = [root]
    i = 0  # Index of node to process
    
    while i < len(queue):
        node = queue[i]
        process(node)
        
        if node.left is not None:
            queue.append(node.left)
        
        if node.right is not None:
            queue.append(node.right)
        
        i += 1
```

**Visualization:**
```
        B             Processing order: B → A → C → D → E → F
       / \
      A   C
     / \ / \
    D E F  G

Level 0: [B]
Level 1: [B, A, C]
Level 2: [B, A, C, D, E, F, G]
```

### BFS Complexity

**Time Complexity:**
- Each node enqueued once: O(N)
- Each node dequeued once: O(N)
- Each edge traversed once: O(N)
- **Total: O(N)**

**Space Complexity:**
- Queue must hold entire level
- Maximum level width = at most N/2 nodes
- **SC = O(N)**

---

---

# LECTURE 22-23: HEAPS AND HEAPSORT

## 5.1 Heap Structure and Properties

### What is a Max-Heap?

**Definition:**
1. **Shape property:** Almost Complete Binary Tree
2. **Heap property:** Parent ≥ all children

**Example:**
```
        50                ✓ Valid max-heap
       /  \
      30   20
     / \   /
    10 5  15
    
    - 50 ≥ 30, 20 ✓
    - 30 ≥ 10, 5 ✓
    - 20 ≥ 15 ✓
```

### Array Representation

Heaps are stored in arrays with index relationships:

```
Index:        0   1   2   3   4   5   6
Array:      [50, 30, 20, 10, 5, 15, 7]

Tree visualization:
            50(0)
           /     \
        30(1)    20(2)
        /  \      /
      10(3) 5(4) 15(5)  7(6)
```

**Index formulas:**
- Node at index i
- Left child: 2i + 1
- Right child: 2i + 2
- Parent: ⌊(i-1)/2⌋

**Verification:**
- Node 1 (value 30): left child = 2(1)+1 = 3 (value 10) ✓
- Node 3 (value 10): parent = ⌊(3-1)/2⌋ = 1 (value 30) ✓

---

## 5.2 Insert into Heap (Rise/Bubble-Up)

### Algorithm

```
Insert(5) into heap [50, 30, 20, 10]:
[50, 30, 20, 10, 5]  ← Add to end

Rise (bubble up):
5 at index 4
parent index = (4-1)/2 = 1 (value 30)
5 < 30 → stop

Result: [50, 30, 20, 10, 5]
```

**Another example - Insert(35):**

```
Start: [50, 30, 20, 10, 5]
After append: [50, 30, 20, 10, 5, 35]

Rise:
35 at index 5
parent index = (5-1)/2 = 2 (value 20)
35 > 20 → swap
[50, 30, 35, 10, 5, 20]

35 at index 2
parent index = (2-1)/2 = 0 (value 50)
35 < 50 → stop

Result: [50, 30, 35, 10, 5, 20]
```

### Time Complexity Derivation

**Path analysis:**

Start at leaf (worst case), bubble up to root.

**Maximum path length:**
- Heap is ACBT with N nodes
- Height: h = ⌈log₂(N+1)⌉
- Path from leaf to root: at most h edges = O(log N)

**Work per step:**
- Compare with parent: O(1)
- Swap: O(1)
- Update index: O(1)
- Total per step: O(1)

**Total work:**
T(N) = h · O(1) = log₂ N · O(1) = O(log N)

**Space Complexity:**
- Only use O(1) temporary variables
- **SC = O(1)**

---

## 5.3 Delete Max from Heap (Sink/Bubble-Down)

### Algorithm

```
Delete max (root) from [50, 30, 20, 10, 5, 15]:

Step 1: Move last element to root
[5, 30, 20, 10, 5, 15]  ← 5 replaces 50

Step 2: Remove last element
[5, 30, 20, 10, 5]  (removed index 5)

Step 3: Sink (bubble down)
5 at index 0
children: left = 1 (30), right = 2 (20)
max child = 30 at index 1
5 < 30 → swap
[30, 5, 20, 10, 5]

5 at index 1
children: left = 3 (10), right = 4 (5)
max child = 10 at index 3
5 < 10 → swap
[30, 10, 20, 5, 5]

10 at index 3
children: left = 7 (out of bounds)
no children → stop

Result: [30, 10, 20, 5, 5]
Returned: 50
```

### Time Complexity Derivation

**Path analysis (identical to rise):**

Maximum path from root to leaf: O(log N)

**Work per step:**
- Find larger child: O(1) (at most 2 children)
- Compare: O(1)
- Swap: O(1)
- Total per step: O(1)

**Total work:**
T(N) = O(log N)

**Space Complexity:**
- **SC = O(1)**

---

## 5.4 Building a Heap

### Method 1: Insert-Based Building (used in slides)

**Algorithm:**
```
Start with empty heap
for each element in array:
    insert(element)
```

**Complexity for n elements:**

Inserting i-th element into heap of size i-1:
- Insert operation: O(log i)

Total for n elements:
T(n) = Σ(i=1 to n) O(log i) = O(log 1 + log 2 + ... + log n)

= O(log(1 · 2 · 3 ··· n)) = O(log(n!))

Using Stirling: log(n!) = O(n log n)

**Therefore:** T(n) = O(n log n)

**Space Complexity:**
- Array to store n elements: O(n)

---

### Method 2: Floyd's Build Heap (Optimal)

**Algorithm (more efficient, but not always taught):**
```
Call sink() on each node, starting from last internal node
and going up to root.
```

**Complexity:** O(n) but requires different analysis

For this course, use **Method 1: O(n log n)**

---

## 5.5 Heapsort Algorithm

### Steps

```
Heapsort(array):
    Step 1: Build max-heap from array
            Build-Heap(array)            → O(n log n)
    
    Step 2: Extract elements in sorted order
            for i from n-1 down to 1:
                swap(array[0], array[i])  → O(1)
                heapsize -= 1
                sink(array, 0)            → O(log n)
```

### Visualization

```
Input: [3, 7, 2, 5, 1]

Step 1: Build max-heap
[7, 5, 2, 3, 1]

Step 2: Extract max (7)
swap(7, 1): [1, 5, 2, 3, 7]
Reduce heap size to 4: [1, 5, 2, 3]
Sink(0): [5, 3, 2, 1, 7]

Step 3: Extract max (5)
swap(5, 1): [1, 3, 2, 5, 7]
Reduce heap size to 3: [1, 3, 2]
Sink(0): [3, 1, 2, 5, 7]

...continue...

Final sorted array: [1, 2, 3, 5, 7]
```

### Time Complexity

**Build phase:** O(n log n)

**Extraction phase:**
- n-1 iterations
- Each iteration: swap O(1) + sink O(log n) = O(log n)
- Total: (n-1) · O(log n) = O(n log n)

**Total:** O(n log n) + O(n log n) = O(n log n)

### Space Complexity

**In-place:**
- No additional arrays (swap in same array)
- Temporary variables: O(1)
- **SC = O(1)**

---

---

# LECTURE 23: BINARY SEARCH TREES (BST)

## 6.1 BST Definition and Properties

### Definition

A **Binary Search Tree** is a binary tree where:
- **Left subtree property:** All values < parent's value
- **Right subtree property:** All values > parent's value
- Applied recursively to all subtrees

```
        50                ✓ Valid BST
       /  \
      30   70
     / \   / \
    20 40 60 80
    
    - Left of 50: 30, 20, 40 all < 50 ✓
    - Right of 50: 70, 60, 80 all > 50 ✓
    - Same holds for subtrees
```

### Inorder Traversal Property

**Theorem:** Inorder traversal of BST produces ascending sorted sequence.

**Proof:**
- Inorder: Left subtree → Node → Right subtree
- All in left subtree < Node < All in right subtree
- Result: ascending order

**Example:**
```
BST:        50
           /  \
          30   70
         / \   / \
        20 40 60 80

Inorder: 20 → 30 → 40 → 50 → 60 → 70 → 80  ✓ Sorted!
```

---

## 6.2 BST Operations

### Insert Operation

**Algorithm:**
```python
def insert(root, value):
    if root is None:
        return BSTNode(value)  # Create new node
    
    if value < root.value:
        root.left = insert(root.left, value)
    else:
        root.right = insert(root.right, value)
    
    return root
```

**Example:**
```
Insert values: 50, 30, 70, 20, 40

Insert 50: [50]

Insert 30: 30 < 50 → go left
           [50]
           /
          [30]

Insert 70: 70 > 50 → go right
                 [50]
                /    \
             [30]   [70]

Insert 20: 20 < 50 → left, 20 < 30 → left
                 [50]
                /    \
             [30]   [70]
             /
           [20]

Insert 40: 40 < 50 → left, 40 > 30 → right
                 [50]
                /    \
             [30]   [70]
             / \
           [20][40]
```

### Insert Complexity

**Path-based algorithm:**
- Start at root, descend tree until None found
- Maximum path length = tree height h

**Best case (balanced):**
- h = log₂ n implies T = O(log n)

**Worst case (skewed, sorted input):**
- h = n implies T = O(n)

**Average case (random input):**
- h ≈ log₂ n implies T = O(log n) expected

---

### Search Operation

**Algorithm:**
```python
def search(root, target):
    if root is None:
        return False  # Not found
    
    if target == root.value:
        return True   # Found
    
    if target < root.value:
        return search(root.left, target)
    else:
        return search(root.right, target)
```

**Complexity:** Same as insert: O(h)

---

### Delete Operation

**Three cases:**

#### Case 1: Leaf node (no children)

Simply remove:
```
Before:           After:
    50               50
   /  \             /
  30   70    →     30
 /
20

Delete 20:
Just remove pointer from 30
```

**Complexity:** O(1) after locating node

#### Case 2: One child

Replace with child:
```
Before:           After:
    50               50
   /  \             /  \
  30   70    →     40   70
    \
    40

Delete 30 (has only right child 40):
30's parent (50) now points to 40
```

**Complexity:** O(1) after locating node

#### Case 3: Two children

Use **in-order successor** strategy:
1. Find successor (smallest value in right subtree)
2. Copy successor's value to victim node
3. Delete successor node (guaranteed to have ≤ 1 child)

```
Before:
        50
       /  \
      30   70
     / \
    20 40
        \
        45

Delete 30 (has two children):
- Successor = min(right subtree) = 40
- Copy 40 to 30's position
- Delete the actual 40 node

After:
        50
       /  \
      40   70
     /  \
    20  45
```

**Complexity:**
- Find successor: O(h) (go right, then left as much as possible)
- Delete successor: O(h)
- **Total: O(h)**

---

## 6.3 BST Complexity Summary

| Operation | Best | Worst | Average |
|-----------|------|-------|---------|
| Insert | O(log n) | O(n) | O(log n) |
| Search | O(log n) | O(n) | O(log n) |
| Delete | O(log n) | O(n) | O(log n) |

**Best case:** Balanced tree, height = log n

**Worst case:** Skewed (linear) tree, height = n
- Example: inserting sorted data into BST

**Average case:** Random insertion order, height ≈ 1.4 log n

---

## 6.4 When BSTs Degrade

### Problem: Sorted Input

```
Insert in order: 1, 2, 3, 4, 5

Tree created:
1
 \
  2
   \
    3
     \
      4
       \
        5

Height = 5 = n
All operations become O(n)
```

### Solution: Self-Balancing Trees

To maintain O(log n) operations, use:
- **AVL Trees:** Rebalance after each insert/delete
- **Red-Black Trees:** Probabilistic balancing
- **B-Trees:** Multiple keys per node

*Not covered in this course*

---

---

# COMPREHENSIVE EXAM CHEAT SHEET

## Complexity Quick Reference

### Stack Operations
```
push(x)        → O(1) time, O(1) space (per element)
pop()          → O(1) time
peek()         → O(1) time
Stack (n items) → O(n) total space
```

### Expression Processing
```
Postfix evaluation    → O(n) time, O(n) space
Infix to postfix      → O(n) time, O(n) space
Balanced parentheses  → O(n) time, O(n) space
```

### Sorting
```
Quicksort:
  - Best/Average    → O(n log n) time, O(log n) space
  - Worst           → O(n²) time, O(n) space
Heapsort            → O(n log n) time, O(1) space (in-place)
```

### Recursion Examples
```
Factorial           → O(n) time, O(n) space
Print 1 to n        → O(n) time, O(n) space
Naive Fibonacci     → Θ(2ⁿ) time, O(n) space
Optimized Fibonacci → O(n) time, O(n) space
```

### Binary Trees
```
height()            → O(n) time, O(h) space
nodecount()         → O(n) time, O(h) space
leafcount()         → O(n) time, O(h) space
isPerfect()         → O(n) time, O(h) space
isStrictlyBinary()  → O(n) time, O(h) space
isAlmostComplete()  → O(n log n) time, O(log n) space

DFS traversals      → O(n) time, O(h) space
BFS traversal       → O(n) time, O(n) space

Where h = tree height:
  Balanced → h = O(log n)
  Skewed   → h = O(n)
```

### Heaps
```
Insert (rise)       → O(log n) time, O(1) space
Delete max (sink)   → O(log n) time, O(1) space
Build heap (insert-based) → O(n log n) time, O(n) space
Heapsort           → O(n log n) time, O(1) space (in-place)
```

### Binary Search Trees
```
Insert             → O(h) time, O(1) space (iterative)
Search             → O(h) time, O(1) space (iterative)
Delete             → O(h) time, O(1) space (iterative)

Where h = tree height:
  Balanced → O(log n)
  Skewed   → O(n)
```

---

## Key Formulas

### Tree Properties
```
Perfect binary tree with height h:
  Nodes = 2^h - 1
  Height = log₂(n + 1)

Almost complete tree with n nodes:
  Height = ⌈log₂(n + 1)⌉

Maximum nodes at level k:
  Nodes = 2^k
```

### Quicksort Recurrence
```
Best case: T(n) = 2T(n/2) + n = O(n log n)
Worst case: T(n) = T(n-1) + n = O(n²)
```

### Recursion Depth
```
Stack frame count = recursion depth
Space used = depth × frame_size
```

---

## Algorithm Selection Guide

### When to use Stack
- Expression evaluation
- Infix to postfix conversion
- Backtracking problems
- Browser history

### When to use Quicksort
- General-purpose sorting (fast average case)
- In-place requirement
- Avoid: worst-case sensitive applications

### When to use Heapsort
- Guaranteed O(n log n)
- In-place required
- Priority queue implementation needed

### When to use BST
- Maintain sorted data with insertions/deletions
- Range queries
- Successor/predecessor finding
- Use balanced variant for production

### When to use Heap
- Priority queue
- Heapsort
- Median finding
- K-smallest/largest problems

---

## Common Mistakes to Avoid

### Stacks
❌ Using deque operations (push_front, pop_front) - breaks LIFO
✅ Always use one end consistently

### Quicksort
❌ Using first element as pivot on sorted input - triggers O(n²)
✅ Use random pivot or median-of-three

### Recursion
❌ Not defining base case - infinite recursion
✅ Always have exit condition

### Trees
❌ Confusing height with depth
  Height = from node down to leaf
  Depth = from root down to node
✅ Define clearly before using

### BST
❌ Forgetting that unbalanced BST degrades to linked list
✅ Consider self-balancing for production code

---

## Exam Strategy

### For Time Complexity Questions

1. **Identify the main operation:** What are we doing?
   - Visiting all nodes? → O(n) likely
   - Following one path? → O(h) likely
   - Making multiple passes? → O(n log n) likely

2. **Count recursive levels:** How deep can recursion go?
   - Dividing by 2: O(log n) levels
   - Subtracting 1: O(n) levels

3. **Work per level:** How much work per recursion level?
   - Constant per node: total = (nodes) × (work/node)
   - Linear per level: total = (levels) × (work/level)

4. **Apply Master Theorem** (if recurrence is clear):
   - T(n) = aT(n/b) + f(n)
   - Compare f(n) to n^(log_b a)

### For Space Complexity Questions

1. **Recursion depth:** How deep is call stack?
2. **Auxiliary data structures:** Lists, queues, stacks?
3. **Input storage:** Do we store the input?

---

## Final Review Checklist

**Before exam, verify you can:**

- [ ] Trace through stack operations
- [ ] Convert infix to postfix manually
- [ ] Trace quicksort partitioning
- [ ] Calculate quicksort worst case for n = 2^k
- [ ] Draw recursion tree for small inputs
- [ ] Trace factorial and Fibonacci
- [ ] Calculate tree height from node count
- [ ] Verify if tree is perfect/strictly binary/ACBT
- [ ] Trace inorder/preorder/postorder traversals
- [ ] Trace BFS traversal
- [ ] Build max-heap by inserting elements
- [ ] Extract from heap and trace sinking
- [ ] Build BST from unsorted array
- [ ] Find inorder successor in BST
- [ ] Trace delete from BST (all three cases)

---

