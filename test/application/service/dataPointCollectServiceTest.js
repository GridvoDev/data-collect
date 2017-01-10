'use strict';
const _ = require('underscore');
const should = require('should');
const muk = require('muk');
const DataPointCollectService = require('../../../lib/application/service/dataPointCollectService');

describe('DataPointCollectService use case test', ()=> {
    let service;
    before(()=> {
        service = new DataPointCollectService();
    });
    describe('#receiveData(originalData, traceContext, callback)', ()=> {
        context('receive original data', ()=> {
            it('if original data no "s t v",is fail', done=> {
                let originalData = {};
                service.receiveData(originalData, {}, (err, isSuccess)=> {
                    if (err) {
                        done(err);
                    }
                    isSuccess.should.be.eql(false);
                    done();
                });
            });
            it('if no this data source,is fail', done=> {
                let mockDataSourceRepository = {};
                mockDataSourceRepository.getDataSourceByID = (dataSourceID, {}, callback)=> {
                    callback(null, null);
                };
                muk(service, "_dataSourceRepository", mockDataSourceRepository);
                let originalData = {};
                originalData.s = "noDataSource";
                originalData.t = (new Date()).getTime();
                originalData.v = 1;
                service.receiveData(originalData, {}, (err, isSuccess)=> {
                    if (err) {
                        done(err);
                    }
                    isSuccess.should.be.eql(false);
                    done();
                });
            });
            it('is success', done=> {
                let mockDataSourceRepository = {};
                mockDataSourceRepository.getDataSourceByID = (dataSourceID, {}, callback)=> {
                    callback(null, {});
                };
                muk(service, "_dataSourceRepository", mockDataSourceRepository);
                let mockDataPointRepository = {};
                mockDataPointRepository.save = (dataPoint, {}, callback)=> {
                    callback(null, true);
                };
                muk(service, "_dataPointRepository", mockDataPointRepository);
                let originalData = {};
                originalData.s = "noDataSource";
                originalData.t = (new Date()).getTime();
                originalData.v = 1;
                service.receiveData(originalData, {}, (err, isSuccess)=> {
                    if (err) {
                        done(err);
                    }
                    isSuccess.should.be.eql(true);
                    done();
                });
            });
        });
    });
    after(()=> {
        muk.restore();
    });
});