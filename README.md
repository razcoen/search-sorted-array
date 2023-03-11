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

### Find First
```typescript
import { Direction, SortedArray } from 'search-sorted-array'

const array = SortedArray.parse([1, 2, 3, 4], (a, b) => a - b)

array.findFirst(1) // --> {item: 1, index: 0}
array.findFirst(2) // --> {item: 2, index: 1}
array.findFirst(3) // --> {item: 3, index: 2}
array.findFirst(4) // --> {item: 4, index: 3}

// By default "findFirst" searches with "Ascending" direction for the first greater or equal item.
array.findFirst(3.5)                                        // --> {item: 4, index: 3}
array.findFirst(3.5, { direction: Direction.Ascending })    // --> {item: 4, index: 3}
array.findFirst(3.5, { direction: Direction.Descending })   // --> {item: 3, index: 2}

array.findFirst(3)                                                        // --> {item: 3, index: 2}
array.findFirst(3, { direction: Direction.Ascending, skipEqual: true })   // --> {item: 4, index: 3}
array.findFirst(3, { direction: Direction.Descending, skipEqual: true })  // --> {item: 2, index: 1}

array.findFirst(0)                                        // --> {item: 1, index: 0}
array.findFirst(0, { direction: Direction.Ascending })    // --> {item: 1, index: 0}
array.findFirst(0, { direction: Direction.Descending })   // --> undefined

array.findFirst(5)                                        // --> undefined
array.findFirst(5, { direction: Direction.Ascending })    // --> undefined
array.findFirst(5, { direction: Direction.Descending })   // --> {item: 4, index: 3}
```
