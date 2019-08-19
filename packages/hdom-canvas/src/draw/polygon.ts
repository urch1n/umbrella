import { IObjectOf } from "@thi.ng/api";
import { ReadonlyVec } from "@thi.ng/vectors";
import { endShape } from "./end-shape";

export const polygon = (
    ctx: CanvasRenderingContext2D,
    attribs: IObjectOf<any>,
    pts: ReadonlyVec[]
) => {
    if (pts.length < 2) return;
    let p: ReadonlyVec = pts[0];
    ctx.beginPath();
    ctx.moveTo(p[0], p[1]);
    for (let i = 1, n = pts.length; i < n; i++) {
        p = pts[i];
        ctx.lineTo(p[0], p[1]);
    }
    ctx.closePath();
    endShape(ctx, attribs);
};