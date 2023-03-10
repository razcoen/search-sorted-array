
// TODO: Documentation.

export interface Comperator<T> {
  compare(a: T, b: T): number;
}

export class UnsortedArrayError<T> extends Error {
  constructor(_array: Array<T>, i: number) {
    // TODO: Work on the message...
    super(`Invalid input unsorted array: array[${i}] > array[${i + 1}]`)
  }
}

export enum Direction {
  LeftToRight,
  RightToLeft
}

export class SortedArray<T> {

  private readonly _array: Array<T>;
  private readonly _comperator: Comperator<T>;

  private constructor(array: Array<T>, comperator: Comperator<T>) {
    this._array = array;
    this._comperator = comperator;
    this._array; // TODO: remove
    this._comperator; // TODO: remove
  }

  // Duration:    O(1)
  // Allocation:  O(1)
  public static unsafe<T>(array: Array<T>, comperator: Comperator<T>): SortedArray<T> {
    return new SortedArray(array, comperator);
  }

  // Duration:    O(N)
  // Allocation:  O(N)
  public static parse<T>(array: Array<T>, comperator: Comperator<T>): SortedArray<T> {

    if (array.length === 0) {
      return new SortedArray([], comperator);
    }

    if (array.length === 1) {
      return new SortedArray([array[0]!], comperator);
    }

    const clone = new Array<T>(array.length);

    // Trying to read from the array only once to avoid heap access.
    let i = 0;
    let current = array[0]!;
    let next = current;
    clone[0] = current;
    while (i < array.length - 1) {
      current = next;
      next = array[i + 1]!;
      clone[i + 1] = next;
      if (comperator.compare(current, next) > 0) {
        throw new UnsortedArrayError(array, i)
      }
      ++i;
    }

    return new SortedArray(clone, comperator)

  }

  public findFirstGreaterThan(needle: T, options?: { left?: number, right?: number, direction?: Direction }): { element: T; index: number } | undefined {
    const config = {
      left: options?.left ?? 0, // inclusive
      right: options?.right ?? this._array.length, // exclusive
      direction: options?.direction ?? Direction.LeftToRight
    }
    switch (config.direction) {
      case Direction.RightToLeft: {
        return undefined;
      }
      default:
      case Direction.LeftToRight: {

        let left = config.left;
        let right = config.right;
        let mid = Math.floor(left + right / 2);
        let item;
        while (left < right) {
          item = this._array[mid]!;
          if (this._comperator.compare(item, needle) <= 0) {
            left = mid;
          } else {
            right = mid;
          }
          mid = Math.floor((left + right) / 2);
          if (mid === right) break;
          if (mid === left) break;
        }

        item = this._array[mid]!;
        if (this._comperator.compare(item, needle) > 0) {
          return { element: item, index: mid };
        }

        ++mid;
        if (mid >= config.right) {
          return undefined;
        }

        item = this._array[mid]!;
        if (this._comperator.compare(item, needle) > 0) {
          return { element: item, index: mid };
        }

        return undefined

        // Exponential search
        //
        // let index = left;
        // let previousIndex = -1;
        // let nextElement;
        //
        // while (index <= right && index !== previousIndex) {
        //   let jump = 0;
        //   let nextJump = 1;
        //   while (nextJump <= right - index) {
        //     nextElement = this._array[index + nextJump]!
        //     if (this._comperator.compare(nextElement, needle) <= 0) {
        //       jump = nextJump;
        //       nextJump *= 2;
        //     } else break;
        //   }
        //   previousIndex = index;
        //   index += jump;
        // }
        //
        //
        // let element = this._array[index]!;
        // if (this._comperator.compare(element, needle) <= 0) {
        //   ++index;
        //   element = this._array[index]!
        // }
        // if (index > right) {
        //   return undefined;
        // }
        // return { element, index }

      }
    }
  }

}
