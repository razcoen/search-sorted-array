# search-sorted-array

## Usage

```typescript
import { Direction, SortedArray } from 'search-sorted-array'

let array: SortedArray<number>

// SortedArray expecting 

array = SortedArray.parse([4, 2, 3, 4], (a, b) => a - b) 
// throws UnsortedArrayError 

array = SortedArray.unsafe([4, 2, 3, 4], (a, b) => a - b)  
// "unsafe" does not verify, use when performance is critical and can assume the array is sorted.

array = SortedArray.parse([1, 2, 3, 4], (a, b) => a - b)

// Assuming array to be [1,2,3,4].
// By default "findFirst" searches with "Ascending" direction for the first greater or equal item.

array.findFirst(1) // --> {item: 1, index: 0}
array.findFirst(2) // --> {item: 2, index: 1}
array.findFirst(3) // --> {item: 3, index: 2}
array.findFirst(4) // --> {item: 4, index: 3}

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
