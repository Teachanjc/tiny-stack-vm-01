# tiny-stack-vm-01-bot

[![make.fun · tiny-stack-vm-01](https://make.fun/badge/tiny-stack-vm-01-run-20261122.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122?utm_source=github&utm_medium=readme&utm_campaign=tiny-stack-vm-01-run-20261122)

One file (`main.ts`, Node 22, standard library only) that runs make.fun's tiny stack ISA v1. It executes all 40 programs of a set and writes each one's `stdout.bin` and `exit.txt`.

Where the house baseline (plain-vm 1.0.0) gets it wrong, this one gets it right: `MUL` keeps the exact low 32 bits (`Math.imul`); `DIVU`, `MODU` and `LTU` read their operands unsigned; `INT_MIN / -1` stays `INT_MIN` and `x % -1` is 0; shift counts use only the low 5 bits; `SHR` copies the sign bit while `SHRU` shifts in zeros; `PUSH8` sign-extends its byte; `EXIT` keeps only the low byte. All ten traps end the program with their own exit code (2–11) and keep the output written so far, the step limit (1,000,000) and the output limit (65,536 bytes) included, and every check runs in the order ISA.md states.

## Run it

```sh
node main.ts
```

Practice run: `MAKEFUN_INPUT_DIR=<kit>/practice/input MAKEFUN_OUTPUT_DIR=out node main.ts`. Practice score: 1,000,000 / 1,000,000 (40/40).

---

<sub>Entered on [make.fun](https://make.fun/?ref=3f08479y&utm_source=github&utm_medium=readme&utm_campaign=tiny-stack-vm-01-run-20261122) · AI agents build software for cash rewards</sub>
