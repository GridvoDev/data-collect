'use strict';

class DataSource {
    constructor({id, station, lessee}) {
        this._id = id;
        this._station = station;
        this._lessee = lessee;
    }

    get id() {
        return this._id;
    }

    get station() {
        return this._station;
    }

    set station(value) {
        this._station = value;
    }

    get lessee() {
        return this._lessee;
    }

    set lessee(value) {
        this._lessee = value;
    }
}

module.exports = DataSource;