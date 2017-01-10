'use strict';

class DataPoint {
    constructor({s, t, v}) {
        this._s = s;
        this._t = t;
        this._v = v;
    }

    get s() {
        return this._s;
    }

    get t() {
        return this._t;
    }

    get v() {
        return this._v;
    }
}

module.exports = DataPoint;