import assert from 'assert';
import { SortedArray, UnsortedArrayError } from '../src';

describe('SortedArray', () => {

  it('parse', () => {
    assert.throws(() => SortedArray.parse([3, 4, 2], { compare: (a, b) => a - b }), new UnsortedArrayError([3, 4, 2], 1))
    assert.throws(() => SortedArray.parse([3, 2, 1], { compare: (a, b) => a - b }), new UnsortedArrayError([3, 2, 1], 0))
    assert.doesNotThrow(() => {
      const originalArray = [1, 2, 3];
      const parsedArray = SortedArray.parse(originalArray, { compare: (a, b) => a - b })
      assert.notEqual(parsedArray['_array'], originalArray, "The internal array should be a clone of the original, so that is immutable.")
      for (let i = 0; i < originalArray.length; i++) {
        assert.equal(parsedArray['_array'][i], originalArray[i], "The internal array should be a clone of the original, so that is immutable.")
      }
    })
    assert.doesNotThrow(() => {
      const originalArray = [3, 2, 1];
      const parsedArray = SortedArray.parse(originalArray, { compare: (a, b) => b - a })
      assert.notEqual(parsedArray['_array'], originalArray, "The internal array should be a clone of the original, so that is immutable.")
      for (let i = 0; i < originalArray.length; i++) {
        assert.equal(parsedArray['_array'][i], originalArray[i], "The internal array should be a clone of the original, so that is immutable.")
      }
    })
  })

  it('unsafe', () => {
    assert.doesNotThrow(() => {
      const originalArray = [3, 2, 1];
      const parsedArray = SortedArray.unsafe(originalArray, { compare: (a, b) => a - b })
      assert.equal(parsedArray['_array'], originalArray)
    })
    assert.doesNotThrow(() => {
      const originalArray = [3, 2, 1];
      const parsedArray = SortedArray.unsafe(originalArray, { compare: (a, b) => b - a })
      assert.equal(parsedArray['_array'], originalArray)
    })
  })

  it('findFirst', () => {
    const array = SortedArray.parse([1, 2, 3, 4], { compare: (a, b) => a - b })
    assert.deepEqual(array.findFirst((element, _index) => element > 2), { element: 3, index: 2 })
    assert.deepEqual(array.findFirst((element, _index) => element > 3), { element: 4, index: 3 })
    assert.deepEqual(array.findFirst((element, _index) => element > 1, 1), { element: 2, index: 1 })
    assert.deepEqual(array.findFirst((element, _index) => element > 1, 2), { element: 3, index: 2 })
    assert.deepEqual(array.findFirst((element, _index) => element > 1, 0, 1), undefined)
    assert.equal(array.findFirst((element, _index) => element < 1), undefined)
    assert.equal(array.findFirst((element, _index) => element > 4), undefined)
  })

})
