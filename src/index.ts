export type CompareFn<T> = (a: T, b: T) => number


export class UnsortedArrayError<T> extends Error {
  constructor(_array: Array<T>, i: number) {
    super(`Invalid input unsorted array: array[${i}] > array[${i + 1}]`)
  }
}

export interface Range {
  left: number
  right: number
}

export interface SearchOptions {
  direction: Direction
  range: Partial<Range>
  inclusive: boolean
}

export enum Direction {
  Right,
  Left
}

export interface SortedArrayOptions {
  verify: boolean
  clone: boolean
}

export class SortedArray<T> {

  private readonly _array: Array<T>;
  private readonly _compareFn: CompareFn<T>;

  private constructor(array: Array<T>, compareFn: CompareFn<T>, options?: Partial<SortedArrayOptions>) {

    const verify = options?.verify ?? true;
    const clone = options?.clone ?? true;

    this._compareFn = compareFn;
    if (!verify && !clone) {
      this._array = array;
      return;
    }

    this._array = clone ? new Array(array.length) : array;

    if (array.length === 0) {
      return
    }

    let i = 0;
    let current = array[0]!;
    let next = current;
    this._array[0] = current;
    while (i < array.length - 1) {
      current = next;
      next = array[i + 1]!;
      this._array[i + 1] = next;
      if (verify && compareFn(current, next) > 0) {
        throw new UnsortedArrayError(array, i)
      }
      ++i;
    }

  }

  public static unsafe<T>(array: Array<T>, comperator: CompareFn<T>): SortedArray<T> {
    return new SortedArray(array, comperator, { verify: false, clone: false });
  }

  public static parse<T>(array: Array<T>, comperator: CompareFn<T>): SortedArray<T> {
    return new SortedArray(array, comperator, { verify: true, clone: true });
  }

  public searchRight(needle: T, options?: Partial<{ fromIndex: number, inclusive: boolean }>): { item: T, index: number } | undefined {
    return this.search(needle, {
      range: { left: options?.fromIndex, },
      inclusive: options?.inclusive,
      direction: Direction.Right,
    })
  }

  public searchLeft(needle: T, options: Partial<{ fromIndex: number, inclusive: boolean }>): { item: T, index: number } | undefined {
    return this.search(needle, {
      range: { right: (options && options.fromIndex) ? options.fromIndex + 1 : undefined, },
      inclusive: options?.inclusive,
      direction: Direction.Left,
    })
  }

  public search(needle: T, options?: Partial<SearchOptions>): { item: T; index: number } | undefined {

    let left = options?.range?.left ?? 0 // inclusive
    let right = options?.range?.right ?? this._array.length // exclusive

    if (left >= right || left >= this._array.length || right <= 0 || this._array.length === 0) {
      return undefined;
    }

    left = left >= 0 ? left : 0;
    right = right <= this._array.length ? right : this._array.length;

    const direction = options?.direction ?? Direction.Right;
    const inclusive = options?.inclusive ?? true;

    switch (direction) {

      case Direction.Right:
        if (inclusive) return this._searchRightInclusive(needle, left, right)
        else return this._searchRightExclusive(needle, left, right)

      case Direction.Left:
        if (inclusive) return this._searchLeftInclusive(needle, left, right)
        else return this._searchLeftExclusive(needle, left, right)
    }

  }

  private _binarySearch(needle: T, left: number, right: number, shouldGoRight: (item: T, needle: T) => boolean) {

    let l = left;
    let r = right;
    let mid = ((l + r) / 2) | 0;
    let item = this._array[mid]!;

    while (l < r) {
      if (shouldGoRight(item, needle)) {
        l = mid;
      } else {
        r = mid;
      }
      mid = ((l + r) / 2) | 0;
      item = this._array[mid]!;
      if (mid === r) break;
      if (mid === l) break;
    }

    return { item, mid };

  }

  private _searchRightExclusive(needle: T, left: number, right: number) {

    let { item, mid } = this._binarySearch(needle, left, right, (item, needle) => this._compareFn(item, needle) <= 0);

    if (this._compareFn(item, needle) > 0) {
      return { item: item, index: mid };
    }

    ++mid;
    if (mid >= right) {
      return undefined;
    }
    item = this._array[mid]!;
    return { item: item, index: mid };

  }

  private _searchRightInclusive(needle: T, left: number, right: number) {

    let { item, mid } = this._binarySearch(needle, left, right, (item, needle) => this._compareFn(item, needle) < 0);

    if (this._compareFn(item, needle) >= 0) {
      return { item: item, index: mid };
    }

    ++mid;
    if (mid >= right) {
      return undefined;
    }
    item = this._array[mid]!;
    return { item: item, index: mid };

  }

  private _searchLeftExclusive(needle: T, left: number, right: number) {

    let { item, mid } = this._binarySearch(needle, left, right, (item, needle) => this._compareFn(item, needle) < 0);

    if (this._compareFn(item, needle) < 0) {
      return { item: item, index: mid };
    }

    --mid;
    if (mid < left) {
      return undefined;
    }
    item = this._array[mid]!;
    return { item: item, index: mid };

  }

  private _searchLeftInclusive(needle: T, left: number, right: number) {

    let { item, mid } = this._binarySearch(needle, left, right, (item, needle) => this._compareFn(item, needle) <= 0);

    if (this._compareFn(item, needle) <= 0) {
      return { item: item, index: mid };
    }

    --mid;
    if (mid < left) {
      return undefined;
    }
    item = this._array[mid]!;
    return { item: item, index: mid };

  }

}

