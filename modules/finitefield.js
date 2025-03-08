export class FiniteField { 
    constructor(order) { 
        this.order = order; 
        this.elems = new Set(); 
        this.inverses = new Map(); 

        for (let i = 0; i < order; i++) {
            this.elems.add(i); 
        }   
    } 
    
    static gcd = function (a,b) { 
        if (!b) { 
            return a; 
        }
        return gcd(a, a % b); 
    }   

    member(i) {
        if (Math.abs(i) >= order) { 
            return false; 
        } else {
            return (this.elems.has(i)); 
        }
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
        return (this.gcd(i,this.order) == 1); 
    }

    invert(i) { 
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