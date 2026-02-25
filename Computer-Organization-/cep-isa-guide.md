# CEP (CS221) – Ibn‑e‑Sina ISA Design (2026)

This Markdown file is a complete, practical “build guide” for the **Complex Engineering Problem (CEP)** on designing an original **Instruction Set Architecture (ISA)** for the fictional processor **Ibn‑e‑Sina**.

> Use it like a spec + checklist: fill the placeholders, freeze decisions, then copy final values into your handwritten Tables 1–6 and diagrams.

---

## 0) What the CEP is asking

You are on the compiler/architecture team for Al‑Tusi’s new processor chip **Ibn‑e‑Sina**.

**Machine assumptions given by CEP**
- Byte‑addressable machine.
- Multi‑byte values stored **big‑endian**.

**You must design**
- An original ISA (not a subset of RISC‑V, MIPS, or x86).
- Instruction formats + opcodes + encodings.
- Register set (GPR + special registers).
- At least **16 instructions** total.
- A datapath (single‑cycle or multi‑cycle) that implements a **subset** of your ISA (≥ 1 instruction per format).
- Traces (execute one instruction per format on your datapath).
- Control signals table + ALU control + main control unit (truth tables, equations, diagrams).

**Hard limitations**
- Do **not** use **32 registers of 32 bits**.
- No floating‑point arithmetic.
- If you support integer division: quotient in destination register; remainder in accumulator.

---

## 1) Deliverables checklist (what you submit)

### Must include
- [ ] Rubrics sheet on top.
- [ ] **Table 1** Instruction formats + binary codes.
- [ ] **Table 2** General‑purpose (programmer accessible) registers + codes + purpose.
- [ ] **Table 3** Special‑purpose registers + purpose.
- [ ] **Table 4** Instruction reference sheet (mnemonic, opcode, syntax, addressing mode, format, action).
- [ ] **Table 5** Instruction encodings (bit‑level).
- [ ] **Datapath diagram** (single‑cycle or multi‑cycle).
- [ ] **Tracing**: ≥ 1 instruction from each format.
- [ ] **Table 6** Control signal values per implemented instruction.
- [ ] ALU control unit: truth table, equations, logic diagram.
- [ ] Main control unit: truth table, equations, logic diagram.
- [ ] ALU logic diagram.

### Quality requirements
- [ ] Every decision is justified (field widths, register count, instruction length, addressing modes, etc.).
- [ ] Clearly state assumptions.
- [ ] Design is original (no “subset of existing ISA”).

---

## 2) Freeze your global ISA decisions (do this first)

Fill these in before designing formats.

### 2.1 Instruction length
- Choice: `Fixed` / `Variable`
- If Fixed: `__` bits (recommended: 16 or 24 or 32)
- If Variable: supported lengths (e.g., 16/32) and how you encode length.

**Recommendation (for easiest datapath):** fixed‑length 16‑bit or 24‑bit.

### 2.2 General‑purpose registers (GPR)
- Register count: `__` (≥ 4)
- Register width: `8 / 16 / 32 / 64 / 128` bits
- Naming: R0..R(__)
- Accumulator: `R0` as `Acc` (recommended, matches CEP templates)

✅ Constraint: do not choose 32×32.

### 2.3 n‑address class (0..3)
- Choose: `0 / 1 / 2 / 3`

Practical notes
- 3‑address gives clean code but needs more bits.
- 2‑address is common and saves bits.
- 1‑address (Accumulator) saves bits but needs more moves.
- 0‑address (stack) is elegant but harder to integrate with the required formats.

### 2.4 Addressing modes (must include)
Must include:
- Immediate
- Direct
- Register direct
- Base (reg + offset)
- PC‑relative

Optional (if you want): register indirect, indexed, auto‑inc/dec.

---

## 3) Choose your instruction formats (R, M, L/S, I, C, U + optional)

You must include at least these formats:
- **R**: register‑register ALU ops
- **M**: register‑memory ALU ops (result to register)
- **L/S**: load/store
- **I**: immediate ALU ops
- **C**: conditional branches (PC‑relative offset)
- **U**: unconditional branches/jumps/calls (PC‑relative offset)

You may add **up to two** more formats.

### 3.1 Table 1 – Instruction formats

> Put the “format code” in the most significant bits of the instruction.

| S.No. | Instruction Format | Format Code (bin) | Notes |
|------:|--------------------|-------------------|------|
| 1 | Register (R) | ___ | Reg‑reg ALU |
| 2 | Reg‑Mem (M) | ___ | One operand from memory |
| 3 | Load/Store (L/S) | ___ | Loads/stores |
| 4 | Immediate (I) | ___ | ALU with immediate |
| 5 | Conditional (C) | ___ | PC‑relative branches |
| 6 | Unconditional (U) | ___ | Jump/call/ret |
| 7 | Optional Format 1 | ___ | e.g., Stack (S) |
| 8 | Optional Format 2 / Unused | ___ | mark unused codes |

---

