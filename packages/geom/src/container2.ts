import { IObjectOf } from "@thi.ng/api/api";
import { illegalArgs } from "@thi.ng/errors/illegal-arguments";
import { Mat23 } from "@thi.ng/vectors/mat23";
import { Vec2, vec2 } from "@thi.ng/vectors/vec2";
import {
    CollateOpts,
    IBounds,
    ICentroid,
    ICollate,
    IVertices
} from "./api";
import { bounds } from "./func/bounds";
import { convexHull2 } from "./func/convex-hull";

export class PointContainer2 implements
    IBounds<Vec2[]>,
    ICentroid<Vec2>,
    ICollate,
    IVertices<Vec2, void> {

    points: Vec2[];
    attribs: IObjectOf<any>;

    constructor(pts: Vec2[], attribs?: IObjectOf<any>) {
        this.points = pts;
        this.attribs = attribs;
    }

    *[Symbol.iterator]() {
        yield* this.vertices();
    }

    collate(opts?: Partial<CollateOpts>) {
        opts = {
            start: 0,
            cstride: 1,
            estride: 2,
            ...opts
        };
        const { start, cstride, estride } = opts;
        const pts = this.points;
        const n = pts.length;
        const buf = Vec2.intoBuffer(
            opts.buf || new Array(start + n * estride).fill(0),
            pts,
            start,
            cstride,
            estride
        );
        for (let i = 0; i < n; i++) {
            const p = pts[i];
            p.buf = buf;
            p.i = start + i * estride;
            p.s = cstride;
        }
        return buf;
    }

    vertices() {
        return this.points;
    }

    bounds() {
        return bounds(this.points, Vec2.MAX.copy(), Vec2.MIN.copy());
    }

    width() {
        const b = this.bounds();
        return b[1].x - b[0].x;
    }

    height() {
        const b = this.bounds();
        return b[1].y - b[0].y;
    }

    depth() {
        return 0;
    }

    convextHull() {
        return convexHull2(this.points);
    }

    centroid(c?: Vec2): Vec2 {
        const pts = this.points;
        const num = pts.length;
        !num && illegalArgs("no points available");
        !c && (c = vec2());
        for (let i = num; --i >= 0;) {
            c.add(pts[i]);
        }
        return c.divN(num);
    }

    center(origin?: Readonly<Vec2>) {
        const d = this.centroid().neg();
        return this.translate(origin ? d.add(origin) : d);
    }

    flip() {
        this.points.reverse();
    }

    scale(v: Readonly<Vec2>) {
        const pts = this.points;
        for (let i = pts.length; --i >= 0;) {
            pts[i].mul(v);
        }
        return this;
    }

    translate(v: Readonly<Vec2>) {
        const pts = this.points;
        for (let i = pts.length; --i >= 0;) {
            pts[i].add(v);
        }
        return this;
    }

    transform(mat: Readonly<Mat23>) {
        const pts = this.points;
        for (let i = pts.length; --i >= 0;) {
            mat.mulV(pts[i]);
        }
        return this;
    }

    protected _copy() {
        return Vec2.mapBuffer(Vec2.intoBuffer([], this.points), this.points.length);
    }

    protected _toJSON(type: string) {
        return {
            type,
            attribs: this.attribs,
            points: this.points.map((p) => p.toJSON())
        };
    }

    protected _toHiccup(type: string) {
        return [type, this.attribs, this.vertices()];
    }
}
