

# CEP: Ibn‑e‑Sina ISA Design – Complete Guide

This CEP asks you to design a custom Instruction Set Architecture (ISA) and a matching datapath and control logic for a fictional processor called **Ibn‑e‑Sina**, used by the company **Al‑Tusi**. Your deliverable is an original ISA (not a subset of RISC‑V, MIPS, or x86), with instruction formats, encodings, registers, datapath, control unit, and hand‑traced executions.[^1]

***

## Problem overview

- Course: CS‑221 – Computer Organization \& Design (Complex Engineering Problem).[^1]
- Context: You are on the **compiler design team** for **Al‑Tusi**, designing the ISA for their new processor **Ibn‑e‑Sina**.[^1]
- Machine model:
    - Byte‑addressable memory.[^1]
    - Multi‑byte data is stored in **big‑endian** order.[^1]
- Goal: Propose an **original** ISA and a **matching hardware implementation** (datapath + control) that can execute a subset of your instructions.[^1]

Main tasks (high level):[^1]

1. Choose global ISA parameters (instruction length, register set, n‑address class, addressing modes).
2. Define instruction formats and assign binary codes to them (Table 1).
3. Define general‑purpose and special‑purpose registers (Tables 2 \& 3).
4. Design at least 16 instructions covering all required categories (Table 4).[^1]
5. Define instruction encodings at bit level (Table 5).[^1]
6. Design a datapath (single‑cycle or multi‑cycle) that implements a subset of your ISA.[^1]
7. Trace the execution of at least one instruction from each format on your datapath.[^1]
8. Derive control signals, ALU control unit, main control unit (truth tables, equations, logic diagrams) (Table 6).[^2][^3][^1]

***

## Design workflow (roadmap)

Use this as your step‑by‑step plan:

1. **Understand constraints \& objectives** from the CEP sheet.[^1]
2. **Pick global ISA decisions**: instruction length, register count/width, n‑address class.[^4][^1]
3. **Define addressing modes** (given ones + any extras you want).[^5][^6][^1]
4. **Design instruction formats** (R, M, L/S, I, C, U, plus up to two extra).[^7][^4][^1]
5. **Design register set** (general‑purpose + special‑purpose).[^8][^1]
6. **Define your instructions**: mnemonics, opcodes, syntax, semantics (Table 4).[^8][^1]
7. **Specify encodings**: exact bit patterns for each instruction (Table 5).[^4][^1]
8. **Design datapath** to support a chosen subset (at least one instruction per format).[^9][^10][^3][^2][^1]
9. **Trace execution** of one instruction per format on the datapath.[^2][^1]
10. **Derive control logic**: control signals per instruction, ALU control, main control.[^3][^2][^1]
11. **Check limitations \& originality** and document assumptions.[^8][^1]

You can treat each numbered section below as a chapter in your report and as a TODO checklist.

***

## Global ISA decisions

These are core choices that will affect everything else in your design.[^4][^8][^1]

### 1. Instruction length: fixed vs variable

The assignment allows **uniform (fixed)** or **variable‑length** instructions.[^1]

- **Fixed length** (e.g., 16 or 32 bits):
    - Easier fetch and decode, simpler datapath and control.[^4]
    - Bit budget is tight, so you must allocate fields carefully.[^4]
- **Variable length**:
    - Allows more flexible encodings and richer addressing modes.[^4]
    - Usually requires **multi‑cycle** fetch/decode and more complex control.[^9][^1]

For your first ISA, a **fixed‑length word (e.g., 16 bits)** with a **single‑cycle datapath** is often much easier to implement.[^10][^4]

### 2. Register set: count and width

Constraints:[^1]

- At least **4 general‑purpose registers**.
- Register **width** can be 8, 16, 32, 64, or 128 bits.
- Register names start from **R0**.
- Forbidden: design must **not** include **32 registers × 32 bits**.[^1]

Design tips:

