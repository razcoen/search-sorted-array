import assert from 'assert';
import { randomInt } from 'crypto';
import { CompareFn, Direction, SearchOptions, SortedArray, UnsortedArrayError } from '../src';

const BENCHMARK_ARRAY_LENGTHS = [0, 1, 10, 50, 100, 500, 1_000, 5_000, 10_000, 50_000, 100_000];
const BENCHMARK_ITERATIONS = 10_000;

const ASCENDING_SORT_COMPARE_FN: CompareFn<number> = (a: number, b: number) => a - b;
const DESCENDING_SORT_COMPARE_FN: CompareFn<number> = (a: number, b: number) => b - a;


describe('SortedArray', () => {

  it('parse', () => {
    assert.throws(() => SortedArray.parse([3, 4, 2], ASCENDING_SORT_COMPARE_FN), new UnsortedArrayError([3, 4, 2], 1))
    assert.throws(() => SortedArray.parse([3, 2, 1], ASCENDING_SORT_COMPARE_FN), new UnsortedArrayError([3, 2, 1], 0))
    assert.doesNotThrow(() => {
      const originalArray = [1, 2, 3];
      const parsedArray = SortedArray.parse(originalArray, ASCENDING_SORT_COMPARE_FN)
      assert.notEqual(parsedArray['_array'], originalArray, "The internal array should be a clone of the original, so that is immutable.")
      for (let i = 0; i < originalArray.length; i++) {
        assert.equal(parsedArray['_array'][i], originalArray[i], "The internal array should be a clone of the original, so that is immutable.")
      }
    })
    assert.doesNotThrow(() => {
      const originalArray = [3, 2, 1];
      const parsedArray = SortedArray.parse(originalArray, DESCENDING_SORT_COMPARE_FN)
      assert.notEqual(parsedArray['_array'], originalArray, "The internal array should be a clone of the original, so that is immutable.")
      for (let i = 0; i < originalArray.length; i++) {
        assert.equal(parsedArray['_array'][i], originalArray[i], "The internal array should be a clone of the original, so that is immutable.")
      }
    })
  })

  it('unsafe', () => {
    assert.doesNotThrow(() => {
      const originalArray = [3, 2, 1];
      const parsedArray = SortedArray.unsafe(originalArray, ASCENDING_SORT_COMPARE_FN)
      assert.equal(parsedArray['_array'], originalArray)
    })
    assert.doesNotThrow(() => {
      const originalArray = [3, 2, 1];
      const parsedArray = SortedArray.unsafe(originalArray, DESCENDING_SORT_COMPARE_FN)
      assert.equal(parsedArray['_array'], originalArray)
    })
  })

  it('search - greater', () => { benchmarkSearch({ skipEqual: true, direction: Direction.Right }) })
  it('search - lesser', () => { benchmarkSearch({ skipEqual: true, direction: Direction.Left }) })
  it('search - greater or equal', () => { benchmarkSearch({ skipEqual: false, direction: Direction.Right }) })
  it('search - lesser or equal', () => { benchmarkSearch({ skipEqual: false, direction: Direction.Left }) })

  function generateRandomSortedArray(length?: number) {
    length = length ?? 100_000;
    const array = new Array(length);
    let current = 0;
    for (let i = 0; i < length; i++) {
      current += randomInt(0, 3)
      array[i] = current
    }
    return array;
  }

  function linearSearch(array: Array<number>, needle: number, options: SearchOptions) {

    switch (options.direction) {

      case Direction.Right:

        if (options.skipEqual) {
          for (let i = options.range.left!; i < options.range.right!; i++) {
            if (array[i]! > needle) {
              return { item: array[i], index: i }
            }
          }
          return undefined;
        }

        for (let i = options.range.left!; i < options.range.right!; i++) {
          if (array[i]! >= needle) {
            return { item: array[i], index: i }
          }
        }
        return undefined;

      case Direction.Left:

        if (options.skipEqual) {
          for (let i = options.range.right! - 1; i >= options.range.left!; i--) {
            if (array[i]! < needle) {
              return { item: array[i], index: i }
            }
          }
          return undefined;
        }

        for (let i = options.range.right! - 1; i >= options.range.left!; i--) {
          if (array[i]! <= needle) {
            return { item: array[i], index: i }
          }
        }
        return undefined;
    }


  }

  function benchmarkSearch(options: { skipEqual: boolean, direction: Direction }) {

    const benchmarks: Array<{ length: number, metrics: any }> = []

    for (let length of BENCHMARK_ARRAY_LENGTHS) {

      const startTimeGenerate = process.hrtime.bigint()
      const randomArray = generateRandomSortedArray(length)
      const endTimeGenerate = process.hrtime.bigint()

      const startTimeUnsafe = process.hrtime.bigint()
      SortedArray.unsafe(randomArray, ASCENDING_SORT_COMPARE_FN)
      const endTimeUnsafe = process.hrtime.bigint()

      const startTimeParse = process.hrtime.bigint()
      const sortedArray = SortedArray.parse(randomArray, ASCENDING_SORT_COMPARE_FN)
      const endTimeParse = process.hrtime.bigint()

      const metrics = {
        linearSearchDurationNanos: BigInt(0),
        binarySearchDurationNanos: BigInt(0),
        generateDurationNanos: endTimeGenerate - startTimeGenerate,
        unsafeDurationNanos: endTimeUnsafe - startTimeUnsafe,
        parseDurationNanos: endTimeParse - startTimeParse,
        count: 0,
      }

      benchmarks.push({ length, metrics })

      for (let i = 0; i < BENCHMARK_ITERATIONS; i++) {

        const min = randomArray[0] ?? 0
        const max = randomArray[randomArray.length - 1] ?? 0;
        const left = randomInt(-1, randomArray.length)
        const right = randomInt(left, randomArray.length)
        const needle = randomInt(min - 1, max + 2)

        const startTimeLinearSearch = process.hrtime.bigint()
        const expected = linearSearch(randomArray, needle, { range: { left, right }, ...options })
        const endTimeLinearSearch = process.hrtime.bigint()

        const startTimeBinarySearch = process.hrtime.bigint()
        const actual = sortedArray.search(needle, { range: { left, right }, ...options })
        const endTimeBinarySearch = process.hrtime.bigint()

        assert.deepEqual(actual, expected, JSON.stringify({ actual, expected, needle, right, left, length }, null, 2))

        metrics.linearSearchDurationNanos += endTimeLinearSearch - startTimeLinearSearch
        metrics.binarySearchDurationNanos += endTimeBinarySearch - startTimeBinarySearch
        metrics.count++

      }

    }

    const table: Array<any> = []
    for (const benchmark of benchmarks) {
      const { metrics, length } = benchmark;
      const gst = Number(metrics.generateDurationNanos) / 1_000_000
      const pst = Number(metrics.parseDurationNanos) / 1_000_000
      const ust = Number(metrics.unsafeDurationNanos) / 1_000_000
      const bst = Number(metrics.binarySearchDurationNanos) / 1_000_000
      const lst = Number(metrics.linearSearchDurationNanos) / 1_000_000
      const bsa = Number(metrics.binarySearchDurationNanos) / (metrics.count * 1_000)
      const lsa = Number(metrics.linearSearchDurationNanos) / (metrics.count * 1_000)
      const multiplier = Number((metrics.linearSearchDurationNanos * BigInt(1_000)) / metrics.binarySearchDurationNanos) / 1_000
      table.push({
        length,
        'generate (ms)': Math.trunc(gst * 100) / 100,
        'unsafe (ms)': Math.trunc(ust * 100) / 100,
        'parse (ms)': Math.trunc(pst * 100) / 100,
        'binary search total (ms)': Math.trunc(bst * 100) / 100,
        'linear search total (ms)': Math.trunc(lst * 100) / 100,
        'binary search average (us)': Math.trunc(bsa * 100) / 100,
        'linear search average (us)': Math.trunc(lsa * 100) / 100,
        multiplier: Math.trunc(multiplier * 100) / 100
      })
    }
    console.log(`
====================== BENCHMARKS ======================

Direction:  ${options.direction === Direction.Right ? 'Ascending' : 'Descending'}
Skip Equal: ${options.skipEqual}
`)

    console.table(table)
    console.log(`
========================================================
`)

  }
})
