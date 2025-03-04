class Matrix { 
    constructor(order) { 
        this.glf = new FiniteField(order); 
        this.contents = []; 
        this.rows = 0; 
        this.cols = 0; 
    }

    assert = function(con, msg, ln) {
        if (!con) { 
            throw new RangeError(msg, "matrix.js", ln); 
        }
    }

    assertDim = function(ln) { 
        assert((this.rows == mtx.rows) && (this.cols == mtx.cols), "not same dimensions", ln);
        } 
    

    assertNonEmpty = function(ln) { 
        assert((this.rows == 0 || this.cols == 0), "empty matrix" , ln); 
        }
    
    add(mtx) { 
        this.assertDim(25); 
        this.assertNonEmpty(26); 
        mtx.assertDim(27);
        mtx.assertNonEmpty(28);

        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; this.cols; j++) {
                this.contents[i][j] += mtx.contents[i][j]
            }
        }
    }

    mult(mtx) { 
        
    }

}