- Choose something like **8 or 16 registers** of **16 or 32 bits**; this gives enough flexibility without exploding complexity.[^8]
- Reserve **R0** as your **accumulator** (Acc) to match the provided template (Table 2)..[^1]
- Decide if any registers have conventional roles (stack pointer, frame pointer, link register), but avoid over‑complicating if your register count is small.[^8][^1]


### 3. Special‑purpose registers

You must at least have:[^1]

- **Program Counter (PC)** – holds address of next instruction.[^8][^1]

You may also add:

- **Stack Pointer (SP)** – top of stack for PUSH/POP.[^8][^1]
- **Status/Flags Register (SR)** – holds condition flags (Z, N, C, V) used for branches.[^8]
- **Instruction Register (IR)** – often implicit; stores current instruction.

Each special‑purpose register should appear in **Table 3** with a clear purpose.[^1]

### 4. n‑address classification

The processor is an **n‑address machine** with $0 \le n \le 3$.[^1]

- 3‑address (e.g., `ADD rd, rs1, rs2`) – separate dest and 2 sources; very flexible.[^4][^8]
- 2‑address (e.g., `ADD A, B` where A = A + B) – one operand is both source and dest.[^4][^1]
- 1‑address (accumulator style) – one explicit operand; other is implicit accumulator.[^4][^1]
- 0‑address (stack) – operations use top elements of stack.[^4][^1]

You can choose any n between 0 and 3, but designing with **2‑ or 3‑address register‑based instructions** plus a **load/store model** is usually the cleanest.[^8][^4]

***

## Addressing modes

The ISA must include at least these addressing modes:[^1]

- Immediate
- Direct
- Register direct
- Base (register + displacement)
- PC‑relative

You may add more if needed.[^1]

### Required addressing modes (concepts)

Use these standard definitions to guide your design:[^6][^11][^12][^5]

- **Immediate addressing**
    - Operand is encoded directly in the instruction (constant).[^5]
    - Example: `ADD R1, #5` – add constant 5 to R1.[^5]
- **Direct addressing**
    - Instruction contains **memory address** of operand.[^5]
    - Example: `LOAD R1, 1000` – load from memory address 1000 into R1.[^5]
- **Register direct addressing**
    - Operand is in a register specified by the instruction.[^5]
    - Example: `ADD R1, R2` – both operands in registers.
- **Base (register + offset) addressing**
    - Effective address = **base register + immediate offset**.[^12]
    - Example: `LOAD R1, 4(R2)` – address is R2 + 4.[^12][^5]
- **PC‑relative addressing**
    - Effective address = PC + offset; good for branches.[^11][^6]
    - Example pattern: `BEQ R1, R2, offset` – if equal, PC = PC + offset.[^6]

Optional additional modes you may add:

- **Register indirect** – effective address is in register: `LOAD R1, (R2)`.[^6][^5]
- **Auto‑increment/decrement** – use value at R, then update R (useful for stacks or arrays).[^12]

***

## Instruction formats

The assignment requires several named formats and lets you add up to two more.[^1]

### Required formats

You must include at least these formats:[^1]

1. **Register format (R)**
    - Arithmetic/logic operations on register operands only.
    - Example idea (for a 2‑ or 3‑address design):
        - Bits: `[format | opcode | rd | rs1 | rs2]`.[^4][^7]
2. **Register–Memory format (M)**
    - One register operand, one memory operand, result stored in a register.[^1]
    - Example bits: `[format | opcode | rd | base | offset]`.
3. **Load/Store format (L/S)**
    - Load data from memory to register (or accumulator), or store register to memory.[^1]
    - May use base or direct addressing; result often placed in Acc or specified register.[^8][^1]
4. **Immediate format (I)**
    - One register/memory operand and one immediate, result stored in register/memory.[^1]
    - Example bits: `[format | opcode | rd | rs | imm]`.
5. **Conditional branch format (C)**
    - For conditional branches: includes PC‑relative offset field.[^6][^1]
    - Example bits: `[format | opcode | condition | rs1 | rs2 | offset]`.