## 4) Define your registers

### 4.1 Table 2 – General‑purpose (programmer accessible) registers

> Include unused codes if your encoding supports more regs than you actually implement.

| S.No. | Register Name | Abbrev | Binary Code | Purpose |
|------:|---------------|--------|------------|---------|
| 1 | Accumulator | Acc / R0 | ___ | implicit operand for some ops; remainder for DIV (if supported) |
| 2 | Register 1 | R1 | ___ | general |
| 3 | Register 2 | R2 | ___ | general / base |
| 4 | Register 3 | R3 | ___ | general / base |
| … | … | … | … | … |

### 4.2 Table 3 – Special‑purpose registers

| S.No. | Register Name | Purpose |
|------:|---------------|---------|
| 1 | Program Counter (PC) | next instruction address |
| 2 | Status/Flags (SR) | Z/N/C/V flags for branches (if you implement flags) |
| 3 | Stack Pointer (SP) | top of stack (if you implement stack ops) |
| … | … | … |

---

## 5) Design your instruction set (≥ 16 instructions)

You must include instructions from these categories:

### 5.1 Data transformation (ALU)
At least **4** ALU operations (examples)
- ADD, SUB
- AND, OR, XOR
- SHL, SHR
- CMP (sets flags) or TST

### 5.2 Data transfer (load/store)
Examples
- LDB / LDH / LDW
- STB / STH / STW

Decide:
- signed/unsigned loads?
- alignment rules?

### 5.3 Control transfer
- Conditional branches: at least **4** (e.g., BEQ, BNE, BLT, BGE)
- Unconditional branches: at least **2** (e.g., J, CALL)

### 5.4 Stack operations
Either:
- Explicit PUSH/POP format
OR
- Implement with primitives using SP + store/load + arithmetic

---

## 6) Table 4 – Instruction reference sheet

> Keep this table consistent with your encoding fields (opcode width, register fields, immediate size, etc.).

| S.No. | Mnemonic | Opcode (bin) | Syntax | Addressing Mode | Format | Action (semantics) |
|------:|----------|--------------|--------|-----------------|--------|--------------------|
| 1 | ___ | ___ | `ADD rd, rs1, rs2` | register direct | R | `rd ← rs1 + rs2` |
| 2 | ___ | ___ | `ADDI rd, rs, imm` | immediate | I | `rd ← rs + imm` |
| 3 | ___ | ___ | `LDW rd, off(base)` | base | L/S | `rd ← MEM[base+off]` |
| 4 | ___ | ___ | `STW rs, off(base)` | base | L/S | `MEM[base+off] ← rs` |
| … | … | … | … | … | … | … |

---

## 7) Define bit‑level encodings (Table 5)

