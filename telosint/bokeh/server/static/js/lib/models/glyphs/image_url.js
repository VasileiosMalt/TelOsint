import { XYGlyph, XYGlyphView } from "./xy_glyph";
import { NumberArray } from "../../core/types";
import * as p from "../../core/properties";
import { map, minmax } from "../../core/util/arrayable";
import { ImageLoader } from "../../core/util/image";
export class ImageURLView extends XYGlyphView {
    constructor() {
        super(...arguments);
        this._images_rendered = false;
    }
    initialize() {
        super.initialize();
        this.connect(this.model.properties.global_alpha.change, () => this.renderer.request_render());
    }
    _index_data(index) {
        const { data_size } = this;
        for (let i = 0; i < data_size; i++) {
            // TODO: add a proper implementation (same as ImageBase?)
            index.add_empty();
        }
    }
    _set_data() {
        if (this.image == null || this.image.length != this._url.length)
            this.image = map(this._url, () => null);
        const { retry_attempts, retry_timeout } = this.model;
        for (let i = 0, end = this._url.length; i < end; i++) {
            const url = this._url[i];
            if (url == null || url == "")
                continue;
            new ImageLoader(url, {
                loaded: (image) => {
                    this.image[i] = image;
                    this.renderer.request_render();
                },
                attempts: retry_attempts + 1,
                timeout: retry_timeout,
            });
        }
        const w_data = this.model.properties.w.units == "data";
        const h_data = this.model.properties.h.units == "data";
        const n = this._x.length;
        const xs = new NumberArray(w_data ? 2 * n : n);
        const ys = new NumberArray(h_data ? 2 * n : n);
        const { anchor } = this.model;
        function x0x1(x, w) {
            switch (anchor) {
                case "top_left":
                case "bottom_left":
                case "center_left":
                    return [x, x + w];
                case "top_center":
                case "bottom_center":
                case "center":
                    return [x - w / 2, x + w / 2];
                case "top_right":
                case "bottom_right":
                case "center_right":
                    return [x - w, x];
            }
        }
        function y0y1(y, h) {
            switch (anchor) {
                case "top_left":
                case "top_center":
                case "top_right":
                    return [y, y - h];
                case "bottom_left":
                case "bottom_center":
                case "bottom_right":
                    return [y + h, y];
                case "center_left":
                case "center":
                case "center_right":
                    return [y + h / 2, y - h / 2];
            }
        }
        // if the width/height are in screen units, don't try to include them in bounds
        if (w_data) {
            for (let i = 0; i < n; i++) {
                [xs[i], xs[n + i]] = x0x1(this._x[i], this._w[i]);
            }
        }
        else
            xs.set(this._x, 0);
        if (h_data) {
            for (let i = 0; i < n; i++) {
                [ys[i], ys[n + i]] = y0y1(this._y[i], this._h[i]);
            }
        }
        else
            ys.set(this._y, 0);
        const [x0, x1] = minmax(xs);
        const [y0, y1] = minmax(ys);
        this._bounds_rect = { x0, x1, y0, y1 };
    }
    has_finished() {
        return super.has_finished() && this._images_rendered == true;
    }
    _map_data() {
        // Better to check this.model.w and this.model.h for null since the set_data
        // machinery will have converted this._w and this._w to lists of null
        const ws = this.model.w != null ? this._w : map(this._x, () => NaN);
        const hs = this.model.h != null ? this._h : map(this._x, () => NaN);
        switch (this.model.properties.w.units) {
            case "data": {
                this.sw = this.sdist(this.renderer.xscale, this._x, ws, "edge", this.model.dilate);
                break;
            }
            case "screen": {
                this.sw = ws;
                break;
            }
        }
        switch (this.model.properties.h.units) {
            case "data": {
                this.sh = this.sdist(this.renderer.yscale, this._y, hs, "edge", this.model.dilate);
                break;
            }
            case "screen": {
                this.sh = hs;
                break;
            }
        }
    }
    _render(ctx, indices, { image, sx, sy, sw, sh, _angle }) {
        // TODO (bev): take actual border width into account when clipping
        const { frame } = this.renderer.plot_view;
        ctx.rect(frame.bbox.left + 1, frame.bbox.top + 1, frame.bbox.width - 2, frame.bbox.height - 2);
        ctx.clip();
        let finished = true;
        for (const i of indices) {
            if (isNaN(sx[i] + sy[i] + _angle[i]))
                continue;
            const img = image[i];
            if (img == null) {
                finished = false;
                continue;
            }
            this._render_image(ctx, i, img, sx, sy, sw, sh, _angle);
        }
        if (finished && !this._images_rendered) {
            this._images_rendered = true;
            this.notify_finished();
        }
    }
    _final_sx_sy(anchor, sx, sy, sw, sh) {
        switch (anchor) {
            case 'top_left': return [sx, sy];
            case 'top_center': return [sx - (sw / 2), sy];
            case 'top_right': return [sx - sw, sy];
            case 'center_right': return [sx - sw, sy - (sh / 2)];
            case 'bottom_right': return [sx - sw, sy - sh];
            case 'bottom_center': return [sx - (sw / 2), sy - sh];
            case 'bottom_left': return [sx, sy - sh];
            case 'center_left': return [sx, sy - (sh / 2)];
            case 'center': return [sx - (sw / 2), sy - (sh / 2)];
        }
    }
    _render_image(ctx, i, image, sx, sy, sw, sh, angle) {
        if (isNaN(sw[i]))
            sw[i] = image.width;
        if (isNaN(sh[i]))
            sh[i] = image.height;
        const { anchor } = this.model;
        const [sxi, syi] = this._final_sx_sy(anchor, sx[i], sy[i], sw[i], sh[i]);
        ctx.save();
        ctx.globalAlpha = this.model.global_alpha;
        const sw2 = sw[i] / 2;
        const sh2 = sh[i] / 2;
        if (angle[i]) {
            ctx.translate(sxi, syi);
            //rotation about center of image
            ctx.translate(sw2, sh2);
            ctx.rotate(angle[i]);
            ctx.translate(-sw2, -sh2);
            ctx.drawImage(image, 0, 0, sw[i], sh[i]);
            ctx.translate(sw2, sh2);
            ctx.rotate(-angle[i]);
            ctx.translate(-sw2, -sh2);
            ctx.translate(-sxi, -syi);
        }
        else
            ctx.drawImage(image, sxi, syi, sw[i], sh[i]);
        ctx.restore();
    }
    bounds() {
        return this._bounds_rect;
    }
}
ImageURLView.__name__ = "ImageURLView";
export class ImageURL extends XYGlyph {
    constructor(attrs) {
        super(attrs);
    }
    static init_ImageURL() {
        this.prototype.default_view = ImageURLView;
        this.define({
            url: [p.StringSpec],
            anchor: [p.Anchor, 'top_left'],
            global_alpha: [p.Number, 1.0],
            angle: [p.AngleSpec, 0],
            w: [p.DistanceSpec],
            h: [p.DistanceSpec],
            dilate: [p.Boolean, false],
            retry_attempts: [p.Number, 0],
            retry_timeout: [p.Number, 0],
        });
    }
}
ImageURL.__name__ = "ImageURL";
ImageURL.init_ImageURL();
//# sourceMappingURL=image_url.js.map