6. **Unconditional branch format (U)**
    - For goto / jump / call; includes PC‑relative offset field.[^1]
    - Example bits: `[format | opcode | offset]`.

### Additional formats

You may define **up to two more formats** of your own. Some ideas:[^1]

- **Stack format (S)** – for PUSH/POP with SP and optional offset.
- **System/Immediate‑wide format (X)** – for larger immediates, or special system/control instructions.

For every format, you must:

- Assign a **binary code** for the format itself (Table 1).[^1]
- Specify **all fields** and their **bit widths** (e.g., opcode 4 bits, rd 4 bits, etc.).[^7][^4][^1]

***

## Instruction formats table (Table 1 template)

Fill this table for your design (codes and descriptions are placeholders):

markdown
### Table 1 – Instruction Formats

| S.No. | Instruction Format | Binary Code | Description                                  |
|-------|--------------------|------------|----------------------------------------------|
| 1     | Register (R)       | 000        | Reg–reg arithmetic / logic                   |
| 2     | Reg–Mem (M)        | 001        | Reg–mem arithmetic / logic                   |
| 3     | Load/Store (L/S)   | 010        | Load / store between reg and memory          |
| 4     | Immediate (I)      | 011        | Reg / mem with immediate                     |
| 5     | Conditional (C)    | 100        | Conditional branches with PC‑relative offset |
| 6     | Unconditional (U)  | 101        | Jumps / calls with PC‑relative offset        |
| 7     | Stack (S)          | 110        | PUSH / POP using SP                          |
| 8     | — (unused)         | 111        | Unused / reserved                            |


Adapt codes, names, and descriptions to your actual design and mark any unused codes clearly, as required.[^1]

***

## Register design (Table 2) and choices

You need a **list of programmer‑visible general‑purpose registers** with names, binary codes, and purposes.[^1]

### Design tips

- Pick a **small, clean set**: e.g., 8 registers (R0–R7) of 16 or 32 bits.[^8][^1]
- Decide the **role** of each: accumulator, temporaries, base registers, stack pointer, etc.[^1]
- Use intuitive naming and stick to it throughout instructions and datapath.


### General‑purpose registers table (template)

markdown
### Table 2 – General‑Purpose Registers

| S.No. | Register Name | Abbrev. | Binary Code | Purpose                                                                 |
|-------|---------------|---------|-------------|-------------------------------------------------------------------------|
| 1     | Accumulator   | R0/Acc  | 000         | Implicit source/dest for ALU ops; used in load/store; holds division rem |
| 2     | Register 1    | R1      | 001         | General operand / temporary                                            |
| 3     | Register 2    | R2      | 010         | General operand / base register                                        |
| 4     | Register 3    | R3      | 011         | General operand / base register                                        |
| 5     | Register 4    | R4      | 100         | General operand                                                        |
| 6     | Register 5    | R5      | 101         | General operand                                                        |
| 7     | Register 6    | R6      | 110         | Stack Pointer (SP) or general operand                                  |
| 8     | Register 7    | R7      | 111         | Link register / return address or general operand                      |


Adapt binary codes and purposes based on your chosen register count and roles, respecting the CEP limitation on 32×32.[^1]

***

## Special‑purpose registers (Table 3)

List all special registers used by your ISA and datapath.[^1]

markdown
### Table 3 – Special‑Purpose Registers

| S.No. | Register Name     | Purpose                                             |
|-------|-------------------|-----------------------------------------------------|
| 1     | Program Counter   | Address of next instruction to fetch               |
| 2     | Status Register   | Holds flags (Z, N, C, V) for conditional branches   |
| 3     | Stack Pointer (SP)| Top of stack for PUSH/POP                          |
| 4     | — (optional)      | —                                                   |


You might treat SP and SR as separate from the general register set, or implement them as specific GPRs with conventional roles.[^8][^1]

***

## Instruction set design (Table 4)

