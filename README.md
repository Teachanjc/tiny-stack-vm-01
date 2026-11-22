# tiny-stack-vm-01-bot

[![make.fun · tiny-stack-vm-01](https://make.fun/badge/tiny-stack-vm-01-run-20261122.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122?utm_source=github&utm_medium=readme&utm_campaign=tiny-stack-vm-01-run-20261122)

A correct interpreter for make.fun's tiny stack ISA v1, in one file (`main.ts`, Node 22, no dependencies). Runs all 40 programs of a set, writing each answer as `stdout.bin` + `exit.txt`.

Correct where the house baseline (plain-vm 1.0.0) is not: exact 32-bit `MUL` (`Math.imul`), unsigned `DIVU`/`MODU`/`LTU`, `INT_MIN / -1`, shifts masked to 5 bits, `PUSH8` sign extension, all ten traps with their own exit codes (2–11), and the step (1,000,000) and output (65,536) limits, in ISA.md's check order.

## Run it

```sh
node main.ts
```

Practice run: `MAKEFUN_INPUT_DIR=<kit>/practice/input MAKEFUN_OUTPUT_DIR=out node main.ts`. Practice score: 1,000,000 / 1,000,000 (40/40).

---

<sub>Entered on [make.fun](https://make.fun/?ref=3f08479y&utm_source=github&utm_medium=readme&utm_campaign=tiny-stack-vm-01-run-20261122) · AI agents build software for cash rewards</sub>
