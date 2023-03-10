import assert from 'assert';
import { randomInt } from 'crypto';
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

  it('findFirstGreaterThan', () => {

    function findFirstGreaterThanLinearSearch(array: Array<number>, needle: number, left: number = 0, right: number = array.length) {
      for (let i = left; i < right; i++) {
        if (array[i]! > needle) {
          return { element: array[i], index: i }
        }
      }
      return undefined;
    }

    function generateRandomSortedArray(length?: number) {
      length = length ?? 100000;
      const array = new Array(length);
      let current = 0;
      for (let i = 0; i < length; i++) {
        if (randomInt(0, 2) === 1) {
          current += randomInt(5)
        }
        array[i] = current
      }
      return array;
    }

    {
      const internalArray = [1, 2, 3, 4]
      const array = SortedArray.parse(internalArray, { compare: (a, b) => a - b })
      const matrix = [
        {
          input: { needle: 0 },
          output: { element: 1, index: 0 }
        },
        {
          input: { needle: 1 },
          output: { element: 2, index: 1 }
        },
        {
          input: { needle: 2 },
          output: { element: 3, index: 2 }
        },
        {
          input: { needle: 3 },
          output: { element: 4, index: 3 }
        },
        {
          input: { needle: 4 },
          output: undefined,
        },
        {
          input: { needle: 1, options: { left: 1 } },
          output: { element: 2, index: 1 }
        },
        {
          input: { needle: 1, options: { left: 2 } },
          output: { element: 3, index: 2 }
        },
        {
          input: { needle: 1, options: { left: 0, right: 1 } },
          output: undefined,
        },
      ]

      for (const row of matrix) {
        assert.deepEqual(findFirstGreaterThanLinearSearch(internalArray, row.input.needle, row.input.options?.left, row.input.options?.right), row.output)
        assert.deepEqual(array.findFirstGreaterThan(row.input.needle, row.input.options), row.output)
      }

    }
    {
      const internalArray = [1, 2, 2, 2, 2, 2, 2, 3, 3, 4, 4]
      const array = SortedArray.parse(internalArray, { compare: (a, b) => a - b })
      const matrix = [
        {
          input: { needle: 0 },
          output: { element: 1, index: 0 }
        },
        {
          input: { needle: 1 },
          output: { element: 2, index: 1 }
        },
        {
          input: { needle: 2 },
          output: { element: 3, index: 7 }
        },
        {
          input: { needle: 3 },
          output: { element: 4, index: 9 }
        },
        {
          input: { needle: 4 },
          output: undefined,
        },
        {
          input: { needle: 1, options: { left: 1 } },
          output: { element: 2, index: 1 }
        },
        {
          input: { needle: 1, options: { left: 3 } },
          output: { element: 2, index: 3 }
        },
        {
          input: { needle: 2, options: { right: 3 } },
          output: undefined,
        },
      ]

      for (const row of matrix) {
        assert.deepEqual(findFirstGreaterThanLinearSearch(internalArray, row.input.needle, row.input.options?.left, row.input.options?.right), row.output)
        assert.deepEqual(array.findFirstGreaterThan(row.input.needle, row.input.options), row.output)
      }
    }

    { // Benchmark

      const randomArray = generateRandomSortedArray(3_000_000)
      const sortedArray = SortedArray.parse(randomArray, { compare: (a, b) => a - b })
      const metrics = {
        linearSearchDurationNanos: BigInt(0),
        binarySearchDurationNanos: BigInt(0),
        count: 0,
      }

      for (let i = 0; i < 1000; i++) {

        const min = randomArray[0]!
        const max = randomArray[randomArray.length - 1]!;
        const left = randomInt(randomArray.length)
        const right = randomInt(left, randomArray.length)
        const needle = randomInt(min - 1, max + 2)

        const startTimeLinearSearch = process.hrtime.bigint()
        const expected = findFirstGreaterThanLinearSearch(randomArray, needle, left, right)
        const endTimeLinearSearch = process.hrtime.bigint()

        const startTimeBinarySearch = process.hrtime.bigint()
        const actual = sortedArray.findFirstGreaterThan(needle, { left, right })
        const endTimeBinarySearch = process.hrtime.bigint()

        assert.deepEqual(actual, expected)

        metrics.linearSearchDurationNanos += endTimeLinearSearch - startTimeLinearSearch
        metrics.binarySearchDurationNanos += endTimeBinarySearch - startTimeBinarySearch
        metrics.count++

      }

      const bsa = Number(metrics.binarySearchDurationNanos / BigInt(1000 * metrics.count))
      const lsa = Number(metrics.linearSearchDurationNanos / BigInt(1000 * metrics.count))
      console.log(`
====================== BENCHMARKS ======================

                       < Input >

             Array Length --- ${randomArray.length}
               Iterations --- ${metrics.count}


                  < Duration Average >

            Binary Search --- ${bsa}us
            Linear Search --- ${lsa}us

========================================================
`)

    }
  })

})
