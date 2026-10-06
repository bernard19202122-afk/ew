/**
 * Elemental Wildguard - PCG32 Deterministic RNG
 * Implements PCG-XSH-RR (Permuted Congruential Generator 32-bit output from 64-bit state)
 * Fully serializable and reproducible according to PRD v2.2 Section A8.
 */

export interface RNGSnapshot {
  seed: string;
  state: string;
  inc: string;
  invocations: number;
}

export class PCG32 {
  private state: bigint;
  private inc: bigint;
  private initialSeed: bigint;
  private invocations: number = 0;

  // Multiplier for 64-bit LCG from PCG reference
  private static readonly MULTIPLIER = 6364136223846793005n;
  private static readonly MASK64 = 0xffffffffffffffffn;

  constructor(seed: bigint | number = 42n, sequence: bigint | number = 54n) {
    const s = BigInt(seed);
    const seq = BigInt(sequence);
    this.initialSeed = s;
    this.state = 0n;
    // inc must be odd
    this.inc = ((seq << 1n) | 1n) & PCG32.MASK64;
    this.step();
    this.state = (this.state + s) & PCG32.MASK64;
    this.step();
    this.invocations = 0;
  }

  private step(): void {
    this.state = (this.state * PCG32.MULTIPLIER + this.inc) & PCG32.MASK64;
  }

  /**
   * Generates a 32-bit unsigned integer deterministically.
   */
  public nextUint32(): number {
    this.invocations++;
    const oldState = this.state;
    this.step();

    // XSH RR: xorshift high bits, random rotate
    const xorshifted = Number(((oldState >> 18n) ^ oldState) >> 27n) >>> 0;
    const rot = Number(oldState >> 59n) & 31;
    return ((xorshifted >>> rot) | (xorshifted << ((-rot) & 31))) >>> 0;
  }

  /**
   * Returns a deterministic float in [0, 1).
   */
  public nextFloat(): number {
    return this.nextUint32() / 4294967296.0;
  }

  /**
   * Returns a deterministic integer in range [min, max] (inclusive).
   */
  public nextInt(min: number, max: number): number {
    if (min >= max) return min;
    const range = max - min + 1;
    return min + (this.nextUint32() % range);
  }

  /**
   * Selects an item from an array using deterministic RNG.
   * Assumes elements are pre-sorted if ordering matters (Section A8: sort by entityID ascending).
   */
  public nextChoice<T>(items: readonly T[]): T {
    if (items.length === 0) {
      throw new Error("Cannot choose from empty array");
    }
    const idx = this.nextInt(0, items.length - 1);
    return items[idx];
  }

  /**
   * Tests whether an event with given probability (0 to 1) procs.
   */
  public testChance(probability: number): boolean {
    if (probability <= 0) return false;
    if (probability >= 1) return true;
    return this.nextFloat() < probability;
  }

  public getInvocations(): number {
    return this.invocations;
  }

  public snapshot(): RNGSnapshot {
    return {
      seed: this.initialSeed.toString(),
      state: this.state.toString(),
      inc: this.inc.toString(),
      invocations: this.invocations,
    };
  }

  public restore(snapshot: RNGSnapshot): void {
    this.initialSeed = BigInt(snapshot.seed);
    this.state = BigInt(snapshot.state);
    this.inc = BigInt(snapshot.inc);
    this.invocations = snapshot.invocations;
  }
}
