import { Matrix } from '../../modules/matrix.js';


test('making a matrix should actually make a 0 matrix', () => {
  const matrix = new Matrix (7,3,3); 

  // console.log(matrix); 
  expect(matrix.contents == [
    [0, 0, 0], 
    [0, 0, 0], 
    [0, 0, 0]
  ])
  
})

test('transpose should swap rows and columns', () => {
    const matrix = new Matrix(7, 2, 3);
    // Initialize matrix with distinct values
    matrix.contents = [
      [1, 2, 3],
      [4, 5, 6]
    ];  
    const transposed = matrix.transpose();
    
    expect(transposed.rows).toBe(3);
    expect(transposed.cols).toBe(2);
    expect(transposed.contents).toEqual([
      [1, 4],
      [2, 5],
      [3, 6]
    ]);
  });

test('determinant should return correct value', () => {
  const matrix = new Matrix(10,3,3); 
  //Initialize matrix with distinct values
  matrix.contents = [
    [1,0,0], 
    [0,1,1], 
    [0,1,1]
  ]; 

  const dtm = matrix.det(); 
  expect(dtm).toBe(0)
})

test('inversion should return correct matrix', () =>  { 
  const matrix = new Matrix(7, 3, 3); 
  matrix.contents = [
    [1, 0, 0], 
    [3, 3, 0], 
    [5, 2, -1]
  ]; 

  const inv = matrix.invert(); 

  expect(inv.contents == [
    [1, 0, 0],
    [6, 5, 0],
    [3, 3, 6]
  ])
  })
  
/* test('inversion of [-1] should return correct inverse, [-1]', () => {
  const matrix = new Matrix(5,1,1); 
  matrix.contents = [[-1]]; 
  const inv = matrix.invert(); 

  expect(inv.contents != [-1]);
  expect(inv.contents) == [[-1]]; 
  })
*/ 



