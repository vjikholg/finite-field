import { Matrix } from "../../modules/matrix";
import { FiniteGroup, assertGroup } from "../../modules/finitegroup";

const allGroups = require('../../data/output.json')
// const groupInfo = JSON.parse(json); 
const groupTest = function(group) { 
    return assertGroup(group); 
}

describe(" 'generating all groups' ", () => {
    test.each(allGroups) ( 
        "testing %p to assert each generates a group of specified order", 
        ({generators, glforder, name, order}) => {              // 1. allGroup is an array of OBJECTS, which means reading in (arg1, arg2,...) will not work
                                                                // solution: convert into object {arg1, arg2,...}
            // first convert 2D arrays to matrix objects 
            const mtc = generators.map(mtx => {                 // 2. use map instead of forEach if we want to perform an operation on each element in the array  
                const temp = new Matrix(glforder, mtx.length)   // without using too much space 
                temp.contents = mtx; 
                return temp; 
                });

            let group = new FiniteGroup(mtc, name); 
            expect(group.order).toEqual(order); 
            expect(groupTest(group)).toBe(true); 
        }
    )
})