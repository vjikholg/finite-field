// bytematrix.test.js
import { GFp, Z } from "../../modules/domains.js" ;
import { ByteMatrix, fromArray, unsafeFromArray, index } from "../../modules/bytematrix.js";

function makeBM(pOrZ, rows, cols, values) {
  	const M = new ByteMatrix({ rows, cols, p: pOrZ });
  		  let idx = 0;
  		  for (let i = 0; i < rows; i++)
  		  	  for (let j = 0; j < cols; j++)
  		    	    M.set(i, j, values[idx++]);
  	return M;
}

describe('ByteMatrix: constructor & getters', () => {
  	test('GF(p) domain wiring and shape', () => {
  	  	const A = new ByteMatrix({ rows: 2, cols: 3, p: 7 });
  	  	expect(A.rows).toBe(2);
  	  	expect(A.cols).toBe(3);
  	  	expect(A.domain).toBeInstanceOf(GFp);
  	  	expect(A.domain.p).toBe(7);
  	  	expect(A.view.length).toBe(6);
  	});
  	test('Z domain wiring via sentinel', () => {
  	  	const A = new ByteMatrix({ rows: 1, cols: 2, p: Number.MAX_SAFE_INTEGER });
  	  	expect(A.domain).toBeInstanceOf(Z);
  	  	expect(A.view.length).toBe(2);
  	});
});

describe('index / unsafeIndex / get / set', () => {
  	test('index bounds and mapping', () => {
  	 	  const A = new ByteMatrix({ rows: 2, cols: 2, p: 7 });
  	 	  expect(A.index(0, 0)).toBe(0);
  	 	  expect(A.index(1, 1)).toBe(3);
  	 	  expect(() => A.index(2, 0)).toThrow();
  	 	  expect(() => A.index(0, 2)).toThrow();
  	});
  	test('set uses representative, get returns stored value', () => {
  	  	const A = new ByteMatrix({ rows: 2, cols: 2, p: 7 });
  	  	A.set(1, 1, -1);
  	  	expect(A.get(1, 1)).toBe(6);
  	  	A.set(0, 1, 15);
  	  	expect(A.get(0, 1)).toBe(1);
  	});
});

describe('key (stable & content-sensitive)', () => {
  	test('same contents/domain yield the same key; change flips key', () => {
  	  	const A = makeBM(7, 2, 2, [1, 2, 3, 4]);
  	  	const B = makeBM(7, 2, 2, [1, 2, 3, 4]);
  	  	const k1 = A.key;
  	  	const k2 = B.key;
  	  	expect(typeof k1).toBe('number'); // cyrb53 returns a number
  	  	expect(k2).toBe(k1);
		
  	  	B.set(0, 0, 2);
  	  	const k3 = B.key;
  	  	expect(k3).not.toBe(k2);
  	});
});

describe('mult', () => {
  test('GF(p): identity · M = M (mod p)', () => {
    const p = 7;
    const I = makeBM(p, 2, 2, [1, 0, 0, 1]);
    const M = makeBM(p, 2, 2, [6, 3, 4, 5]); // values reduced mod 7 on write
    const C = I.mult(M);
    for (let i = 0; i < 2; i++)
      for (let j = 0; j < 2; j++)
        expect(C.get(i, j)).toBe(M.get(i, j));
  });

  test('ℤ: small multiply 2x3 · 3x2', () => {
    const z = Number.MAX_SAFE_INTEGER;
    const A = makeBM(z, 2, 3, [1, 2, 3, 4, 5, 6]);
    const B = makeBM(z, 3, 2, [7, 8, 9, 10, 11, 12]);
    const C = A.mult(B);
    expect(C.rows).toBe(2);
    expect(C.cols).toBe(2);
    expect(C.get(0, 0)).toBe(1 * 7 + 2 * 9 + 3 * 11);
    expect(C.get(0, 1)).toBe(1 * 8 + 2 * 10 + 3 * 12);
    expect(C.get(1, 0)).toBe(4 * 7 + 5 * 9 + 6 * 11);
    expect(C.get(1, 1)).toBe(4 * 8 + 5 * 10 + 6 * 12);
  });

  test('throws on dimension or domain mismatch', () => {
    const A = new ByteMatrix({ rows: 2, cols: 3, p: 7 });
    const B = new ByteMatrix({ rows: 2, cols: 2, p: 7 });
    expect(() => A.mult(B)).toThrow();

    const C = new ByteMatrix({ rows: 2, cols: 2, p: 7 });
    const D = new ByteMatrix({ rows: 2, cols: 2, p: Number.MAX_SAFE_INTEGER });
    expect(() => C.mult(D)).toThrow();
  });
});

describe('subMatrix & transpose', () => {
    test('subMatrix removes row/col', () => {
        const M = makeBM(7, 3, 3, [
            1, 2, 3,
            4, 5, 6,
            7, 8, 9
        ]);
        const S = M.subMatrix(0, 0);
        expect(S.rows).toBe(2);
        expect(S.cols).toBe(2);
        // Entries reduced mod 7
        expect(S.get(0, 0)).toBe(5 % 7);
        expect(S.get(0, 1)).toBe(6 % 7);
        expect(S.get(1, 0)).toBe(8 % 7);
        expect(S.get(1, 1)).toBe(9 % 7);
    });

  test('transpose swaps rows/cols and positions', () => {
    const M = makeBM(7, 2, 3, [1, 2, 3, 4, 5, 6]);
    const T = M.transpose();
    expect(T.rows).toBe(3);
    expect(T.cols).toBe(2);
    expect(T.get(0, 0)).toBe(1);
    expect(T.get(0, 1)).toBe(4);
    expect(T.get(1, 0)).toBe(2);
    expect(T.get(1, 1)).toBe(5);
    expect(T.get(2, 0)).toBe(3);
    expect(T.get(2, 1)).toBe(6);
  });
});

