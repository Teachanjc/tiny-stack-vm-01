import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const SPEC = {
  0: [0, 0, 0], 1: [1, 0, 1], 2: [4, 0, 1], 3: [0, 1, 0], 4: [0, 1, 2],
  5: [0, 2, 2], 6: [0, 2, 3], 7: [0, 3, 3],
  16: [0, 2, 1], 17: [0, 2, 1], 18: [0, 2, 1], 19: [0, 2, 1],
  20: [0, 2, 1], 21: [0, 2, 1], 22: [0, 2, 1], 23: [0, 1, 1],
  24: [0, 2, 1], 25: [0, 2, 1], 26: [0, 2, 1], 27: [0, 1, 1],
  28: [0, 2, 1], 29: [0, 2, 1], 30: [0, 2, 1], 32: [0, 2, 1],
  33: [0, 2, 1], 34: [0, 2, 1],
  48: [2, 0, 0], 49: [2, 1, 0], 50: [2, 1, 0], 51: [2, 0, 0], 52: [0, 0, 0],
  64: [0, 1, 1], 65: [0, 2, 0],
  80: [0, 1, 0], 81: [0, 1, 0], 82: [0, 0, 1], 83: [0, 1, 0],
};

function run(prog, input) {
  const end = prog.length;
  const stack = new Int32Array(256);
  const calls = new Int32Array(64);
  const mem = new Int32Array(256);
  const buf = new Uint8Array(65536);
  let top = 0;
  let ctop = 0;
  let written = 0;
  let read = 0;
  let pc = 0;
  let steps = 0;
  const finish = (code) => ({ bytes: buf.slice(0, written), code });
  for (;;) {
    if (steps === 1000000) return finish(10);
    if (pc < 0 || pc >= end) return finish(9);
    const opcode = prog[pc];
    const spec = SPEC[opcode];
    if (spec === undefined) return finish(5);
    const [imm, pops, pushes] = spec;
    if (pc + imm >= end) return finish(9);
    steps++;
    if (top < pops) return finish(2);
    if (top - pops + pushes > 256) return finish(3);
    const after = pc + 1 + imm;
    pc = after;
    if (opcode === 0) return finish(0);
    if (opcode === 1) { stack[top++] = (prog[after - 1] << 24) >> 24; continue; }
    if (opcode === 2) { stack[top++] = prog[after - 4] | (prog[after - 3] << 8) | (prog[after - 2] << 16) | (prog[after - 1] << 24); continue; }
    if (opcode === 3) { top--; continue; }
    if (opcode === 4) { stack[top] = stack[top - 1]; top++; continue; }
    if (opcode === 5) { const t = stack[top - 1]; stack[top - 1] = stack[top - 2]; stack[top - 2] = t; continue; }
    if (opcode === 6) { stack[top] = stack[top - 2]; top++; continue; }
    if (opcode === 7) { const a = stack[top - 3]; stack[top - 3] = stack[top - 2]; stack[top - 2] = stack[top - 1]; stack[top - 1] = a; continue; }
    if (opcode === 23) { stack[top - 1] = -stack[top - 1] | 0; continue; }
    if (opcode === 27) { stack[top - 1] = ~stack[top - 1]; continue; }
    if (opcode === 48 || opcode === 49 || opcode === 50) {
      const rel = ((prog[after - 2] | (prog[after - 1] << 8)) << 16) >> 16;
      let take = opcode === 48;
      if (!take) { const v = stack[--top]; take = opcode === 49 ? v === 0 : v !== 0; }
      if (take) pc = after + rel;
      continue;
    }
    if (opcode === 51) {
      if (ctop === 64) return finish(7);
      calls[ctop++] = after;
      pc = prog[after - 2] | (prog[after - 1] << 8);
      continue;
    }
    if (opcode === 52) {
      if (ctop === 0) return finish(8);
      pc = calls[--ctop];
      continue;
    }
    if (opcode === 64) {
      const a = stack[top - 1];
      if (a < 0 || a > 255) return finish(6);
      stack[top - 1] = mem[a];
      continue;
    }
    if (opcode === 65) {
      const a = stack[top - 1];
      const v = stack[top - 2];
      if (a < 0 || a > 255) return finish(6);
      top -= 2;
      mem[a] = v;
      continue;
    }
    if (opcode === 80) {
      const text = String(stack[top - 1]);
      if (written + text.length > 65536) return finish(11);
      top--;
      for (let i = 0; i < text.length; i++) buf[written++] = text.charCodeAt(i);
      continue;
    }
    if (opcode === 81) {
      if (written + 1 > 65536) return finish(11);
      buf[written++] = stack[--top] & 255;
      continue;
    }
    if (opcode === 82) { stack[top++] = read < input.length ? input[read++] : -1; continue; }
    if (opcode === 83) return finish(stack[--top] & 255);
    const b = stack[top - 1];
    const a = stack[top - 2];
    let r;
    if (opcode === 16) r = (a + b) | 0;
    else if (opcode === 17) r = (a - b) | 0;
    else if (opcode === 18) r = Math.imul(a, b);
    else if (opcode === 19) {
      if (b === 0) return finish(4);
      r = a === -2147483648 && b === -1 ? a : (a / b) | 0;
    } else if (opcode === 20) {
      if (b === 0) return finish(4);
      r = b === -1 ? 0 : (a % b) | 0;
    } else if (opcode === 21) {
      if (b === 0) return finish(4);
      r = Math.floor((a >>> 0) / (b >>> 0)) | 0;
    } else if (opcode === 22) {
      if (b === 0) return finish(4);
      r = ((a >>> 0) % (b >>> 0)) | 0;
    } else if (opcode === 24) r = a & b;
    else if (opcode === 25) r = a | b;
    else if (opcode === 26) r = a ^ b;
    else if (opcode === 28) r = a << (b & 31);
    else if (opcode === 29) r = a >> (b & 31);
    else if (opcode === 30) r = (a >>> (b & 31)) | 0;
    else if (opcode === 32) r = a === b ? 1 : 0;
    else if (opcode === 33) r = a < b ? 1 : 0;
    else r = (a >>> 0) < (b >>> 0) ? 1 : 0;
    top -= 2;
    stack[top++] = r;
  }
}

const IN = process.env.MAKEFUN_INPUT_DIR ?? '/input';
const OUT = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
for (const id of readdirSync(IN).sort()) {
  const dir = join(IN, id);
  const result = run(new Uint8Array(readFileSync(join(dir, 'program.bin'))), new Uint8Array(readFileSync(join(dir, 'input.bin'))));
  mkdirSync(join(OUT, id), { recursive: true });
  writeFileSync(join(OUT, id, 'stdout.bin'), result.bytes);
  writeFileSync(join(OUT, id, 'exit.txt'), result.code + '\n');
}
