'use strict';
const _ = require('underscore');
const co = require('co');
const {DataSource} = require('../../domain/');
const {createDataSourceRepository} = require('../../infrastructure/');

class Service {
    constructor() {
        this._dataSourceRepository = createDataSourceRepository();
    }

    getDataSource(dataSourceID, traceContext, callback) {
        if (!dataSourceID) {
            callback(null, null);
            return;
        }
        this._dataSourceRepository.getDataSourceByID(dataSourceID, traceContext, (err, dataSource)=> {
            if (err) {
                callback(err);
                return;
            }
            if (!dataSource) {
                callback(null, null);
                return;
            }
            let {id, station, lessee} = dataSource;
            callback(null, {id, station, lessee});
        });
    }

    registerDataSource(dataSourceData, traceContext, callback) {
        if (!dataSourceData || !dataSourceData.id || !dataSourceData.station || !dataSourceData.lessee) {
            callback(null, false);
            return;
        }

        let self = this;

        function getDataSourceFromRepository() {
            return new Promise((resolve, reject)=> {
                self._dataSourceRepository.getDataSourceByID(dataSourceData.id, traceContext, (err, dataSource)=> {
                    if (err) {
                        reject(err);
                    }
                    resolve(dataSource);
                });
            });
        }

        function saveDataSource(dataSource) {
            return new Promise((resolve, reject)=> {
                self._dataSourceRepository.save(dataSource, traceContext, (err, isSuccess)=> {
                    if (err) {
                        reject(err);
                    }
                    resolve(isSuccess);
                });
            });
        }

        function* registerDataSource() {
            let dataSource = yield getDataSourceFromRepository();
            if (dataSource) {
                return false;
            }
            let newDataSource = new DataSource(dataSourceData);
            let isSuccess = yield saveDataSource(newDataSource);
            return isSuccess
        };
        co(registerDataSource).then((isSuccess)=> {
            callback(null, isSuccess);
        }).catch(err=> {
            callback(err);
        });
    }
}
module.exports = Service;