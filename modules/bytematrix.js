import { FieldRegistry } from "./domains";
import { cyrb53 } from "./helpers/hashcode";

export function byteWidth(word) { 
    if (word === 'u8') return 1; 
    if (word === 'u16') return 2; 
    if (word === 'i32') return 4; 
    if (word === 'f32') return 4; // easy way to add reals/rationals 
    throw new Error(`${word} is an invalid/unknown word`); 
}

export function makeView(buffer, word) {
    if (word === 'u8') return new Uint8Array(buffer); 
    if (word === 'u16') return new Uint16Array(buffer); 
    if (word === 'i32') return new Int32Array(buffer);
    if (word === 'f32') return new Float32Array(buffer);
    throw new Error(`${word} is an invalid/unknown word`); 
}



export class ByteMatrix {
    #rows; #cols; #domain; #buffer; #view; #key; #dirty; #len;
    
    constructor({rows, cols, p, buffer}) { 
        this.#rows = rows, 
        this.#cols = cols || rows; 
        this.#domain = FieldRegistry.getField(p); 
        this.#len = rows * cols || rows * rows; 
        const bw = byteWidth(this.#domain.word)
        this.#buffer = buffer ?? new ArrayBuffer(this.#len * bw); 
        this.#view = makeView(this.#buffer, this.#domain.word); 
        this.#key = null; // make sure when grab key, use .key, not .#key
        this.#dirty = true;
        for (const [key, value] of Object.entries(this)) {
            // console.log(`${key}, ${value}`);
        }
    }

    get length() {return this.#len}
    get rows() {return this.#rows;}
    get cols() {return this.#cols;}
    get domain() {return this.#domain}
    get view() {return this.#view} // DANGEROUS MUTABLE REF

    static square(n, domain) {
        return new ByteMatrix({rows: n, cols: n, domain: this.domain.p});
    }

    static fromPayload(payload) {
        const dom = FieldRegistry.get(payload.domain.p);  
        return new ByteMatrix({
            rows: payload.rows, 
            cols: payload.cols, 
            domain: dom, 
            buffer: payload.buffer})
    }

    toPayload() {
        const dom = this.#domain.toPayload();
        return {rows: this.#rows, cols: this.#cols, domain: dom, buffer: this.#buffer}; 
    }

    index(i,j) {
        if (i < 0 || i >= this.#rows || j < 0 || j >= this.#cols) throw new Error(`Index out of range: ${i}, ${j}`); 
        return i * this.#cols + j;
    }

    unsafeIndex(i,j) {
        return i * this.#cols + j;
    }

    get(i, j) {
        return this.#view[this.index(i,j)];
    }

    set(i,j,n) { 
        if (i < 0 || i >= this.#rows || j < 0 || j >= this.#cols) throw new Error(`Index out of range: ${i}, ${j}`); 
        n = this.#domain.representative(n);
        this.#view[this.index(i,j)] = n; 
        this.#dirty = true;
        return true; 
    } 

    get key() {
        if (this.#key !== null && !this.#dirty) return this.#key; 
        const meta = (this.#domain.id === 0) ? `GF(${this.#domain.p})` : 'Z';
        const head = `${meta}:${this.#rows}x${this.cols}`;
        const bytes = this.#view;
        
        this.#key = cyrb53(head + Array.from(bytes).join(","));
        this.#dirty = false;   
        // // console.log(`${this.#key}, from matrix: ${this.#view} with head: ${head + Array.from(bytes).join(",")}, where bytes is: ${bytes}`); 
        return this.#key;
    }

    mult(mtx) { 
        if(this.#cols !== mtx.#rows) throw new Error(`Dimensional mismatch: A rows: ${this.#rows}, mtx cols: ${mtx.#cols}`); 
        if(this.#domain.id !== mtx.#domain.id) throw new Error(`Domain mismatch: A: ${this.#domain.id}, mtx:${mtx.domain.id}`);
        if(this.#domain.id === 0 && this.#domain.p !== mtx.#domain.p) throw new Error(`p-Domain mismatch: A:${this.domain.p},  mtx:${mtx.domain.p}`)
        
        const n  = this.#rows, m = this.#cols, k = mtx.#cols; 
        const out = new ByteMatrix({rows: n, cols: k, p: this.#domain.p})
        const A = this.#view, mtxView = mtx.#view, outView = out.#view

        if (this.#domain.id === 0) { 
            for (let i = 0; i < n; i++) { 
                const io = i*k; 
                const ia = i*m; 
                
                for(let j = 0 ; j < k; j++) {
                    let s = 0; 
                    
                    for (let t = 0; t < m; t++) {
                        s += (A[ia + t] * mtxView[t*k + j]); 
                        outView[io + j] = this.#domain.representative(s); 
                    }
                }
            }
        } else { // Z 
            for (let i = 0; i < n; i++ ) { 
                const io = i*k; 
                const ia = i*m; 
                for (let j = 0 ; j < k; j++) { 
                    let s = 0; 
                    for (let t = 0; t < m; t++) {
                        s += A[ia + t] * mtxView[t*k + j]
                        outView[io + j] = s; 
                    }
                }
            }
        }
        out.#dirty = true; out.#key = null; 
        return out;
   }

    subMatrix(row, column) { 
        let sol = new ByteMatrix({rows: this.#rows-1, cols: this.#cols-1, p: this.#domain.p})
        for (let i = 0, si = 0; i < this.rows; i++) {
            if (i === row) continue; 
            for (let j = 0, sj = 0; j < this.cols; j++) {
                if (j === column) continue; 
                sol.#view[sol.unsafeIndex(si, sj)] = this.#view[this.unsafeIndex(i,j)];
                sj++;
            }
            si++;
        }
        // if (sol.#view.length === 4) // console.log(sol.#view)
        return sol; 
    }

    transpose() {
        if (this.#rows === 1 && this.#cols === 1) return this; 
        
        const view = this.#view;
        let sol = new ByteMatrix({rows: this.#cols, cols: this.#rows, p: this.#domain.p}); 

        for (let i = 0; i < sol.#rows; i++) {
            for (let j = 0; j < sol.#cols; j++) { 
                sol.#view[sol.unsafeIndex(i,j)] = view[this.unsafeIndex(j,i)];
            }
        }
        return sol; 
    }

    det() {
        if (this.#rows !== this.#cols) throw new Error(`Non-square matrix!: ${this.#view}`)
        //if (DeterminantCache.has(this.key)) return DeterminantCache.get(this.key)
        if (this.#domain.id === 0) return this.#detGFp(); 
        if (this.#domain.id === 1) return this.#detZ(); 
        throw new Error(`Cannot take determinant from: ${typeof(this)}`);
    }

    #detZ() {
        const n = this.#len;
        // // console.log(`length of our view is: ${n}`);
        if (n === 1) return this.#view[0];
        
        const view = this.#view
        if (n === 4) {
            return (view[0]*view[3] - view[1]*view[2])
        } 

        let sol = 0; 
        for (let i = 0; i < this.#cols; i++) {
            sol += view[i] * this.subMatrix(0, i).#detZ() * ((-1) ** i);
        }
        DeterminantCache.set(this.key, sol);
        return sol; 
    }

    #detGFp() {
        const n = this.#len;
        if (n === 1) return this.#view[0];
        
        const view = this.#view
        if (n === 4) return this.domain.representative(view[0]*view[3] - view[1]*view[2])

        let sol = 0; 
        for (let i = 0; i < this.#cols; i++) {
            const pivot = view[i];
            if (pivot === 0) continue;
            const minorDet = this.subMatrix(0, i).det();
            const sign = (i % 2 === 0) ? 1 : this.#domain.representative(-1);
            const term = this.#domain.mult(pivot, minorDet);
            const signedTerm = this.#domain.mult(sign, term);
            sol = this.#domain.add(sol, signedTerm);
        }
        DeterminantCache.set(this.key, this.domain.representative(sol));
        return this.#domain.representative(sol);
    }

    cofactor() { 
        if (this.#rows !== this.cols) throw new Error(`Non square matrix: ${this.#view}`);
        if (this.#len === 1) return this; 
        
        let sol = new ByteMatrix({rows: this.#rows, cols: this.#cols, p: this.#domain.p})
        for (let i = 0 ; i < sol.#rows; i++ ) {
            for (let j = 0; j < sol.#cols; j++) { 
                const Mij = this.subMatrix(i,j); 
                const det = Mij.det(); 
                const val = ((i + j) % 2 === 0) ? det : this.#domain.representative(-det); // implemented in both Z and GFp  
                // console.log(`at index ${i}, ${j} we have determinant ${det} yielding value: ${val}`);
                sol.#view[sol.unsafeIndex(i,j)] = this.#domain.representative(val);
            }
        }
        return sol; 
    }

    adjugate() { 
        return this.cofactor().transpose();
    }

    invert() {
        if (InverseCache.has(this.#key)) return InverseCache.get(this.key);    
        let sol = undefined;
        if (this.#domain.id === 0) sol = this.#invGFp();
        else if (this.#domain.id === 1) sol = this.#invZ();
        
        if (!sol) throw new Error(`Cannot take the inverse of: ${typeof(this)}`)
        InverseCache.set(this.key, sol);
        return sol; 
    }

    #invGFp() {
        if (this.#rows !== this.cols) throw new Error(`Non square matrix: ${this.#view}`);
        const det = this.det();
        const adj = this.adjugate();
        const view = adj.#view
        const invdet = this.#domain.invert(det);
        // console.log(`det: ${det}, adj: ${view}, invdet: ${invdet}`);
        let sol = new ByteMatrix({rows: this.#rows, cols: this.#cols, p: this.#domain.p})
    
        for (let i = 0; i < this.#len; i++) {
            sol.#view[i] = this.#domain.representative(view[i] * invdet); 
        }

        return sol;
    }

    #invZ() {
        if (this.#rows !== this.cols) throw new Error(`Non square matrix: ${this.#view}`);
        const det = this.det(); 
        if (Math.abs(det) !== 1) throw new Error(`Z-matrix non-invertible: det ${det}`);
        
        const adj = this.adjugate(); 
        const view = adj.#view
        const invdet = parseFloat(1/parseFloat(det)) 
        let sol = new ByteMatrix({rows: this.#rows, cols: this.#cols, p: this.#domain.p})
        for (let i = 0; i < this.#len; i++) {
            sol.#view[i] = view[i] * invdet; 
        }
        return sol;
    }

    equal(mtx) { 
        if (this.#cols !== mtx.#cols || this.#rows !== mtx.#rows || this.#domain.p !== mtx.#domain.p) return false; 
        for (let i = 0 ; i < this.#view.length ; i++) if (this.#view[i] !== mtx.#view[i]) return false
        return true; 
    }
}

export function fromArray(arr, p, row, col) {
    if (arr.length < 0) throw new Error(`arr: ${arr} empty array`);
    const dom = FieldRegistry.getField(p); 
    let view = makeView(arr.flat(), dom.word);
    let temp = new ByteMatrix({rows:row, cols:col, p: p, buffer: view});
    Object.freeze(temp);
    return temp; 
}

export function unsafeFromArray(arr, p, row, col) {
    if (arr.length < 0) throw new Error(`arr: ${arr} empty array`);
    const dom = FieldRegistry.getField(p); 
    let view = makeView(arr.flat(), dom.word);
    let temp = new ByteMatrix({rows:row, cols:col, p: p, buffer: view});
    return temp; 
}

export const InverseCache = { 
    inverses: new Map(),
    get(key) {
        return this.inverses.get(key)
    },
    set(key, mtx) {
        this.inverses.set(key, mtx);
    },
    has(key) {
        return this.inverses.has(key);
    }
}

export function makeBM(pOrZ, rows, cols, values) {
  	const M = new ByteMatrix({ rows, cols, p: pOrZ });
  		  let idx = 0;
  		  for (let i = 0; i < rows; i++)
  		  	  for (let j = 0; j < cols; j++)
  		    	    M.set(i, j, values[idx++]);
  	return M;
}

export function makeIdentity({order, dims}) {
    const M = new ByteMatrix({ rows: dims, p: order });
    for (let i = 0; i < dims; i++) { 
  	    M.set(i, i, 1);
    }
    // console.log(M.view);
    return M; 
}

export const DeterminantCache = { 
    determinants: new Map(),
    get(key) {
        return this.determinants.get(key)
    },
    set(key, mtx) {
        this.determinants.set(key, mtx);
    },
    has(key) {
        return this.determinants.has(key);
    }
}
