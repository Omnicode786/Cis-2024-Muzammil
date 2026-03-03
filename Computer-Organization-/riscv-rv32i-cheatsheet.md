# RISC-V RV32I Instruction Cheat Sheet (Types + funct3/funct7)

This sheet covers the **RV32I base** instructions (the common “add/sub/lw/sw/beq…” set) and their encodings by type.

---

## Instruction formats (bit fields)

| Type | [31:25] | [24:20] | [19:15] | [14:12] | [11:7] | [6:0] |
|---|---|---|---|---|---|---|
| R | funct7 | rs2 | rs1 | funct3 | rd | opcode |
| I | imm[11:0] |  | rs1 | funct3 | rd | opcode |
| I* (shift-immediate) | funct7 | shamt[4:0] | rs1 | funct3 | rd | opcode |
| S | imm[11:5] | rs2 | rs1 | funct3 | imm[4:0] | opcode |
| B (aka SB-type) | imm[12|10:5] | rs2 | rs1 | funct3 | imm[4:1|11] | opcode |
| U | imm[31:12] |  |  |  | rd | opcode |
| J | imm[20|10:1|11|19:12] |  |  |  | rd | opcode |

---

## R-type (Register-Register ALU)

Format: `funct7 rs2 rs1 funct3 rd opcode`

| Instruction | Syntax | funct3 | funct7 |
|---|---|---:|---:|
| ADD | `add rd, rs1, rs2` | `000` | `0000000` |
| SUB | `sub rd, rs1, rs2` | `000` | `0100000` |
| AND | `and rd, rs1, rs2` | `111` | `0000000` |
| OR  | `or rd, rs1, rs2`  | `110` | `0000000` |
| XOR | `xor rd, rs1, rs2` | `100` | `0000000` |
| SLL | `sll rd, rs1, rs2` | `001` | `0000000` |
| SRL | `srl rd, rs1, rs2` | `101` | `0000000` |
| SRA | `sra rd, rs1, rs2` | `101` | `0100000` |
| SLT | `slt rd, rs1, rs2` | `010` | `0000000` |
| SLTU | `sltu rd, rs1, rs2` | `011` | `0000000` |

---

## I-type (Immediate ALU) + I* shifts

### I-type immediate ALU
Format: `imm[11:0] rs1 funct3 rd opcode`

| Instruction | Syntax | funct3 | funct7 |
|---|---|---:|---:|
| ADDI | `addi rd, rs1, imm` | `000` | `—` |
| ANDI | `andi rd, rs1, imm` | `111` | `—` |
| ORI  | `ori rd, rs1, imm`  | `110` | `—` |
| XORI | `xori rd, rs1, imm` | `100` | `—` |
| SLTI | `slti rd, rs1, imm` | `010` | `—` |
| SLTIU | `sltiu rd, rs1, imm` | `011` | `—` |

### I* shift-immediate ALU
Format: `funct7 shamt rs1 funct3 rd opcode`

| Instruction | Syntax | funct3 | funct7 |
|---|---|---:|---:|
| SLLI | `slli rd, rs1, shamt` | `001` | `0000000` |
| SRLI | `srli rd, rs1, shamt` | `101` | `0000000` |
| SRAI | `srai rd, rs1, shamt` | `101` | `0100000` |

---

## I-type (Loads)

Format: `imm[11:0] rs1 funct3 rd opcode`

| Instruction | Syntax | funct3 | funct7 |
|---|---|---:|---:|
| LB  | `lb rd, imm(rs1)`  | `000` | `—` |
| LH  | `lh rd, imm(rs1)`  | `001` | `—` |
| LW  | `lw rd, imm(rs1)`  | `010` | `—` |
| LBU | `lbu rd, imm(rs1)` | `100` | `—` |
| LHU | `lhu rd, imm(rs1)` | `101` | `—` |

---

## S-type (Stores)

Format: `imm[11:5] rs2 rs1 funct3 imm[4:0] opcode`

| Instruction | Syntax | funct3 | funct7 |
|---|---|---:|---:|
| SB | `sb rs2, imm(rs1)` | `000` | `—` |
| SH | `sh rs2, imm(rs1)` | `001` | `—` |
| SW | `sw rs2, imm(rs1)` | `010` | `—` |

---

## B-type (Branches / “SB-type”)

Format: `imm[12|10:5] rs2 rs1 funct3 imm[4:1|11] opcode`

| Instruction | Syntax | funct3 | funct7 |
|---|---|---:|---:|
| BEQ  | `beq rs1, rs2, label`  | `000` | `—` |
| BNE  | `bne rs1, rs2, label`  | `001` | `—` |
| BLT  | `blt rs1, rs2, label`  | `100` | `—` |
| BGE  | `bge rs1, rs2, label`  | `101` | `—` |
| BLTU | `bltu rs1, rs2, label` | `110` | `—` |
| BGEU | `bgeu rs1, rs2, label` | `111` | `—` |

---

## U-type (Upper immediate)

Format: `imm[31:12] rd opcode`

| Instruction | Syntax | funct3 | funct7 |
|---|---|---:|---:|
| LUI | `lui rd, immu` | `—` | `—` |
| AUIPC | `auipc rd, immu` | `—` | `—` |

---

## J-type and control transfer

### J-type: JAL
Format: `imm[...] rd opcode`

| Instruction | Syntax | funct3 | funct7 |
|---|---|---:|---:|
| JAL | `jal rd, label` | `—` | `—` |

### I-type: JALR
Format: `imm[11:0] rs1 funct3 rd opcode`

| Instruction | Syntax | funct3 | funct7 |
|---|---|---:|---:|
| JALR | `jalr rd, rs1, imm` | `000` | `—` |

---

## SYSTEM “other” (RV32I basics)

These are encoded as I-type with opcode `1110011` and funct3 `000` in RV32I.

| Instruction | Syntax | Type | funct3 | funct7 |
|---|---|---|---:|---:|
| ECALL | `ecall` | I | `000` | `—` |
| EBREAK | `ebreak` | I | `000` | `—` |
