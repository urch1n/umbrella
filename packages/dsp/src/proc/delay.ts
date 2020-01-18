import { Fn0, IClear, ILength } from "@thi.ng/api";
import { isFunction } from "@thi.ng/checks";
import { AProc } from "./aproc";

export const delay = (n: number) => new Delay(n, 0);

/**
 * Ring buffer / delay line for arbitrary values w/ support for tapping
 * at any delay time (within configured buffer size).
 */
export class Delay<T> extends AProc<T, T> implements IClear, ILength {
    protected _buf: T[];
    protected _rpos: number;
    protected _wpos: number;

    /**
     * Constructs new delay line of size `n` and initializes all
     * elements to `empty`. If the latter is a function, the buffer will
     * be initialized with the results of that function (called for each
     * element).
     *
     * @param n
     * @param _empty
     */
    constructor(n: number, protected _empty: T | Fn0<T>) {
        super(isFunction(_empty) ? _empty() : _empty);
        this._wpos = n - 1;
        this._rpos = 0;
        this._buf = new Array(n);
        this.clear();
    }

    get length() {
        return this._buf.length;
    }

    clear() {
        const { _buf, _empty } = this;
        if (isFunction(_empty)) {
            for (let i = _buf.length; --i >= 0; ) {
                this._buf[i] = _empty();
            }
        } else {
            this._buf.fill(_empty);
        }
    }

    /**
     * Returns the delayed value at current read position (i.e. `n`
     * samples behind current write pos).
     */
    deref(): T {
        return this._buf[this._rpos];
    }

    /**
     * Reads value at `t` relative to current write position. `t` should
     * be in `[-(n-1)..0)` interval. E.g. `tap(-1)` returns the second
     * most recent value written.
     *
     * @param t
     */
    tap(t: number) {
        const n = this._buf.length;
        t = t + this._wpos;
        t = t < 0 ? t + n : t >= n ? t - n : t;
        return this._buf[t | 0];
    }

    /**
     * Progresses read & write pos, stores & returns new value.
     *
     * @param x
     */
    next(x: T) {
        this.step();
        this._buf[this._wpos] = x;
        return x;
    }

    /**
     * Moves read & write cursors one step forward. Useful for skipping
     * elements and/or to create gaps in the delay line.
     */
    step() {
        const n = this._buf.length;
        ++this._wpos >= n && (this._wpos -= n);
        ++this._rpos >= n && (this._rpos -= n);
    }
}
