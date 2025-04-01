import { FiniteFieldRegistry } from "../../modules/finitefield";
test('testing inverses actually properly invert', () => { 
    const galoisfield = FiniteFieldRegistry.getField(11); 
    let inverse = []; 
    let test = [1, 6, 4, 3, 9, 2, 8, 7, 5, 10];
    for (let i = 1; i < galoisfield.order; i++) {
        inverse.push(galoisfield.invert(i));
    }


    // console.log(inverse); 
    for (let i = 0; i < inverse.length; i++) {
        expect(inverse[i] === test[i]).toBe(true); 
    }

})

test('check integer representative of -1 in Z mod MAX_SAFE_INTEGER returns proper values', () => {
    const galoisfield = FiniteFieldRegistry.getField(Number.MAX_SAFE_INTEGER); 
    
    expect(galoisfield.representative(-1)).toEqual(-1); 

}) 