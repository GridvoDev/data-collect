'use strict';

class DataSource {
    constructor({dataSourceID, dataType, station, lessee, config = {}}) {
        this._id = dataSourceID;
        this._dataType = dataType;
        this._station = station;
        this._lessee = lessee;
        this._config = config;
    }

    get dataSourceID() {
        return this._id;
    }

    get dataType() {
        return this._dataType;
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

    get config() {
        return this._config;
    }

    set config(value) {
        this._config = value;
    }
}

module.exports = DataSource;