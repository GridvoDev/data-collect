'use strict';
const _ = require('underscore');
const co = require('co');
const {DataSource} = require('../../domain/');
const {createDataSourceRepository, createMessageProducer} = require('../../infrastructure/');

class Service {
    constructor() {
        this._dataSourceRepository = createDataSourceRepository();
        this._messageProducer = createMessageProducer();
    }

    getDataSource(dataSourceID, traceContext, callback) {
        if (!dataSourceID) {
            callback(null, null);
            return;
        }
        this._dataSourceRepository.getDataSourceByID(dataSourceID, traceContext, (err, dataSource) => {
            if (err) {
                callback(err);
                return;
            }
            if (!dataSource) {
                callback(null, null);
                return;
            }
            let {dataSourceID, station, lessee} = dataSource;
            callback(null, {dataSourceID, station, lessee});
        });
    }

    registerDataSource(dataSourceData, traceContext, callback) {
        if (!dataSourceData || !dataSourceData.dataSourceID || !dataSourceData.station || !dataSourceData.lessee) {
            callback(null, false);
            return;
        }

        let self = this;

        function getDataSourceFromRepository() {
            return new Promise((resolve, reject) => {
                self._dataSourceRepository.getDataSourceByID(dataSourceData.id, traceContext, (err, dataSource) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(dataSource);
                });
            });
        }

        function saveDataSource(dataSource) {
            return new Promise((resolve, reject) => {
                self._dataSourceRepository.save(dataSource, traceContext, (err, isSuccess) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(isSuccess);
                });
            });
        }

        function produceDataSourceAddedMessage(message) {
            return new Promise((resolve, reject) => {
                self._messageProducer.produceDataSourceAddedTopicMessage(message, traceContext, (err, data) => {
                    if (err) {
                        reject(err);
                    }
                    if (data) {
                        resolve(true);
                    }
                    else {
                        resolve(false);
                    }
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
            if (!isSuccess) {
                return false;
            }
            let {dataSourceID:id, station, lessee} = dataSourceData;
            let message = {id, station, lessee};
            isSuccess = yield produceDataSourceAddedMessage(message);
            return isSuccess
        };
        co(registerDataSource).then((isSuccess) => {
            callback(null, isSuccess);
        }).catch(err => {
            callback(err);
        });
    }

    getDataSources(queryOpts = {}, traceContext, callback) {
        this._dataSourceRepository.getDataSourcesByQueryOpts(queryOpts, traceContext, (err, dataSources) => {
            if (err) {
                callback(err);
                return;
            }
            let dataSourcesJSON = [];
            for (let dataSource of dataSources) {
                let {dataSourceID, station, lessee} = dataSource;
                dataSourcesJSON.push({dataSourceID, station, lessee});
            }
            callback(null, dataSourcesJSON);
        });
    }
}
module.exports = Service;