describe('determinant', () => {
  test('GF(p) 2x2: det([[a,b],[c,d]]) = ad - bc (mod p)', () => {
    const p = 7;
    const M = makeBM(p, 2, 2, [3, 4, 5, 6]);
    const det = M.det(); // (18 - 20) % 7 = -2 % 7 = 5
    expect(det).toBe(5);
  });

  test('ℤ 2x2: det over integers', () => {
    const z = Number.MAX_SAFE_INTEGER;
    const M = makeBM(z, 2, 2, [3, 4, 5, 6]);
    expect(M.det()).toBe(-2);
  });

  test('throws on non-square', () => {
    const M = makeBM(7, 2, 3, [1,2,3,4,5,6]);
    expect(() => M.det()).toThrow();
  });
});

describe('cofactor / adjugate', () => {
  test('cofactor for 2x2 GF(p)', () => {
    const p = 7;
    // [[a,b],[c,d]] => cofactor = [[d, -c], [-b, a]] (mod p)
    const a=1,b=2,c=3,d=4;
    const M = makeBM(p, 2, 2, [a,b,c,d]);
    const C = M.cofactor();
    expect(C.get(0,0)).toBe(d % p);
    expect(C.get(0,1)).toBe((p - (c % p)) % p);
    expect(C.get(1,0)).toBe((p - (b % p)) % p);
    expect(C.get(1,1)).toBe(a % p);
  });
// 
  test('adjugate equals transpose(cofactor)', () => {
    const M = makeBM(7, 2, 2, [1, 2, 3, 4]);
    const Adj = M.adjugate();
    const C = M.cofactor().transpose();
    for (let i = 0; i < 2; i++)
      for (let j = 0; j < 2; j++)
        expect(Adj.get(i, j)).toBe(C.get(i, j));
  });
// 
  test('3x3 adjugate equals transpose(cofactor)', () => {
    const M = makeBM(13,3,3,[1,2,3,4,5,6,7,8,9]); 
    const Adj = M.adjugate();
    console.log(`this is Adj.view: ${Adj.view}`);
    const sol = [10, 6, 10, 6, 1, 6, 10, 6, 10];
    for (let i = 0; i < 3; i++) 
      for(let j = 0; j < 3; j++)
        expect(Adj.get(i,j)).toBe(sol[Adj.unsafeIndex(i,j)])
  })

    test('4x4 adjugate equals transpose(cofactor)', () => {
    const M = makeBM(13,4,4,[3,4,5,2,4,5,6,1,2,4,7,8,1,6,9,2]); 
    const Adj = M.adjugate();
    console.log(`this is Adj.view: ${Adj.view}`);
    const sol = [9,5,10,7,2,11,5,5,11,10,9,0,5,4,11,12];
    for (let i = 0; i < 4; i++) 
      for(let j = 0; j < 4; j++)
        expect(Adj.get(i,j)).toBe(sol[Adj.unsafeIndex(i,j)])
  })
});

describe('inverse', () => {
    test('GF(p): inv(identity) = identity', () => {
        const p = 11;
        const I = makeBM(p, 3, 3, [
            1,0,0,
            0,1,0,
            0,0,1
        ]);
        const Inv = I.invert();
        for (let i = 0; i < 3; i++)
            for (let j = 0; j < 3; j++)
                expect(Inv.get(i,j)).toBe(I.get(i,j));
    });

  test('GF(p): random 2x2 · inv = identity (mod p)', () => {
        const p = 17;
        const M = makeBM(p, 2, 2, [5, 7, 2, 3]); // det = 5*3 - 7*2 = 1 ≠ 0 (mod 17)
        const Minv = M.invert();
        const I = M.mult(Minv);
        expect(I.get(0,0)).toBe(1);
        expect(I.get(0,1)).toBe(0);
        expect(I.get(1,0)).toBe(0);
        expect(I.get(1,1)).toBe(1);
  });

  test('ℤ: unimodular 2x2 inverse exists; otherwise throws', () => {
       const z = Number.MAX_SAFE_INTEGER;
       const U = makeBM(z, 2, 2, [0, 1, -1, 0]); // det = 1
       const Uinv = U.invert();

 	    console.log(U.view); 
 	    console.log(Uinv.view)
       // Should be [[0,-1],[1,0]]
       expect(Uinv.get(0,0)).toBe(0);
       expect(Uinv.get(0,1)).toBe(-1);
       expect(Uinv.get(1,0)).toBe(1);
       expect(Uinv.get(1,1)).toBe(0);

       const N = makeBM(z, 2, 2, [2, 0, 0, 2]); // det = 4
       expect(() => N.invert()).toThrow();
   });
});

describe('fromArray / unsafeFromArray', () => {
    test('fromArray builds an immutable matrix with correct contents', () => {
        const M = fromArray([[1,2],[3,4]], 7, 2, 2);
		    console.log("this is:"); 
        console.log(M.view);
        console.log(JSON.stringify(M));
        expect(M.rows).toBe(2);
        expect(M.cols).toBe(2);
        expect(M.get(0,0)).toBe(1);
        expect(Object.isFrozen(M)).toBe(true);
    });
});