### 7.1 Step‑by‑step method
1. Choose instruction length (e.g., 16 bits).
2. Allocate MSBs to `format`.
3. Decide opcode width inside each format.
4. Decide register field width (based on #registers).
5. Decide immediate/offset widths (signed vs unsigned).
6. For each instruction, write full field layout.

### 7.2 Field planning worksheet (fill this)

#### R‑format (example layout)
- Total bits: __
- Fields (MSB→LSB):
  - format: __ bits
  - opcode: __ bits
  - rd: __ bits
  - rs1: __ bits
  - rs2: __ bits

Repeat for M, L/S, I, C, U, and optional formats.

### 7.3 Table 5 – Instruction encoding table (template)

| S.No. | Instruction Syntax | Encoding (MSB→LSB using fields) |
|------:|--------------------|----------------------------------|
| 1 | `ADD rd, rs1, rs2` | `[fmt][op][rd][rs1][rs2]` |
| 2 | `ADDI rd, rs, imm` | `[fmt][op][rd][rs][imm]` |
| 3 | `LDW rd, off(base)` | `[fmt][op][rd][base][off]` |
| 4 | `BEQ rs1, rs2, off` | `[fmt][op][rs1][rs2][off]` |
| … | … | … |

---

## 8) Datapath design (implement a subset)

You only need to build hardware for a **subset** of your instructions, but at least **one instruction per format**.

### 8.1 Choose datapath type
- Datapath: `Single‑cycle` / `Multi‑cycle`

If you chose **variable‑length** instructions, a **multi‑cycle** design is usually easier (fetch/decode can take multiple cycles).

### 8.2 Typical blocks you’ll need
- PC register
- Instruction memory + IR
- Register file (read ports + write port)
- ALU
- Data memory
- Immediate/offset extender
- Adders (PC+1, PC+offset)
- MUXes for selecting ALU inputs and writeback data
- Control unit (main + ALU control)

### 8.3 Decide your “implemented subset” now
List the exact instructions you will implement in datapath (≥ 1 per format):
- R: `__________`
- M: `__________`
- L/S: `__________`
- I: `__________`
- C: `__________`
- U: `__________`
- Optional: `__________`

---

## 9) Trace execution (1 instruction per format)

For each traced instruction, write:
- Instruction bits and decoded fields
- Register values before
- Memory values before (if used)
- Active datapath path (highlight on diagram)
- Control signals (values)
- ALU inputs/outputs
- PC update result
- Register/memory updates

Create a section per format:

### 9.1 Trace – R format: `__________`
- Before:
- Decode:
- Execute:
- Writeback:

### 9.2 Trace – M format: `__________`
...

### 9.3 Trace – L/S format: `__________`
...

### 9.4 Trace – I format: `__________`
...

### 9.5 Trace – C format: `__________`
...

### 9.6 Trace – U format: `__________`
...

---

## 10) Control signals (Table 6) + control unit design

### 10.1 Pick your control signals
Define names clearly (example set):
- RegWrite
- MemRead
- MemWrite
- MemToReg
- ALUSrc
- Branch
- Jump
- PCSrc (or multiple PC select bits)
- ALUOp1, ALUOp0
- ExtMode (sign/zero extend)

### 10.2 Table 6 – Control signals per implemented instruction

| Instruction | RegWrite | MemRead | MemWrite | MemToReg | ALUSrc | Branch | Jump | ALUOp1 | ALUOp0 | … |
|------------|----------|---------|----------|----------|--------|--------|------|--------|--------|---|
| ___ | _ | _ | _ | _ | _ | _ | _ | _ | _ | … |
| ___ | _ | _ | _ | _ | _ | _ | _ | _ | _ | … |

### 10.3 Main control unit
- Inputs: (format bits + opcode bits) OR (full opcode)
- Outputs: your control signals

Deliverables:
- Truth table (rows = opcodes)
- Simplified boolean equations
- Logic diagram

### 10.4 ALU control unit
- Inputs: ALUOp bits + function/opcode bits
- Output: ALU select lines

Deliverables:
- Truth table
- Simplified boolean equations
- Logic diagram

### 10.5 ALU design
- Supported ops list
- Logic diagram (adder, logic ops, shifter, select mux)

---

## 11) Research table (free sources; videos are required)

> Use this table to collect references while designing. Add notes and timestamps.

| Area | Type | Resource | Link | What to extract | Notes / timestamps |
|------|------|----------|------|-----------------|-------------------|
| ISA overview | Video | What Is Instruction Set Architecture? (COA) | https://www.youtube.com/watch?v=6fgbLOL7bis | ISA elements, formats, opcode ideas | |
| Addressing modes | Video | Addressing Modes Part 1 | https://www.youtube.com/watch?v=M7nHnMEuQRY | immediate/direct/register/base/PC‑relative | |
| Addressing modes | Article | GeeksforGeeks Addressing Modes | https://www.geeksforgeeks.org/computer-organization-architecture/addressing-modes-1/ | definitions + examples | |
| ISA design slides | PDF | UCSD CSE141 ISA slides | https://cseweb.ucsd.edu/classes/su06/cse141/slides/s02-isa-1up.pdf | tradeoffs: length, operands, formats | |
| Single‑cycle datapath | Video | CS61C: Single‑Cycle CPU Datapath I | https://www.youtube.com/watch?v=YAMqWaTZy8k | datapath blocks + control signals | |
| Single‑cycle datapath | Video | Single Cycle Design – Computer Architecture | https://www.youtube.com/watch?v=1oTUjVozQgY | overview of single‑cycle | |
| Multi‑cycle datapath | Video | Multi‑Cycle lecture | https://www.youtube.com/watch?v=49zRKmEXAcE | state steps, control per cycle | |
| Addressing modes (deep) | Article | Wikipedia: Addressing mode | https://en.wikipedia.org/wiki/Addressing_mode | variants + PC relative details | |
| ISA reference | Article | Wikipedia: Instruction set architecture | https://en.wikipedia.org/wiki/Instruction_set_architecture | categories of instructions | |
| ISA glossary | Article | Arm glossary: ISA | https://www.arm.com/glossary/isa | concise definition | |

---

## 12) Common pitfalls (avoid losing marks)

- Don’t design an ISA that is “basically RISC‑V but renamed.” Keep your own formats/opcodes/field layouts.
- Don’t pick field widths that can’t encode the register count or immediate range you claim.
- Don’t forget to mark unused format codes / register codes.
- Don’t design datapath for instructions you never trace.
- Don’t trace instructions that your datapath cannot actually support.
- Don’t add too many instructions; keep it coherent.

---

## 13) Quick start (recommended plan for 1–2 days)

Day 1
- Freeze instruction length, register count/width, n‑address.
- Draft Table 1–3.
- Draft Table 4 (≥ 16 instructions).
- Draft field layouts for each format.

Day 2
- Finalize Table 5 encodings.
- Choose subset and draw datapath.
- Create Table 6 control signals.
- Trace one instruction per format.
- Build truth tables for control units + ALU control.

---

## 14) Your design log (write assumptions)

- Assumption 1: ______________________
- Assumption 2: ______________________
- Assumption 3: ______________________

---

**End of file.**
