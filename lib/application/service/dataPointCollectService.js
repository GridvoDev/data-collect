'use strict';
const _ = require('underscore');
const co = require('co');
const {DataPoint} = require('../../domain/');
const {createDataSourceRepository, createDataPointRepository} = require('../../infrastructure/');

class Service {
    constructor() {
        this._dataPointRepository = createDataPointRepository();
        this._dataSourceRepository = createDataSourceRepository();
    }

    receiveData(originalData, traceContext, callback) {
        if (!originalData || !originalData.s || !originalData.t || !originalData.v) {
            callback(null, false);
            return;
        }
        function transformOriginalDataToDataPoint() {
            let {s, t, v} = originalData;
            t = new Date(t);
            return new DataPoint({s, t, v});
        }

        let self = this;

        function getDataSourceFromRepository() {
            return new Promise((resolve, reject)=> {
                self._dataSourceRepository.getDataSourceByID(originalData.s, traceContext, (err, dataSource)=> {
                    if (err) {
                        reject(err);
                    }
                    resolve(dataSource);
                });
            });
        }

        function saveDataPoint(dataPoint) {
            return new Promise((resolve, reject)=> {
                self._dataPointRepository.save(dataPoint, traceContext, (err, isSuccess)=> {
                    if (err) {
                        reject(err);
                    }
                    resolve(isSuccess);
                });
            });
        }

        function* receiveData() {
            let dataSource = yield getDataSourceFromRepository();
            if (!dataSource) {
                return false;
            }
            let dataPoint = transformOriginalDataToDataPoint();
            let isSuccess = yield saveDataPoint(dataPoint);
            return isSuccess
        };
        co(receiveData).then((isSuccess)=> {
            callback(null, isSuccess);
        }).catch(err=> {
            callback(err);
        });
    }
}
module.exports = Service;