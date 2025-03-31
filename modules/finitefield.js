export class FiniteField { 
    constructor(order) { 
        this.order = order; 
        this.elems = new Set(); 
        this.inverses = new Map(); 
        if (order != Number.MAX_SAFE_INTEGER) { 
            for (let i = 0; i < order; i++) {
                this.elems.add(i); 
            }   
        }
    } 
    
    static gcd = function (a,b) { 
        if (!b) { 
            return a; 
        }
        return FiniteField.gcd(a, a % b); 
    }   


    add(i,j) { 
        if ((i+j) < 0) {
            var num = i + j; 
            while (num < 0) {
                num += this.order; 
            }
            return num; 
        } 
        else {
            return (i+j) % this.order; 

        }
    }

    subtract(i,j) { 
        if ((i-j < 0)) { 
            var num = i - j; 
            while (num < 0) { 
                num += this.order; 
            }
        }
        else { 
            return (i - j) % this.order; 
        }
    }

    mult(i, j) { 
        if (i * j < 0) { 
            var num = i * j; 
            while (num < 0) { 
                num += this.order; 
            }
            return num; 
        } else { 
            return (i * j) % this.order; 
        }
    }

    invertible(i) { 
        return (FiniteField.gcd(i, this.order) == 1); 
    }

    invert(i) {
        if (i == -1)  {  // special case of FLT 
            return -1; 
        }

        if (this.order == Number.MAX_SAFE_INTEGER) { 
            return 0; // integers not multiplicatively invertible, unless 1 or -1 
        }
        
        var inv = 0; 

        if (this.invertible(i)) { // should try and figure out check only once for invertibility 
            for (; inv < this.order; inv++) { 
                if ((inv * j) % this.order == 1) { 
                    break; 
                }
            }
            this.inverses.add(i, inv); 
        }
        return inv; 
    }

    division(i, j) { // i 'divided' by j, finite field multiplication really 
        var inv = 0;                   
        if (this.invertible(j)) { 
            inv = invert(j); 
        }
        return (i * inv) % this.order;  
    }
    
    static conjugate(i,j) { // conjugation over finite fields is the identity map. 
        return i; 
    }
}

export const FiniteFieldRegistry = {
    fields: new Map(), 
    getField(order) {
        if (!this.fields.has(order)) {
            this.fields.set(order, new FiniteField(order)); 
        }
        return this.fields.get(order); 
    }
}