You must propose **at least 16 instructions**, with some belonging to each format (R, M, L/S, I, C, U, plus optional formats). Your list should cover:[^1]

- **Data transformation** (ALU) instructions.[^8][^1]
- **Data transfer** (load/store) instructions.[^1]
- **Transfer of control** (conditional and unconditional branches).[^8][^1]
- **Stack operations** (explicit PUSH/POP or primitives that implement them).[^1]


### Example categories and typical instructions

Use this as inspiration; adjust to match your own ISA decisions:

- **Data transformation (R, M, I)**
    - `ADD`, `SUB`, `AND`, `OR`, `XOR`, `SHL`, `SHR`.
- **Data transfer (L/S)**
    - `LDW` (load word), `LDB` (load byte), `STW` (store word), `STB` (store byte).
- **Conditional branches (C)**
    - `BEQ` (branch if equal), `BNE` (not equal), `BLT` (less than), `BGT` (greater than), etc.[^8]
- **Unconditional branches (U)**
    - `J` (jump), `CALL` (call subroutine), `RET` (return).
- **Stack operations (S)**
    - `PUSH`, `POP` using SP.


### Instruction reference sheet template (Table 4)

markdown
### Table 4 – Instruction Reference Sheet

| S.No. | Mnemonic | Opcode (bin) | Syntax                | Addr. Mode         | Format | Action / Semantics                                  |
|-------|----------|--------------|-----------------------|--------------------|--------|-----------------------------------------------------|
| 1     | ADD      | 0000         | ADD rd, rs1, rs2      | Reg direct         | R      | rd ← rs1 + rs2                                      |
| 2     | ADDI     | 0001         | ADDI rd, rs, imm      | Reg + immediate    | I      | rd ← rs + imm                                      |
| 3     | SUB      | 0010         | SUB rd, rs1, rs2      | Reg direct         | R      | rd ← rs1 - rs2                                      |
| 4     | AND      | 0011         | AND rd, rs1, rs2      | Reg direct         | R      | rd ← rs1 AND rs2                                    |
| 5     | OR       | 0100         | OR rd, rs1, rs2       | Reg direct         | R      | rd ← rs1 OR rs2                                     |
| 6     | LDW      | 0101         | LDW rd, offset(base)  | Base + offset      | L/S    | rd ← MEM[base + offset]                             |
| 7     | STW      | 0110         | STW rs, offset(base)  | Base + offset      | L/S    | MEM[base + offset] ← rs                             |
| 8     | BEQ      | 0111         | BEQ rs1, rs2, offset  | PC‑relative        | C      | if rs1 == rs2 then PC ← PC + offset                 |
| 9     | BNE      | 1000         | BNE rs1, rs2, offset  | PC‑relative        | C      | if rs1 ≠ rs2 then PC ← PC + offset                 |
| 10    | J        | 1001         | J offset              | PC‑relative        | U      | PC ← PC + offset                                    |
| 11    | CALL     | 1010         | CALL offset           | PC‑relative        | U      | R7 ← PC + 1; PC ← PC + offset (if R7 is link reg)   |
| 12    | RET      | 1011         | RET                   | Implied (R7)       | U/S    | PC ← R7                                             |
| 13    | PUSH     | 1100         | PUSH rs               | SP‑relative        | S      | SP ← SP - word; MEM[SP] ← rs                        |
| 14    | POP      | 1101         | POP rd                | SP‑relative        | S      | rd ← MEM[SP]; SP ← SP + word                        |
| 15    | CLR      | 1110         | CLR rd                | Reg direct         | R      | rd ← 0                                              |
| 16    | NOP      | 1111         | NOP                   | —                  | R/U    | No operation                                        |


Replace with your own opcodes, formats, and semantics; ensure at least 16 instructions overall and coverage of all required categories.[^1]

***

## Instruction encodings (Table 5)

You must show **how each instruction maps to bits** using your chosen formats and field widths.[^4][^8][^1]

### General approach

