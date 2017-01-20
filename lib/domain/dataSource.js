'use strict';

class DataSource {
    constructor({dataSourceID, station, lessee}) {
        this._id = dataSourceID;
        this._station = station;
        this._lessee = lessee;
    }

    get dataSourceID() {
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