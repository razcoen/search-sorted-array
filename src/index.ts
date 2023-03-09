
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

  public findFirst(predicate: (element: T, index: number) => boolean, options?: { left?: number, right?: number, direction?: Direction }): { element: T; index: number } | undefined {
    const start = options?.left ?? 0; // inclusive
    const end = options?.right ?? this._array.length - 1; // inclusive
    const direction = options?.direction ?? Direction.LeftToRight;
    direction; // TODO: Remove this.
    let element;
    // TODO: Make this use binary search.
    // TODO: Handle direction.
    for (let index = start; index <= end; index++) {
      element = this._array[index]!;
      if (predicate(element, index)) {
        return { element, index }
      }
    }
    return undefined;
  }

}