1. Decide the **total instruction length** (e.g., 16 bits).
2. Split into **fields**: format, opcode, register indices, immediate/offset, etc.[^7][^4]
3. For each instruction, write the **full bit pattern** using those fields.

Example for a 16‑bit 3‑address R‑format:

- Bits: `[3 bits format][4 bits opcode][3 bits rd][3 bits rs1][3 bits rs2]` (total 16).
- An `ADD R1, R2, R3` might encode as:
    - `format = 000` (R)
    - `opcode = 0000` (ADD)
    - `rd = 001` (R1)
    - `rs1 = 010` (R2)
    - `rs2 = 011` (R3)


### Instruction encoding table (template)

markdown
### Table 5 – Instruction Encodings

| S.No. | Instruction Syntax      | Encoding (bit fields, MSB→LSB)                                     |
|-------|-------------------------|---------------------------------------------------------------------|
| 1     | ADD rd, rs1, rs2        | [format=000][opcode=0000][rd][rs1][rs2]                            |
| 2     | ADDI rd, rs, imm        | [format=011][opcode=0001][rd][rs][imm(5 bits)]                     |
| 3     | LDW rd, offset(base)    | [format=010][opcode=0101][rd][base][offset(5 bits)]                |
| 4     | STW rs, offset(base)    | [format=010][opcode=0110][rs][base][offset(5 bits)]                |
| 5     | BEQ rs1, rs2, offset    | [format=100][opcode=0111][rs1][rs2][offset(5 bits, signed)]        |
| 6     | J offset                | [format=101][opcode=1001][offset(9 bits, signed)]                  |
| 7     | PUSH rs                 | [format=110][opcode=1100][rs][unused / reserved bits]              |
| 8     | POP rd                  | [format=110][opcode=1101][rd][unused / reserved bits]              |


Use this table to prove that your field widths are sufficient for the number of registers, opcodes, and immediates you defined.[^4][^1]

***

## Datapath design (task 6)

You must design a **datapath** that can execute at least one instruction from each format in your chosen subset. This can be **single‑cycle** or **multi‑cycle**.[^1]

### Components you will likely need

Based on standard single‑cycle / multi‑cycle CPU designs:[^10][^3][^2][^9]

- **PC register** and **PC adder** (PC + 1 or PC + offset).
- **Instruction memory** – read‑only memory storing instructions.[^2][^10]
- **Instruction register (IR)** – holds current instruction for decoding.
- **Register file** – read two registers, write one per instruction.[^3][^2]
- **ALU** – supports add, subtract, logical ops, shifts, and address calculations.[^3][^2]
- **Data memory** – for loads and stores.
- **Sign/zero extension** units – for immediates and offsets.
- **Multiplexers (MUXes)** – choose between different sources (e.g., ALU input from reg vs immediate, write‑back from ALU vs memory).[^2]
- **Control unit** – generates control signals based on opcode / format.[^9][^2]
- Optional: **Secondary ALU** or additional adders for PC‑relative branch calculations.[^2]


### Single‑cycle vs multi‑cycle

- **Single‑cycle**:
    - Each instruction completes in one long cycle; datapath executes fetch‑decode‑execute‑writeback in one pass.[^10][^3][^2]
    - Simpler control (pure combinational), but timing can be slow.
- **Multi‑cycle**:
    - Breaks instruction execution into steps (IF, ID, EX, MEM, WB) over multiple cycles.[^13][^9]
    - More suitable if you choose **variable‑length instructions**, because fetch/decode may take multiple cycles.[^9][^1]

The CEP hints that **variable‑length instructions might require a multi‑cycle datapath**, so if you choose variable‑length encodings, design with that in mind.[^9][^1]

***

## Tracing instruction execution (task 7)

You must **trace the execution of at least one instruction from each format** on your datapath.[^1]

For each chosen instruction:

