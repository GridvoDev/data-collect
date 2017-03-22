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
            let {dataSourceID, dataType, station, lessee, config} = dataSource;
            callback(null, {dataSourceID, dataType, station, lessee, config});
        });
    }

    registerDataSource(dataSourceData, traceContext, callback) {
        if (!dataSourceData || !dataSourceData.dataSourceID || !dataSourceData.dataType || !dataSourceData.station || !dataSourceData.lessee || !dataSourceData.config) {
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
            let {dataSourceID:id, dataType, station, lessee} = dataSourceData;
            let message = {id, dataType, station, lessee};
            isSuccess = yield produceDataSourceAddedMessage(message);
            return isSuccess
        };
        co(registerDataSource).then((isSuccess) => {
            callback(null, isSuccess);
        }).catch(err => {
            callback(err);
        });
    }

    removeDataSource(dataSourceID, traceContext, callback) {
        if (!dataSourceID) {
            callback(null, false);
            return;
        }

        let self = this;

        function delDataSourceFromRepository() {
            return new Promise((resolve, reject) => {
                self._dataSourceRepository.delDataSourceByID(dataSourceID, traceContext, (err, isSuccess) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(isSuccess);
                });
            });
        }

        function produceDataSourceDeletedMessage(message) {
            return new Promise((resolve, reject) => {
                self._messageProducer.produceDataSourceDeletedTopicMessage(message, traceContext, (err, data) => {
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

        function* removeDataSource() {
            let isSuccess = yield delDataSourceFromRepository();
            if (!isSuccess) {
                return false;
            }
            let message = {dataSourceID};
            isSuccess = yield produceDataSourceDeletedMessage(message);
            return isSuccess
        };
        co(removeDataSource).then((isSuccess) => {
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
                let {dataSourceID, dataType, station, lessee, config} = dataSource;
                dataSourcesJSON.push({dataSourceID, dataType, station, lessee, config});
            }
            callback(null, dataSourcesJSON);
        });
    }

    updateDataSourceConfig(dataSourceID, configs, traceContext, callback) {
        if (!dataSourceID || !configs) {
            callback(null, null);
            return;
        }

        let self = this;

        function getDataSourceFromRepository() {
            return new Promise((resolve, reject) => {
                self._dataSourceRepository.getDataSourceByID(dataSourceID, traceContext, (err, dataSource) => {
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

        function produceDataSourceConfigMessage(message) {
            return new Promise((resolve, reject) => {
                self._messageProducer.produceDataSourceConfigTopicMessage(message, traceContext, (err, data) => {
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

        function* updateDataSourceConfig() {
            let dataSource = yield getDataSourceFromRepository();
            if (!dataSource) {
                return null;
            }
            let _configs = dataSource.config;
            for (let key of _.keys(configs)) {
                _configs[key] = configs[key];
            }
            dataSource.config = _configs;
            let isSuccess = yield saveDataSource(dataSource);
            if (!isSuccess) {
                return null;
            }
            let message = {dataSourceID: dataSourceID, configs};
            isSuccess = yield produceDataSourceConfigMessage(message);
            if (!isSuccess) {
                return null;
            }
            else {
                return configs;
            }
        };
        co(updateDataSourceConfig).then((updatedConfigs) => {
            callback(null, updatedConfigs);
        }).catch(err => {
            callback(err);
        });
    }
}
module.exports = Service;