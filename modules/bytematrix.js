import { FieldRegistry, GFp, Z} from "./domains";
import { cyrb53 } from "./helpers/hashcode";

function byteWidth(word) { 
    if (word === 'u8') return 1; 
    if (word === 'u16') return 2; 
    if (word === 'i32') return 4; 
    if (word === 'f32') return 8; 
    throw new Error(`${word} is an invalid/unknown word`); 
}

function makeView(buffer, word) {
    if (word === 'u8') return new Uint8Array(buffer); 
    if (word === 'u16') return new Uint16Array(buffer); 
    if (word === 'i32') return new Int32Array(buffer);
    if (word === 'f32') return new Float32Array(buffer);
    throw new Error(`${word} is an invalid/unknown word`); 
}

export class ByteMatrix {
    #rows; #cols; #domain; #buffer; #view; #key; #dirty; #len;
    static #invCache = new Map(); // (k, v) = (key, matrix); 
    
    constructor({rows, cols, p, buffer}) { 
        this.#rows = rows, 
        this.#cols = cols || rows; 
        this.#domain = FieldRegistry.getField(p); 
        this.#len = rows * cols || rows * rows; 
        const bw = byteWidth(this.#domain.word)
        this.#buffer = (buffer instanceof ArrayBuffer) ? buffer : new ArrayBuffer(this.#len * bw); 
        this.#view = makeView(this.#buffer, this.#domain.word); 
        this.#key = null; 
        this.#dirty = true;
    }

    get rows() {return this.#rows;}
    get cols() {return this.#cols;}
    get domain() {return this.#domain}
    get view() {return this.#view} // DANGEROUS MUTABLE REF

    static square(n, domain) {
        return new ByteMatrix({rows: n, cols: n, domain: this.domain.p});
    }

    static fromPayload(payload) {
        
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
        return true; 
    } 

    get key() {
        if (this.key !== null && !this.#dirty) return this.#key; 
        const meta = (this.#domain.id === 0) ? `GF(${this.#domain.p})` : 'Z';
        const head = `${meta}:${this.#rows}x${this.cols}`;
        const bytes = new Uint8Array(this.#buffer);

        this.#key = cyrb53(head + Array.from(bytes).join(","));
        this.#dirty = false;   
        
        return this.#key;
    }

    mult(mtx) { 
        if(this.#cols !== mtx.#rows) throw new Error(`Dimensional mismatch: A rows: ${this.#rows}, B cols: ${B.#cols}`); 
        if(this.#domain.id !== mtx.#domain.id) throw new Error(`Domain mismatch: A: ${this.#domain.id}, B:${B.domain.id}`);
        if(this.#domain.id === 0 && this.#domain.p !== B.#domain.p) throw new Error(`p-Domain mismatch: A:${this.domain.p},  B:${B.domain.p}`)
        
        const n  = this.#rows, m = this.#cols, k = B.#cols; 
        const out = new Matrix2({rows: n, cols: k, p: this.#domain.p})
        const A = this.#view, mtxView = mtx.#view, outView = out.#view

        if (this.#domain.id === 0) { 
            const p = this.#domain.p;  
            for (let i = 0; i < n; i++) { 
                const io = i*k, ia = i*m; 
                
                for(let j = 0 ; j < k; j++) {
                    let s = 0; 
                    
                    for (let t = 0; t < m; t++) {
                        s += this.#domain.representative((A[ia + t] * mtxView[t*k + j])); 
                        outView[io + j] = s; 
                    }
                }
            }
        } else { // Z 
            for (let i = 0; i < n; i++ ) { 
                for (let j = 0 ; j < k; j++) { 
                    let s = 0; 
                    for (let t = 0; t < m; t++) {
                        s += A[ia + t] * mtxView[t*k + j]
                        outView[io + j] = s; 
                    }
                }
            }
        }
        C.#dirty = true; C.#key = null; 
        return C;
   }

    subMatrix(row, column) { 
        let sol = new ByteMatrix({rows: row-1, cols: column-1, p: this.#domain.p})

        for (let i = 0, si = 0; i < this.rows; i++) {
            if (i === row) continue; 
            for (let j = 0, sj = 0; j < this.cols; j++) {
                if (j === column) continue; 
                sol.#view[sol.unsafeIndex(si, sj)] = this.#view[this.unsafeIndex(i,j)];
                sj++;
            }
            si++;
        }
        return sol; 
    }

    transpose() {
        if (this.#rows === 1 && this.#cols === 1) return this; 
        
        const view = this.#view;
        let sol = new ByteMatrix({rows: this.#rows, cols: this.#cols, p: this.#domain.p}); 

        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) { 
                sol.#view[sol.unsafeIndex(j,i)] = view[this.unsafeIndex(i,j)];
            }
        }
        return sol; 
    }

    det() {
        if (this.#rows !== this.#cols) throw new Error(`Non-square matrix!: ${this.#view}`)
        if (this.#domain.id === 0) return this.#detGFp(); 
        if (this.#domain.id === 1) return this.#detZ(); 
        throw new Error(`Cannot take determinant from: ${typeof(this)}`);
    }

    #detZ() {

        const n = this.#len;
        if (n === 1) return this.#view[0];
        
        const view = this.#view
        if (n === 4) return (view[0]*view[3] - view[1]*view[2])

        let sol = 0; 
        for (let i = 0; i < this.#cols; i++) {
            sol += view[i] * this.subMatrix(0, i).#detZ();
        }
        
        return sol; 
    }  

    #detGFp() {
        const n = this.#len;
        if (n === 1) return this.#view[0];
        
        const view = this.#view
        if (n === 4) return this.domain.representative(view[0]*view[3] - view[1]*view[2])

        let sol = 0; 
        for (let i = 0; i < this.#cols; i++) {
            sol += view[i] * this.subMatrix(0, i).#detZ();
        }
        
        return this.domain.representative(sol); 
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
                sol.#view[sol.unsafeIndex(i,j)] = this.#domain.representative(val);
            }
        }
        return sol; 
    }

    adjugate() { 
        return this.cofactor().transpose();
    }

    inv() {
        if (this.#domain.id === 0) return this.#invZ();
        if (this.#domain.id === 1) return this.#invGFp();
        throw new Error(`Cannot take the inverse of: ${typeof(this)}`)
    }

    #invGFp() {
        if (this.#rows !== this.cols) throw new Error(`Non square matrix: ${this.#view}`);
        const det = this.det(); 
        const adj = this.adj(); 
        const view = adj.#view
        const invdet = this.#domain.invert(det);
        let sol = new ByteMatrix({rows: this.#rows, cols: this.#cols, p: this.#domain.p})
    
        for (let i = 0; i < this.#len; i++) {
            sol[i] = this.#domain.representative(view[i] * invdet); 
        }

        return sol;
    }

    #invZ() {
        if (this.#rows !== this.cols) throw new Error(`Non square matrix: ${this.#view}`);
        const det = this.det(); 
        if (Math.abs(det) !== 1) throw new Error(`Z-matrix non-invertible: det ${det}`);

        const view = adj.#view
        const adj = this.adj(); 
        const invdet = parseFloat(1/parseFloat(det)) 
        let sol = new ByteMatrix({rows: this.#rows, cols: this.#cols, p: this.#domain.p})
            
        for (let i = 0; i < this.#len; i++) {
            sol[i] = view[i] * invdet; 
        }
        return sol;
    }
}

export function fromArray(arr, p) {
    const sol = new ByteMatrix({rows:arr.length, cols:arr[0].length, p: p, buffer: arr.flat()})
    Object.freeze(sol); //   
    return sol; 
}

export function unsafeFromArray(arr, p) {
    return new ByteMatrix({rows:arr.length, cols:arr[0].length, p: p, buffer: arr.flat()}); 
}