1. Show the **instruction word** and fields (format, opcode, registers, immediates).
2. Step through the datapath stages:
    - IF: PC → instruction memory → IR; PC updated (PC + 1 or PC + 2, etc.).[^2][^4]
    - ID: Decode, read registers, generate control signals.[^3][^2]
    - EX: ALU computes result / address / branch target.[^2]
    - MEM: Access data memory for loads/stores.[^10][^2]
    - WB: Write result back to register file.[^3][^2]
3. On a printed datapath diagram, **highlight the active paths and control signals** for that instruction, similar to classroom RISC‑V traces.[^2][^1]

You can follow patterns from standard single‑cycle datapath lectures to structure each trace.[^3][^2]

***

## Control signals and control units (tasks 9–10)

You must:[^1]

- List **control signals and their values** for each instruction (Table 6).
- Design **ALU control**, **main control unit**, and give their **truth tables, logic expressions, and logic diagrams**, as well as the ALU diagram itself.[^9][^3][^2][^1]


### Typical control signals

Borrowing ideas from standard RISC‑V/MIPS‑like datapaths:[^3][^2]

- `RegWrite` – write to register file.
- `MemRead`, `MemWrite` – control data memory.
- `MemToReg` – choose between ALU result and memory data for write‑back.
- `ALUSrc` – choose ALU second input (register vs immediate).
- `Branch`, `Jump` – control PC update logic.
- `ALUOp` bits – encoded signal to ALU control unit for operation selection.

Your **Table 6** then assigns 0/1 (or multi‑bit values) for each instruction.

### ALU control unit

- Inputs: ALUOp bits (from main control) + function bits (possibly lower opcode bits).[^3][^2]
- Output: ALU operation code (e.g., add, sub, and, or, shift).
- For each (ALUOp, func) pair, define desired ALU operation in a **truth table**, then derive simplified Boolean equations (K‑maps or algebra) and draw a logic diagram.[^2][^3]


### Main control unit

- Input: opcode/format bits of instruction.[^2]
- Outputs: high‑level control signals (`RegWrite`, `MemRead`, `Branch`, `ALUSrc`, `ALUOp`, etc.).[^3][^2]
- Again, define a truth table (rows = opcodes, columns = control outputs), derive Boolean equations, and draw the logic diagram.

***

## Control signal table (Table 6 template)

markdown
### Table 6 – Control Signal Values per Instruction

| Instruction | RegWrite | MemRead | MemWrite | MemToReg | ALUSrc | Branch | Jump | ALUOp1 | ALUOp0 | ... (more signals if needed) |
|------------|----------|---------|----------|----------|--------|--------|------|--------|--------|-------------------------------|
| ADD        | 1        | 0       | 0        | 0        | 0      | 0      | 0    | 0      | 0      | ...                           |
| ADDI       | 1        | 0       | 0        | 0        | 1      | 0      | 0    | 0      | 1      | ...                           |
| LDW        | 1        | 1       | 0        | 1        | 1      | 0      | 0    | 0      | 0      | ...                           |
| STW        | 0        | 0       | 1       | X        | 1      | 0      | 0    | 0      | 0      | ...                           |
| BEQ        | 0        | 0       | 0        | X        | 0      | 1      | 0    | 1      | 0      | ...                           |
| J          | 0        | 0       | 0        | X        | X      | 0      | 1    | X      | X      | ...                           |
| PUSH       | 0/1*     | 0       | 1       | X        | 1      | 0      | 0    | 0      | 0      | ...                           |
| POP        | 1        | 1       | 0       | 1        | 1      | 0      | 0    | 0      | 0      | ...                           |


