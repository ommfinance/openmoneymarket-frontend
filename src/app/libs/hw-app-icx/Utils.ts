// type Defer<T> = {
//   promise: Promise<unknown>;
//   resolve: (arg0: T) => void;
//   reject: (arg0: any) => void;
// };

export class Utils {
  // public static defer<T>(): Defer<T> {
  //   let resolve;
  //   let reject;
  //
  //   const promise = new Promise((success, failure) => {
  //     resolve = success;
  //     reject = failure;
  //   });
  //
  //   if (!resolve || !reject) {
  //     throw new Error("defer() error"); // this never happens and is just to make flow happy
  //   }
  //   // if (!resolve || !reject) throw "defer() error"; // this never happens and is just to make flow happy
  //   return {promise, resolve, reject};
  // }

  public static splitPath(path: string): any[] {
    const result: number[] = [];
    const components = path.split("/");
    components.forEach(element => {
      let num = parseInt(element, 10);
      if (isNaN(num)) {
        return; // FIXME shouldn't it throws instead?
      }
      if (element.length > 1 && element[element.length - 1] === "'") {
        num += 0x80000000;
      }
      result.push(num);
    });
    return result;
  }

  public static eachSeries<A>(
    arr: A[],
    fun: (arg0: A) => Promise<any>,
  ): Promise<any> {
    return arr.reduce((p, e) => p.then(() => fun(e)), Promise.resolve());
  }

  public static foreach<T, A>(
    arr: T[],
    callback: (arg0: T, arg1: number) => Promise<A>,
  ): Promise<A[]> {
    function iterate(index: number, array: string | any[], result: A[]): any {
      if (index >= array.length) {
        return result;
      } else {
        return callback(array[index], index).then((res) => {
          result.push(res);
          return iterate(index + 1, array, result);
        });
      }
    }
    return Promise.resolve().then(() => iterate(0, arr, []));
  }

  public static doIf(
    condition: boolean,
    callback: () => any | Promise<any>,
  ): Promise<void> {
    return Promise.resolve().then(() => {
      if (condition) {
        return callback();
      }
    });
  }

  public static asyncWhile<T>(
    predicate: () => boolean,
    callback: () => Promise<T>,
  ): Promise<Array<T>> {
    function iterate(result: T[]): any {
      if (!predicate()) {
        return result;
      } else {
        return callback().then(res => {
          result.push(res);
          return iterate(result);
        });
      }
    }
    return Promise.resolve([]).then(iterate);
  }

  public static hexToBase64(hexString: string): string {
    return btoa(hexString.match(/\w{2}/g)!!
      .map((a) =>  {
        return String.fromCharCode(parseInt(a, 16));
      }).join(""),
    );
  }

}

