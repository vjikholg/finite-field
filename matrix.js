class Matrix { 
    constructor(order) { 
        this.glf = new FiniteField(order); 
        this.contents = []; 
        this.rows = 0; 
        this.cols = 0; 
    }

    constructor(order, m, n) { 
        this.glf = new FiniteField(order); 
        this.rows = m; 
        this.cols = n; 
        this.contents = new Array(m); 
        for (let i = 0; i < m; i++) {
            this.contents[i] = new Array(n).fill(0); 
        }
    }

    constructor(order, m) { 
        this.glf = new FiniteField(order); 
        this.rows = m; 
        this.cols = m; 
        this.contents = new Array(m); 
        for (let i = 0; i < m; i++) {
            this.contents[i] = new Array(m).fill(0); 
        }
    }

    assert = function(con, msg, ln) {
        if (!con) { 
            throw new RangeError(msg, "matrix.js", ln); 
        }
    }

    assertDim = function(mtx, ln) { 
        assert((this.rows == mtx.rows) && (this.cols == mtx.cols), "not same dimensions", ln);
        } 
    

    assertNonEmpty = function(ln) { 
        assert((this.rows == 0 || this.cols == 0), "empty matrix" , ln); 
        }
    
    assertMultCompat = function(mtx, ln) { 
        assert((this.cols == mtx.rows), "incompatible dims", ln); 
    }

    assertSquare = function(ln) {
        assert((this.cols == this.rows), "not square!", ln); 
    }

    add(mtx) { 
        this.assertDim(mtx, 25); 
        this.assertNonEmpty(26); 
        mtx.assertNonEmpty(27);

        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; this.cols; j++) {
                this.contents[i][j] += mtx.contents[i][j]
            }
        }
    }

    mult(mtx) { // right-mult by mtx
        this.assertDim(mtx, 41); 
        this.assertNonEmpty(42);
        mtx.assertNonEmpty(43); 
        this.assertMultCompat(mtx, 44);
        
        let sol = new Matrix(this.order, this.rows, mtx.cols); 
        for (let i = 0; i < sol.rows; i++) {
            for (let j = 0; j < sol.cols; j++) { 
                for (let k = 0; k < sol.rows; k++) {
                    sol.contents[i][j] += this.contents[i][k] * mtx.contents[k][j]; 
                }
                sol.contents[i][j] % sol.glf.order; 
            }
        }
        this = sol;
    }

    sgn(i) { 
        return ( i % 2 == 0 ? (-1) : 1 )
    }

    det() {
        this.assertNonEmpty(83);
        this.assertSquare(84); 
        if (this.rows == 1) {
            return this.contents[0][0];
        } else if (this.rows == 2) {
            return this.contents[0][0]*this.contents[1][1] - this.contents[0][1]*this.contents[1][0];
        } else {
            let sol = 0; 
            for (let j = 0; j < this.rows; j++) {
                sol += this.contents[0][j] * sgn(j+1) * this.subMatrix(0,j).det(); 
            }
        }
        // need some sort of recursive formula... 
        // det [[a b c] [d e f] [g h i]] = a det[ [e f] [h i]]  
        return sol; 
    }        

    subMatrix = function(mtx, row, column) { // use in determinant ONLY. Row, Column is equivalent to the rows, columns not being taken. 
        let sol = new Matrix(mtx.order, mtx.rows-1, mtx.cols-1);

        for (let i = 0; i < sol.rows; i++) {
            for (let j = 0; j < sol.cols; j++) {
                if ( !(i == row - 1 && j == column-1) ) {
                    sol.contents[i][j] = mtx.contents[i][j]; 
                }
            }
        }
        return sol; 
    }
    
}