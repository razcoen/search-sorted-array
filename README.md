# [search-sorted-array](https://www.npmjs.com/package/search-sorted-array)

## Install

```bash
npm install search-sorted-array
```

## Usage

### Construct
```typescript
import { SortedArray } from 'search-sorted-array'

let array: SortedArray<number>

array = SortedArray.parse([1, 2, 3, 4], (a, b) => a - b)
array = SortedArray.parse([4, 2, 3, 4], (a, b) => a - b) // throws UnsortedArrayError 

// "SortedArray.unsafe" does not verify the array is actually sorted.
// Use when performance is critical and one can assume the array is sorted.
array = SortedArray.unsafe([4, 2, 3, 4], (a, b) => a - b)  

```

### Search
```typescript
import { Direction, SortedArray } from 'search-sorted-array'

const array = SortedArray.parse([1, 2, 3, 4], (a, b) => a - b)

array.search(1) // --> {item: 1, index: 0}
array.search(2) // --> {item: 2, index: 1}
array.search(3) // --> {item: 3, index: 2}
array.search(4) // --> {item: 4, index: 3}

// By default "search" searches in right direction for the first greater or equal number.
array.search(3.5)  // --> {item: 4, index: 3}
// "searchRight" searches from 0 to the end until it finds the first greater or equal number.
// Same as "search" with "direction = Direction.Right" .
array.searchRight(3.5)                                    // --> {item: 4, index: 2}
array.search(3.5, { direction: Direction.Right })         // --> {item: 4, index: 3}
// "searchLeft" searches from the end down to 0 until it finds the first lesser or equal number.
// Same as "search" with "direction = Direction.Left".
array.searchLeft(3.5)                                     // --> {item: 3, index: 2}
array.search(3.5, { direction: Direction.Left })          // --> {item: 3, index: 2}

array.search(3)                                                     // --> {item: 3, index: 2}
array.search(3, { direction: Direction.Right, inclusive: false })   // --> {item: 4, index: 3}
array.search(3, { direction: Direction.Left, inclusive: false })    // --> {item: 2, index: 1}

array.search(0)                                   // --> {item: 1, index: 0}
array.search(0, { direction: Direction.Right })   // --> {item: 1, index: 0}
array.search(0, { direction: Direction.Left })    // --> undefined

array.search(5)                                   // --> undefined
array.search(5, { direction: Direction.Right })   // --> undefined
array.search(5, { direction: Direction.Left })    // --> {item: 4, index: 3}
```
