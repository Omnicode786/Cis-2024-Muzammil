# Linear Algebra Exam Revision README

Beginner-friendly, exam-focused notes for the exact topics listed.

> Main idea: Linear Algebra asks whether one thing can be made from other things, and how matrices transform points.

---

## Contents

1. [Linear Combination](#1-linear-combination)
2. [Consistency and Inconsistency of Systems](#2-consistency-and-inconsistency-of-systems)
3. [Linear Dependence and Linear Independence](#3-linear-dependence-and-linear-independence)
4. [Homogeneous and Non-Homogeneous Systems](#4-homogeneous-and-non-homogeneous-systems)
5. [Spanning](#5-spanning)
6. [Basis](#6-basis)
7. [Rank, Determinant, and Parameters](#7-rank-determinant-and-parameters)
8. [Polynomial Interpolation](#8-polynomial-interpolation)
9. [Polynomials as Linear Combinations](#9-polynomials-as-linear-combinations)
10. [Matrix Transformations](#10-matrix-transformations)
11. [Dilation / Scaling Transformations](#11-dilation--scaling-transformations)
12. [Composition of Transformations](#12-composition-of-transformations)

---

# 1. Linear Combination

## Meaning

A **linear combination** means multiplying given objects by constants and adding them.

For vectors:

```text
k1u + k2v + k3w = target vector
```

Analogy:

> Think of vectors like ingredients. A linear combination is a recipe. You take some amount of each ingredient and mix them to make the target.

If values of `k1, k2, k3` exist, the target is a linear combination of the given vectors.

---

## Example 1: Express a vector as a linear combination

Express:

```text
(-9, -7, -15)
```

as a linear combination of:

```text
u = (2, 1, 4)
v = (1, -1, 3)
w = (3, 2, 5)
```

We want:

```text
k1u + k2v + k3w = (-9, -7, -15)
```

So:

```text
k1(2, 1, 4) + k2(1, -1, 3) + k3(3, 2, 5) = (-9, -7, -15)
```

Compare components:

```text
2k1 + k2 + 3k3 = -9
k1 - k2 + 2k3 = -7
4k1 + 3k2 + 5k3 = -15
```

Augmented matrix:

```text
[ 2   1   3 | -9  ]
[ 1  -1   2 | -7  ]
[ 4   3   5 | -15 ]
```

Swap `R1` and `R2`:

```text
[ 1  -1   2 | -7  ]
[ 2   1   3 | -9  ]
[ 4   3   5 | -15 ]
```

Use:

```text
R2 -> R2 - 2R1
R3 -> R3 - 4R1
```

Result:

```text
[ 1  -1   2 | -7 ]
[ 0   3  -1 |  5 ]
[ 0   7  -3 | 13 ]
```

Make second pivot 1:

```text
R2 -> (1/3)R2
```

```text
[ 1  -1    2   | -7   ]
[ 0   1  -1/3 |  5/3 ]
[ 0   7   -3  |  13  ]
```

Clear column 2:

```text
R1 -> R1 + R2
R3 -> R3 - 7R2
```

```text
[ 1   0   5/3 | -16/3 ]
[ 0   1  -1/3 |  5/3  ]
[ 0   0  -2/3 |  4/3  ]
```

Make third pivot 1:

```text
R3 -> (-3/2)R3
```

```text
[ 1   0   5/3 | -16/3 ]
[ 0   1  -1/3 |  5/3  ]
[ 0   0    1  | -2    ]
```

Clear column 3:

```text
R1 -> R1 - (5/3)R3
R2 -> R2 + (1/3)R3
```

Final RREF:

```text
[ 1   0   0 | -2 ]
[ 0   1   0 |  1 ]
[ 0   0   1 | -2 ]
```

So:

```text
k1 = -2
k2 = 1
k3 = -2
```

Final answer:

```text
(-9, -7, -15) = -2u + v - 2w
```

---

## Example 2: Express a matrix as a linear combination

Express:

```text
C = [  2   5 ]
    [ -2   4 ]
```

as:

```text
C = k1A + k2B
```

where:

```text
A = [ 1   2 ]
    [ 0   1 ]

B = [  0   1 ]
    [ -2   2 ]
```

Write:

```text
k1A + k2B
```

```text
= k1[ 1   2 ] + k2[  0   1 ]
    [ 0   1 ]     [ -2   2 ]
```

Multiply:

```text
= [ k1   2k1 ] + [  0     k2  ]
  [  0    k1 ]   [ -2k2  2k2 ]
```

Add:

```text
= [ k1       2k1 + k2  ]
  [ -2k2     k1 + 2k2 ]
```

Set equal to `C`:

```text
[ k1       2k1 + k2  ] = [  2   5 ]
[ -2k2     k1 + 2k2 ]   [ -2   4 ]
```

Compare entries:

```text
k1 = 2
2k1 + k2 = 5
-2k2 = -2
k1 + 2k2 = 4
```

From:

```text
k1 = 2
```

and:

```text
-2k2 = -2
```

we get:

```text
k2 = 1
```

Check:

```text
2k1 + k2 = 2(2) + 1 = 5
k1 + 2k2 = 2 + 2(1) = 4
```

Both are correct.

Final answer:

```text
C = 2A + B
```

---

# 2. Consistency and Inconsistency of Systems

## Meaning

A system is **consistent** if it has at least one solution.

A system is **inconsistent** if it has no solution.

Analogy:

> A consistent system is like a story where all statements can be true together. An inconsistent system has a contradiction.

---

## Main row-reduction test

If row reduction gives:

```text
[ 0   0   0 | nonzero ]
```

then the system is inconsistent.

Example:

```text
[ 0   0   0 | 5 ]
```

means:

```text
0 = 5
```

Impossible.

---

## Case 1: No solution

Example:

```text
x + y = 2
2x + 2y = 5
```

Augmented matrix:

```text
[ 1   1 | 2 ]
[ 2   2 | 5 ]
```

Use:

```text
R2 -> R2 - 2R1
```

```text
[ 1   1 | 2 ]
[ 0   0 | 1 ]
```

Second row means:

```text
0 = 1
```

Impossible.

Final answer:

```text
No solution.
The system is inconsistent.
```

---

## Case 2: One unique solution

Example:

```text
x + y = 5
x - y = 1
```

Augmented matrix:

```text
[ 1   1 | 5 ]
[ 1  -1 | 1 ]
```

Use:

```text
R2 -> R2 - R1
```

```text
[ 1   1 | 5  ]
[ 0  -2 | -4 ]
```

Make pivot 1:

```text
R2 -> (-1/2)R2
```

```text
[ 1   1 | 5 ]
[ 0   1 | 2 ]
```

Clear above:

```text
R1 -> R1 - R2
```

```text
[ 1   0 | 3 ]
[ 0   1 | 2 ]
```

So:

```text
x = 3
y = 2
```

Final answer:

```text
One unique solution.
The system is consistent.
```

---

## Case 3: Infinitely many solutions

Example:

```text
x + y = 2
2x + 2y = 4
```

Augmented matrix:

```text
[ 1   1 | 2 ]
[ 2   2 | 4 ]
```

Use:

```text
R2 -> R2 - 2R1
```

```text
[ 1   1 | 2 ]
[ 0   0 | 0 ]
```

No contradiction.

From row 1:

```text
x + y = 2
```

Let:

```text
y = t
```

Then:

```text
x = 2 - t
```

Final answer:

```text
(x, y) = (2 - t, t)
```

So there are infinitely many solutions.

---

## Quick exam table

| Row-reduction result | Meaning |
|---|---|
| Row like `0 = nonzero` | No solution |
| Pivot in every variable column | One unique solution |
| Free variable and no contradiction | Infinitely many solutions |

---

# 3. Linear Dependence and Linear Independence

## Meaning

To check dependence or independence, solve:

```text
c1v1 + c2v2 + c3v3 = 0
```

This is a homogeneous system.

---

## Trivial solution

The **trivial solution** is:

```text
c1 = 0
c2 = 0
c3 = 0
```

This always works because:

```text
0v1 + 0v2 + 0v3 = 0
```

---

## Non-trivial solution

A **non-trivial solution** means at least one constant is not zero.

Example:

```text
c1 = 2, c2 = -1, c3 = 0
```

---

## Linear independence

Vectors are linearly independent if the only solution is the trivial solution.

Analogy:

> Independent vectors give genuinely new directions. No vector is a copy or mixture of the others.

---

## Linear dependence

Vectors are linearly dependent if there is a non-trivial solution.

Analogy:

> Dependent vectors repeat information. At least one vector can be made from the others.

---

## Example 1: Dependent vectors

Check:

```text
v1 = (1, 2)
v2 = (2, 4)
```

Set:

```text
c1(1, 2) + c2(2, 4) = (0, 0)
```

Compare components:

```text
c1 + 2c2 = 0
2c1 + 4c2 = 0
```

The second equation is just double the first.

From:

```text
c1 + 2c2 = 0
```

```text
c1 = -2c2
```

Let:

```text
c2 = 1
```

Then:

```text
c1 = -2
```

So:

```text
-2v1 + v2 = 0
```

This is a non-trivial solution.

Final answer:

```text
The vectors are linearly dependent.
```

---

## Example 2: Independent vectors

Check:

```text
v1 = (1, 0)
v2 = (0, 1)
```

Set:

```text
c1(1, 0) + c2(0, 1) = (0, 0)
```

This gives:

```text
(c1, c2) = (0, 0)
```

Only the trivial solution exists.

Final answer:

```text
The vectors are linearly independent.
```

---

# 4. Homogeneous and Non-Homogeneous Systems

## Homogeneous system

A homogeneous system has the form:

```text
Ax = 0
```

Example:

```text
x + 2y = 0
3x + 6y = 0
```

Important:

```text
A homogeneous system is always consistent.
```

Why?

Because the trivial solution always exists:

```text
x = 0, y = 0
```

---

## Non-homogeneous system

A non-homogeneous system has the form:

```text
Ax = b
```

where `b` is not the zero vector.

Example:

```text
x + 2y = 5
3x + 6y = 7
```

It may have:

- no solution
- one unique solution
- infinitely many solutions

---

## When does a homogeneous system have only the trivial solution?

For a square matrix:

```text
Ax = 0
```

only has the trivial solution if:

```text
det(A) != 0
```

Also:

```text
rank(A) = number of variables
```

and:

```text
no free variables
```

---

## When does a homogeneous system have non-trivial solutions?

It has non-trivial solutions if:

```text
det(A) = 0
```

for a square matrix.

Also:

```text
rank(A) < number of variables
```

and:

```text
there is at least one free variable
```

---

## Example 1: Only trivial solution

```text
x + 2y = 0
3x + 4y = 0
```

Coefficient matrix:

```text
A = [ 1   2 ]
    [ 3   4 ]
```

Determinant:

```text
det(A) = (1)(4) - (2)(3)
det(A) = 4 - 6
det(A) = -2
```

Since:

```text
det(A) != 0
```

Final answer:

```text
Only the trivial solution exists.
x = 0, y = 0
```

---

## Example 2: Non-trivial solutions

```text
x + 2y = 0
3x + 6y = 0
```

Coefficient matrix:

```text
A = [ 1   2 ]
    [ 3   6 ]
```

Determinant:

```text
det(A) = (1)(6) - (2)(3)
det(A) = 6 - 6
det(A) = 0
```

So non-trivial solutions exist.

Solve:

```text
x + 2y = 0
```

Let:

```text
y = t
```

Then:

```text
x = -2t
```

Final answer:

```text
(x, y) = (-2t, t)
```

If `t` is not zero, this is a non-trivial solution.

---

# 5. Spanning

## Meaning

A set of vectors spans a space if their linear combinations can make every vector in that space.

Analogy:

> Spanning means you have enough building blocks to build the whole space.

For `R²`, you must be able to make every point `(x, y)`.

For `R³`, you must be able to make every point `(x, y, z)`.

---

## How to check spanning

1. Put vectors as columns of a matrix.
2. Row reduce.
3. Count pivots.

For `R²`:

```text
Need 2 pivots.
```

For `R³`:

```text
Need 3 pivots.
```

For `R^n`:

```text
Need n pivots.
```

---

## Example 1: Do these vectors span R²?

```text
v1 = (1, 2)
v2 = (3, 4)
```

Put them as columns:

```text
A = [ 1   3 ]
    [ 2   4 ]
```

Determinant:

```text
det(A) = (1)(4) - (3)(2)
det(A) = 4 - 6
det(A) = -2
```

Since:

```text
det(A) != 0
```

Final answer:

```text
Yes, they span R².
```

---

## Example 2: Do these vectors span R³?

```text
v1 = (1, 0, 0)
v2 = (0, 1, 0)
v3 = (1, 1, 0)
```

Put as columns:

```text
A = [ 1   0   1 ]
    [ 0   1   1 ]
    [ 0   0   0 ]
```

There is no pivot in the third row.

So:

```text
rank(A) = 2
```

But to span `R³`, we need:

```text
rank(A) = 3
```

Final answer:

```text
No, they do not span R³.
```

Reason:

```text
All vectors have z = 0.
```

So they can only make vectors in the xy-plane, not all of `R³`.

---

# 6. Basis

## Meaning

A basis is a set of vectors with two properties:

1. The set spans the vector space.
2. The set is linearly independent.

Analogy:

> A basis is the perfect set of building blocks: enough to build everything, but no extra useless block.

---

## Exam rule

For `R²`:

```text
A basis needs exactly 2 independent vectors.
```

For `R³`:

```text
A basis needs exactly 3 independent vectors.
```

For `R^n`:

```text
A basis needs exactly n independent vectors.
```

---

## How to check basis

If you are given `n` vectors in `R^n`:

1. Put the vectors as columns of a matrix.
2. Find determinant.
3. If determinant is not zero, they form a basis.
4. If determinant is zero, they do not form a basis.

---

## Example 1: Check whether vectors form a basis of R³

Given:

```text
v1 = (1, 1, 0)
v2 = (0, 1, 1)
v3 = (1, 0, 1)
```

Put them as columns:

```text
A = [ 1   0   1 ]
    [ 1   1   0 ]
    [ 0   1   1 ]
```

Find determinant:

```text
det(A) = 1[(1)(1) - (0)(1)] - 0 + 1[(1)(1) - (1)(0)]
```

```text
det(A) = 1 + 1
det(A) = 2
```

Since:

```text
det(A) != 0
```

Final answer:

```text
The vectors form a basis of R³.
```

---

## Example 2: Not a basis

Given:

```text
v1 = (1, 2, 3)
v2 = (2, 4, 6)
v3 = (1, 0, 1)
```

Notice:

```text
v2 = 2v1
```

So the vectors are dependent.

Final answer:

```text
They do not form a basis.
```

Reason:

```text
A basis must be linearly independent.
```

---

# 7. Rank, Determinant, and Parameters

## Rank

Rank is the number of pivots after row reduction.

Analogy:

> Rank tells how many useful independent directions the matrix has.

Example:

```text
[ 1   2   3 ]
[ 0   1   4 ]
[ 0   0   0 ]
```

This matrix has 2 pivots.

So:

```text
rank = 2
```

---

## Determinant

For:

```text
A = [ a   b ]
    [ c   d ]
```

```text
det(A) = ad - bc
```

---

## If det(A) != 0

For a square matrix:

```text
det(A) != 0
```

means:

- unique solution for `Ax = b`
- columns are independent
- columns span the full space
- full rank
- no free variables

---

## If det(A) = 0

For a square matrix:

```text
det(A) = 0
```

means:

- columns are dependent
- no unique solution
- matrix does not have full rank
- free variables may appear
- `Ax = b` may have no solution or infinitely many solutions

---

## Example 1: Parameter for unique solution

For what values of `k` does the system with this coefficient matrix have a unique solution?

```text
A = [ 1   2 ]
    [ 2   k ]
```

Find determinant:

```text
det(A) = (1)(k) - (2)(2)
det(A) = k - 4
```

For a unique solution:

```text
det(A) != 0
```

So:

```text
k - 4 != 0
```

```text
k != 4
```

Final answer:

```text
Unique solution when k != 4.
No unique solution when k = 4.
```

---

## Example 2: Parameter for consistency

Find values of `h` for which the system is consistent:

```text
x + y = 2
2x + 2y = h
```

Augmented matrix:

```text
[ 1   1 | 2 ]
[ 2   2 | h ]
```

Use:

```text
R2 -> R2 - 2R1
```

```text
[ 1   1 | 2     ]
[ 0   0 | h - 4 ]
```

If:

```text
h - 4 = 0
```

then:

```text
h = 4
```

The second row becomes:

```text
0 = 0
```

So the system is consistent and has infinitely many solutions.

If:

```text
h != 4
```

then:

```text
0 = nonzero
```

So the system is inconsistent.

Final answer:

```text
Consistent when h = 4.
Inconsistent when h != 4.
```

---

## Example 3: Parameter for independence

Check when these vectors are linearly independent:

```text
v1 = (1, 2)
v2 = (3, h)
```

Put as columns:

```text
A = [ 1   3 ]
    [ 2   h ]
```

Find determinant:

```text
det(A) = (1)(h) - (3)(2)
det(A) = h - 6
```

For independence:

```text
det(A) != 0
```

So:

```text
h != 6
```

Final answer:

```text
Independent when h != 6.
Dependent when h = 6.
```

---

# 8. Polynomial Interpolation

## Meaning

Polynomial interpolation means finding a polynomial that passes through given points.

For a cubic polynomial:

```text
p(x) = ax^3 + bx^2 + cx + d
```

There are 4 unknowns:

```text
a, b, c, d
```

So we need 4 points.

---

## Example: Cubic polynomial through four points

Find a cubic polynomial passing through:

```text
(1, 3), (2, -2), (3, -5), (4, 0)
```

Let:

```text
p(x) = ax^3 + bx^2 + cx + d
```

Use each point.

For `(1, 3)`:

```text
a + b + c + d = 3
```

For `(2, -2)`:

```text
8a + 4b + 2c + d = -2
```

For `(3, -5)`:

```text
27a + 9b + 3c + d = -5
```

For `(4, 0)`:

```text
64a + 16b + 4c + d = 0
```

So the system is:

```text
a + b + c + d = 3
8a + 4b + 2c + d = -2
27a + 9b + 3c + d = -5
64a + 16b + 4c + d = 0
```

Row reducing gives:

```text
[ 1   0   0   0 |  1 ]
[ 0   1   0   0 | -5 ]
[ 0   0   1   0 |  3 ]
[ 0   0   0   1 |  4 ]
```

So:

```text
a = 1
b = -5
c = 3
d = 4
```

Final polynomial:

```text
p(x) = x^3 - 5x^2 + 3x + 4
```

Check quickly:

```text
p(1) = 1 - 5 + 3 + 4 = 3
p(2) = 8 - 20 + 6 + 4 = -2
p(3) = 27 - 45 + 9 + 4 = -5
p(4) = 64 - 80 + 12 + 4 = 0
```

All points work.

---

# 9. Polynomials as Linear Combinations

## Meaning

Polynomials can be treated like vectors by comparing coefficients.

Example:

```text
6 + Hx + 6x²
```

has coefficients:

```text
constant = 6
x coefficient = H
x² coefficient = 6
```

---

## Example

Express:

```text
6 + Hx + 6x²
```

as a linear combination of:

```text
p1(x) = 2 + x + 4x²
p2(x) = 1 - x + 3x²
p3(x) = 3 + 2x + 5x²
```

We want:

```text
k1p1(x) + k2p2(x) + k3p3(x) = 6 + Hx + 6x²
```

Substitute:

```text
k1(2 + x + 4x²) + k2(1 - x + 3x²) + k3(3 + 2x + 5x²)
= 6 + Hx + 6x²
```

Compare coefficients.

Constant terms:

```text
2k1 + k2 + 3k3 = 6
```

x terms:

```text
k1 - k2 + 2k3 = H
```

x² terms:

```text
4k1 + 3k2 + 5k3 = 6
```

So:

```text
2k1 + k2 + 3k3 = 6
k1 - k2 + 2k3 = H
4k1 + 3k2 + 5k3 = 6
```

Solving gives:

```text
k1 = 2H - 18
k2 = 6 - H
k3 = 12 - H
```

Final answer:

```text
6 + Hx + 6x² =
(2H - 18)p1(x) + (6 - H)p2(x) + (12 - H)p3(x)
```

---

## Check with H = 10

If:

```text
H = 10
```

then:

```text
k1 = 2(10) - 18 = 2
k2 = 6 - 10 = -4
k3 = 12 - 10 = 2
```

So:

```text
6 + 10x + 6x² = 2p1(x) - 4p2(x) + 2p3(x)
```

---

# 10. Matrix Transformations

## Meaning

A matrix transformation is a function that moves points or vectors.

Analogy:

> A matrix is like a machine. You put a point inside, and it gives a transformed point outside.

---

# Reflection Operators

## Reflection about the x-axis

Formula:

```text
T(x, y) = (x, -y)
```

Matrix:

```text
[ 1   0  ]
[ 0  -1  ]
```

Example:

```text
(3, 4) -> (3, -4)
```

---

## Reflection about the y-axis

Formula:

```text
T(x, y) = (-x, y)
```

Matrix:

```text
[ -1   0 ]
[  0   1 ]
```

Example:

```text
(3, 4) -> (-3, 4)
```

---

## Reflection in 3D about the xy-plane

The xy-plane has `z = 0`.

Formula:

```text
T(x, y, z) = (x, y, -z)
```

Matrix:

```text
[ 1   0   0  ]
[ 0   1   0  ]
[ 0   0  -1  ]
```

Example:

```text
(2, 3, 5) -> (2, 3, -5)
```

---

## Reflection in 3D about the xz-plane

The xz-plane has `y = 0`.

Formula:

```text
T(x, y, z) = (x, -y, z)
```

Matrix:

```text
[ 1   0   0 ]
[ 0  -1   0 ]
[ 0   0   1 ]
```

Example:

```text
(2, 3, 5) -> (2, -3, 5)
```

---

## Reflection in 3D about the yz-plane

The yz-plane has `x = 0`.

Formula:

```text
T(x, y, z) = (-x, y, z)
```

Matrix:

```text
[ -1   0   0 ]
[  0   1   0 ]
[  0   0   1 ]
```

Example:

```text
(2, 3, 5) -> (-2, 3, 5)
```

---

# Projection Operators

## Orthogonal projection onto the x-axis

Formula:

```text
T(x, y) = (x, 0)
```

Matrix:

```text
[ 1   0 ]
[ 0   0 ]
```

Example:

```text
(5, 7) -> (5, 0)
```

Analogy:

> Projection is like dropping a shadow onto an axis or plane.

---

## Projection onto the xy-plane

Formula:

```text
T(x, y, z) = (x, y, 0)
```

Matrix:

```text
[ 1   0   0 ]
[ 0   1   0 ]
[ 0   0   0 ]
```

Example:

```text
(2, 3, 5) -> (2, 3, 0)
```

---

## Projection onto the xz-plane

Formula:

```text
T(x, y, z) = (x, 0, z)
```

Matrix:

```text
[ 1   0   0 ]
[ 0   0   0 ]
[ 0   0   1 ]
```

Example:

```text
(2, 3, 5) -> (2, 0, 5)
```

---

## Projection onto the yz-plane

Formula:

```text
T(x, y, z) = (0, y, z)
```

Matrix:

```text
[ 0   0   0 ]
[ 0   1   0 ]
[ 0   0   1 ]
```

Example:

```text
(2, 3, 5) -> (0, 3, 5)
```

---

# Rotation Operators

## 2D counterclockwise rotation

A 2D counterclockwise rotation through angle `θ` has matrix:

```text
[ cosθ   -sinθ ]
[ sinθ    cosθ ]
```

So:

```text
T(x, y) = (xcosθ - ysinθ, xsinθ + ycosθ)
```

---

## Example: Rotate `(1, 0)` by 90 degrees counterclockwise

For `90°`:

```text
cos90° = 0
sin90° = 1
```

Matrix:

```text
[ 0  -1 ]
[ 1   0 ]
```

Apply to `(1, 0)`:

```text
x' = 1(0) - 0(1) = 0
y' = 1(1) + 0(0) = 1
```

Final answer:

```text
(1, 0) -> (0, 1)
```

---

## 3D rotation about the positive x-axis

```text
[ 1    0       0    ]
[ 0   cosθ   -sinθ  ]
[ 0   sinθ    cosθ  ]
```

Meaning:

```text
x stays the same.
y and z rotate.
```

---

## 3D rotation about the positive y-axis

```text
[  cosθ   0   sinθ ]
[   0     1    0   ]
[ -sinθ   0   cosθ ]
```

Meaning:

```text
y stays the same.
x and z rotate.
```

---

## 3D rotation about the positive z-axis

```text
[ cosθ   -sinθ   0 ]
[ sinθ    cosθ   0 ]
[  0       0     1 ]
```

Meaning:

```text
z stays the same.
x and y rotate.
```

---

# 11. Dilation / Scaling Transformations

## Meaning

Dilation means multiplying coordinates by a factor.

If the factor is `k`, then:

```text
T(x, y) = (kx, ky)
```

Analogy:

> Dilation is like zooming in or zooming out from the origin.

---

## Scaling in R²

Matrix:

```text
[ k   0 ]
[ 0   k ]
```

Example with `k = 3`:

```text
T(x, y) = (3x, 3y)
```

For point:

```text
(2, -1)
```

we get:

```text
(6, -3)
```

---

## Scaling in R³

Matrix:

```text
[ k   0   0 ]
[ 0   k   0 ]
[ 0   0   k ]
```

Example with `k = 2`:

```text
T(x, y, z) = (2x, 2y, 2z)
```

For point:

```text
(1, -2, 4)
```

we get:

```text
(2, -4, 8)
```

---

## Stretching and compression

If `k > 1`, the object stretches.

If `0 < k < 1`, the object compresses.

Example:

```text
k = 2
```

means the point becomes twice as far from the origin.

```text
k = 1/2
```

means the point becomes half as far from the origin.

---

# 12. Composition of Transformations

## Meaning

Composition means applying one transformation after another.

If:

```text
T1 is applied first
T2 is applied second
```

then:

```text
T2(T1(x))
```

For matrices:

```text
final matrix = A2A1
```

because the rightmost matrix acts first.

Analogy:

> Putting on socks then shoes is not the same as putting on shoes then socks. Order matters.

---

## Example: Dilation first, then rotation

Given:

```text
T1: R³ -> R³ is dilation by factor 2
T2: R³ -> R³ is rotation about the z-axis through 45°
```

Find the image of:

```text
(1, -2, 1)
```

when dilation is applied first and then rotation.

---

## Step 1: Apply dilation by factor 2

```text
T1(x, y, z) = (2x, 2y, 2z)
```

So:

```text
T1(1, -2, 1) = (2, -4, 2)
```

---

## Step 2: Apply rotation about z-axis by 45 degrees

Rotation about the z-axis:

```text
[ cosθ   -sinθ   0 ]
[ sinθ    cosθ   0 ]
[  0       0     1 ]
```

For `θ = 45°`:

```text
cos45° = √2/2
sin45° = √2/2
```

Formula:

```text
x' = xcos45° - ysin45°
y' = xsin45° + ycos45°
z' = z
```

Use point:

```text
(2, -4, 2)
```

Calculate `x'`:

```text
x' = 2(√2/2) - (-4)(√2/2)
x' = √2 + 2√2
x' = 3√2
```

Calculate `y'`:

```text
y' = 2(√2/2) + (-4)(√2/2)
y' = √2 - 2√2
y' = -√2
```

Calculate `z'`:

```text
z' = 2
```

Final answer:

```text
(1, -2, 1) -> (3√2, -√2, 2)
```

---

# Final Exam Checklist

## Linear combination

Ask:

```text
Can the target be made from the given objects?
```

Use:

```text
k1v1 + k2v2 + k3v3 = target
```

---

## Consistency

If row reduction gives:

```text
0 = nonzero
```

then the system is inconsistent.

---

## Linear independence

Use:

```text
c1v1 + c2v2 + c3v3 = 0
```

If only trivial solution exists:

```text
independent
```

If non-trivial solution exists:

```text
dependent
```

---

## Homogeneous systems

Always consistent.

If free variables exist:

```text
non-trivial solutions exist
```

---

## Spanning

To span `R^n`, need:

```text
n pivots
```

---

## Basis

Basis means:

```text
spanning + independent
```

For `n` vectors in `R^n`:

```text
det(A) != 0 means basis
```

---

## Transformations

Reflection:

```text
changes signs
```

Projection:

```text
removes a component
```

Rotation:

```text
uses sin and cos
```

Dilation:

```text
multiplies coordinates
```

Composition:

```text
applies transformations one after another
```
