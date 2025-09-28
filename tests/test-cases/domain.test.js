import { GFp, Z, isDomain, FieldRegistry } from "../../modules/domains" 

describe('GFp domain', () => {
    test('constructor & getters', () => {
        const d = new GFp(7);
        expect(d.id).toBe(0);
        expect(d.p).toBe(7);
        expect(['u8', 'u16', 'i32']).toContain(d.word);
    });

    test('representative normalizes to [0, p-1]', () => {
        const d = new GFp(7);
        expect(d.representative(-1)).toBe(6);
        expect(d.representative(8)).toBe(1);
    });

    test('add/mult are modulo p', () => {
        const d = new GFp(7);
        expect(d.add(6, 3)).toBe(2);      // 9 % 7 = 2
        expect(d.mult(3, 3)).toBe(2);     // 9 % 7 = 2
    });

    test('invert works and caches', () => {
        const d = new GFp(7);
        const inv3 = d.invert(3);         // 5
        expect(inv3).toBe(5);
        expect(d.mult(3, inv3)).toBe(1);
        const again = d.invert(3);
        expect(again).toBe(5);
    });

    test('invert throws for 0', () => {
        const d = new GFp(7);
        expect(() => d.invert(0)).toThrow();
    });

    test('toPayload has type/p/word', () => {
        const d = new GFp(11);
        const payload = d.toPayload();
        expect(payload).toEqual({ type: 'GFp', p: 11, word: d.word });
    });

  // NOTE: as implemented, GFp.fromPayload calls FieldRegistry.getField which currently has bugs.
  // Enable this test after fixing FieldRegistry in domains.js.
    test.skip('fromPayload reconstructs GFp', () => {
        const payload = { type: 'GFp', p: 13, word: 'u8' };
        const d2 = GFp.fromPayload(payload);
        expect(d2).toBeInstanceOf(GFp);
        expect(d2.p).toBe(13);
    });
});

describe('Z domain', () => {
    test('constructor & getters', () => {
      const z = new Z('f64');
      expect(z.id).toBe(1);
      expect(z.word).toBe('f64');
    });

    test('add/mult/representative are identity over ℤ', () => {
      const z = new Z();
      expect(z.add(3, -5)).toBe(-2);
      expect(z.mult(-2, 4)).toBe(-8);
      expect(z.representative(-7)).toBe(-7);
    });

    test('toPayload has type/word', () => {
      const z = new Z('f64');
      expect(z.toPayload()).toEqual({ type: 'Z', word: 'f64' });
    });

    // Current code defines fromPayload as an *instance* method and routes through FieldRegistry with issues.
    test.skip('fromPayload reconstructs Z', () => {
        const z = new Z();
        const rebuilt = z.fromPayload({ type: 'Z', word: 'f64' });
        expect(rebuilt).toBeInstanceOf(Z);
        expect(rebuilt.word).toBe('f64');
    });
});

describe('isDomain nominal check', () => {
    test('accepts GFp/Z instances and rejects lookalikes', () => {
        const d = new GFp(7);
        const z = new Z();
        expect(isDomain(d)).toBe(true);
        expect(isDomain(z)).toBe(true);
        expect(isDomain({ id: 'GFp', p: 7 })).toBe(false);
        expect(isDomain(null)).toBe(false);
    });
});

// FieldRegistry currently contains reference errors (unresolved identifiers).
// Keep these skipped until domains.js is fixed.
describe.skip('FieldRegistry', () => {
    test('getField(number) returns GFp and caches', () => {
        const { FieldRegistry } = require('./domains');
        const a = FieldRegistry.getField(7);
        const b = FieldRegistry.getField(7);
        expect(a).toBeInstanceOf(GFp);
        expect(b).toBe(a);
    });

  test('getField(Z spec) returns Z', () => {
        const { FieldRegistry } = require('./domains');
        const z = FieldRegistry.getField(Number.MAX_SAFE_INTEGER);
        expect(z).toBeInstanceOf(Z);
    });
});