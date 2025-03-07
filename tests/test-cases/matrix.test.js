import { Matrix } from '../../modules/matrix.js';

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