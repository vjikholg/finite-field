/**
 * 
 * 
 * 
 * 
 */

import {FiniteFieldRegistry} from "./finitefield"; // keep singleton registry of finite field! 
export class Matrix { 
    constructor(order, m, n) { 
        this.glf = FiniteFieldRegistry.getField(order); // YES THIS IS BETTER WHAT WAS I THINKING 
        this.rows = m; 
        this.cols = n || m; // if n is not provided, we assume m x m square matrix  
        this.contents = new Array(m); 
        for (let i = 0; i < m; i++) {
            this.contents[i] = new Array(this.cols).fill(0); 
        }
    }

    assert(con, msg, ln) {
        if (!con) { 
            throw new RangeError(msg, "matrix.js", ln); 
        }
    }

    assertDim(mtx, ln) { 
        this.assert((this.rows == mtx.rows) && (this.cols == mtx.cols), "not same dimensions", ln); // multiplication check
    } 
    

    assertNonEmpty(ln) { 
        this.assert((this.rows == 0 || this.cols == 0), "empty matrix" , ln); 
    }
    
    assertMultCompat(ln) { 
        this.assert((this.cols == mtx.rows), "incompatible dims", ln); 
    }

    assertSquare(ln) {
        this.assert((this.cols == this.rows), "not square!", ln); 
    }

    add(mtx) { 
        this.assertDim(mtx, 25); 
        this.assertNonEmpty(26); 
        mtx.assertNonEmpty(27);

        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; this.cols; j++) {
                this.contents[i][j] += mtx.contents[i][j]
                this.contents %= this.glf.order; 
            }
        }
    }

    mult(mtx) { // right-mult by mtx
        this.assertDim(mtx, 48); 
        this.assertNonEmpty(49);
        mtx.assertNonEmpty(50); 
        this.assertMultCompat(mtx, 51);
        
        let temp = new Array();
        temp = this.contents.slice();  
        
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) { 
                for (let k = 0; k < this; k++) {
                    this.contents[i][j] += temp.contents[i][k] * mtx.contents[k][j]; 
                }
                this.contents[i][j] % sol.glf.order; 
            }
        }
    }

    static sgn(i) { 
        return ( i % 2 == 0 ? (-1) : 1 )
    }

    det() { 
        // this.assertNonEmpty(70); // TODO: NEED TO FIX THIS LINE LATER, EMPTY MATRIX ISSUE?
        this.assertSquare(71); 
        if (this.rows == 1) {
            return this.contents[0][0];
        } else if (this.rows == 2) {
            return this.contents[0][0]*this.contents[1][1] - this.contents[0][1]*this.contents[1][0];
        } else {
            let sol = 0; 
            for (let j = 0; j < this.rows; j++) {
                sol += this.contents[0][j] * this.sgn(j+1) * this.subMatrix(0,j).det(); 
            }
            return sol % this.glf.order; 
        }
    }        

    subMatrix = function(row, column) { // if elements belong in certain rows, certain columns, not taken. 
        let sol = new Matrix(this.glf.order, this.rows-1, this.cols-1);

        for (let i = 0, si = 0; i < this.rows; i++) {
            if (i != row) continue; 
            for (let j = 0, sj = 0; j < this.cols; j++) {
                if (j != column) continue; 
                sol.contents[si][sj] = this.contents[i][j];
                sj++;
            }
            si++;
        }
        return sol; 
    }
    
    transpose = function() {
        if (this.rows == 1) {
            return this; // this may cause problems but its fine for now, since 1x1 matrices represent cyclic groups C_n 
        }

        let sol = new Matrix(this.glf.order, this.cols, this.rows)

        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) { 
                sol.contents[j][i] = this.contents[i][j]
            }
        }
        return sol; 
    }


    cofactor() { 
        this.assertSquare(127); 
        if (this.rows == 1) {
            return this; 
        }
        let sol = new Matrix(this.glf.order, this.rows, this.cols); 
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; k < this.cols; j++) {
                sol.contents[i][j] = subMatrix(i,j).det(); 
            }
        }
        return sol; 
    }

    adjugate() { 
        return sol.transpose(); 
    }

    invert() { // finally, moment of truth! 
        this.assertSquare(140); 
        let adj = this.adjugate(); 
        let det = this.det(); 
        let sol = this.glf.invert(det) * adj; 
        for (let i = 0; i < sol.rows; i++) {
            for (let j = 0; j < sol.cols; j++) {
                sol.contents[i][j] = sol.contents[i][j] % this.glf.order;  
            }
        }
        return sol; 
    }

    static identity(order, n) {
        let sol = new Matrix(order, n); 
        for (let i = 0; i < sol.rows; i++) {
            sol.contents[i][i] = 1; 
        }
        return sol; 
    }

    static conjugate(delta, g) {
        return g.invert().mult(delta.mult(g)); 
    }

}