(*Adjust signals based on your exact datapath; X = don't care.)[^3][^2]

***

## Limitations and originality

The CEP imposes explicit limitations:[^1]

- **No 32×32 register file** (32 registers of 32 bits each).[^1]
- **No floating‑point arithmetic** support.[^1]
- Integer division (if supported) must place quotient in destination register and remainder in accumulator.[^1]
- Any ISA that is just a **subset of RISC‑V, MIPS, or Intel x86** is **rejected**—you must be original.[^1]

Guidelines:

- Make **realistic assumptions** if something is missing, and state them clearly in your report.[^1]
- Avoid adding unnecessary complexity to the ISA—keep it just powerful enough to demonstrate the concepts and satisfy requirements.[^8][^1]

***

## Deliverables checklist (from CEP)

Your handwritten deliverable must include:[^1]

1. Rubrics sheet as title page.
2. **Tables 1–6** with your complete ISA design (instruction formats, registers, instructions, encodings, control signals).[^1]
3. Arguments and justifications at each design stage (why you chose certain widths, formats, instructions, etc.).[^1]
4. Datapath diagram (software‑drawn is allowed).[^1]
5. Hand‑traced execution of at least one instruction from each format on the datapath.[^1]
6. Truth tables, logic expressions, and logic diagrams for ALU control unit, main control unit, and ALU.[^2][^1]

Use this section as your **final “before submit” checklist**.

***

## Study resources (free videos and documents)

Here’s a table of **free resources** (videos are emphasized, with some optional PDFs/slides) you can use to do deep research while designing your ISA and datapath.

markdown
### Learning Resources for ISA & Datapath

| Topic                             | Type     | Title / Source                                                            | Link                                                | How it helps                                                                                   |
|----------------------------------|----------|---------------------------------------------------------------------------|-----------------------------------------------------|------------------------------------------------------------------------------------------------|
| ISA basics & concepts            | Video    | What is Instruction Set Architecture? (COA)                               | https://www.youtube.com/watch?v=6fgbLOL7bis         | Clear intro to ISA, its role between hardware and software, and high-level ISA components.    |
| Addressing modes (theory)        | Article  | Addressing Modes – GeeksforGeeks                                         | https://www.geeksforgeeks.org/computer-organization-architecture/addressing-modes-1/ | Explains immediate, direct, register, indirect, and more with examples; good for your mode defs. |
| Addressing modes (video)         | Video    | Addressing Modes Part 1 (Direct, Indirect, Immediate, Register)          | https://www.youtube.com/watch?v=M7nHnMEuQRY         | Visual explanation of addressing modes with diagrams and notes.                               |
| ISA slides (operations, formats) | PDF      | Instruction Set Architecture – UCSD CSE141 slides                        | https://cseweb.ucsd.edu/classes/su06/cse141/slides/s02-isa-1up.pdf | Great reference for instruction formats, length, and operand count tradeoffs.                 |
| ISA overview & categories        | Article  | Instruction Set Architecture – Wikipedia                                 | https://en.wikipedia.org/wiki/Instruction_set_architecture | Overview of ISA types, operations (data, control flow), and encoding considerations.          |
| Addressing modes variants        | Article  | Addressing mode – Wikipedia                                              | https://en.wikipedia.org/wiki/Addressing_mode       | Detailed list of addressing modes including PC-relative and base+index.                       |
| Single-cycle datapath (intro)    | Video    | Single Cycle Design – The Simple Engineer                                | https://www.youtube.com/watch?v=1oTUjVozQgY         | Visual explanation of single-cycle CPU datapath stages and components.                        |
| Single-cycle datapath (deep)     | Video    | Lab: Single Cycle Datapaths (LC2K example)                               | https://www.youtube.com/watch?v=vyJoME8cPWU         | Walkthrough of mapping ISA operations to datapath components and control.                     |
| Multi-cycle & pipeline overview  | Video    | Digital Design & Comp Arch – Lecture: Multi-Cycle Datapath               | https://www.youtube.com/watch?v=49zRKmEXAcE         | Shows multi-cycle datapath design, useful if you choose variable-length instructions.         |
| ISA + datapath playlist          | Video    | CS2100 Lecture – ISA Datapath, Computer Architecture & Digital Design    | https://www.youtube.com/watch?v=sl2bnX3It2c         | Series covering MIPS ISA, single-cycle, multi-cycle, and pipeline; good inspiration.          |
| RISC-V single-cycle datapath     | Video    | CS61C Lecture – Single-Cycle CPU Datapath I (RISC-V)                     | https://www.youtube.com/watch?v=YAMqWaTZy8k         | Detailed RISC-V datapath; adapt ideas while keeping your ISA original.                        |
| ISA components summary           | Article  | What is Instruction Set Architecture (ISA)? – Arm                        | https://www.arm.com/glossary/isa                    | Concise summary of ISA elements: registers, instruction formats, operations.                  |
| ISA slides (CISC vs RISC etc.)  | Slides   | Instruction Set Architecture – Slideshare                                | https://www.slideshare.net/slideshow/instruction-set-architecture-254097280/254097280 | Good for understanding design tradeoffs and examples.                                         |

Sources for this table are from the search results above.[^14][^15][^16][^13][^7][^6][^10][^5][^9][^3][^2][^4][^8]

***

## How to actually approach the CEP (practical strategy)

1. **Lock core parameters early**
    - Pick instruction length (e.g., 16 bits), number and width of registers, and whether your design is 2‑ or 3‑address. These choices constrain everything else.[^4][^1]
2. **Sketch formats and field widths on paper**
    - Allocate enough bits for opcode, registers, and immediates while staying within your instruction length.[^7][^4]
    - Use a rough table like “field → bit range” for each format.
3. **Design a small but complete instruction set**
    - Ensure you can write simple code snippets: arithmetic, load/store, if/else, loops, function calls, and stack operations.[^8][^1]
    - Keep it minimal but not crippled.
4. **Freeze the subset you will implement in hardware**
    - From your full design, choose **1–2 key instructions per format** for the datapath and control design.[^1]
5. **Base datapath on a textbook design, but adapt**
    - Use single‑cycle RISC‑V/MIPS datapaths as structural inspiration while **changing encodings, fields, and operation set** to your custom ISA.[^10][^3][^2]
    - Ensure all control signals and wires make sense for *your* formats and addressing modes.
6. **Iterate: design → trace → fix**
    - As you trace example instructions on the datapath, you’ll see missing paths or wrong control values; refine formats, control, or datapath connections as needed.[^2][^1]
7. **Document assumptions and arguments**
    - For every major decision (register count, field widths, addressing modes, chosen datapath type), write a short justification supported by ISA design principles and your references.[^4][^8][^1]

Use this Markdown as your **master spec**: expand sections, plug in your actual field widths, opcodes, and diagrams, and then transfer the final details into the handwritten tables and schematics required by the CEP.

<div align="center">⁂</div>

[^1]: CEP-ISA-Design-2026.pdf

[^2]: https://www.youtube.com/watch?v=vyJoME8cPWU

[^3]: https://www.youtube.com/watch?v=YAMqWaTZy8k

[^4]: https://cseweb.ucsd.edu/classes/su06/cse141/slides/s02-isa-1up.pdf

[^5]: https://www.geeksforgeeks.org/computer-organization-architecture/addressing-modes-1/

[^6]: https://en.wikipedia.org/wiki/Addressing_mode

[^7]: https://www.arm.com/glossary/isa

[^8]: https://en.wikipedia.org/wiki/Instruction_set_architecture

[^9]: https://www.youtube.com/watch?v=49zRKmEXAcE

[^10]: https://www.youtube.com/watch?v=1oTUjVozQgY

[^11]: https://www.geeksforgeeks.org/computer-organization-architecture/difference-between-relative-addressing-mode-and-direct-addressing-mode/

[^12]: https://people.engr.tamu.edu/rgutier/lectures/mbsd/mbsd_l4.pdf

[^13]: https://www.youtube.com/watch?v=sl2bnX3It2c

[^14]: https://www.slideshare.net/slideshow/instruction-set-architecture-254097280/254097280

[^15]: https://www.youtube.com/watch?v=M7nHnMEuQRY

[^16]: https://www.youtube.com/watch?v=6fgbLOL7bis

