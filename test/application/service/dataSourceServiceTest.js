'use strict';
const _ = require('underscore');
const should = require('should');
const muk = require('muk');
const DataSourceService = require('../../../lib/application/service/dataSourceService');

describe('DataSourceService use case test', () => {
    let service;
    before(() => {
        service = new DataSourceService();
    });
    describe('#getDataSource(dataSourceID, traceContext, callback)', () => {
        context('get data source', () => {
            it('if no data source id return null', done => {
                service.getDataSource(null, {}, (err, dataSourceJSON) => {
                    if (err) {
                        done(err);
                    }
                    _.isNull(dataSourceJSON).should.be.eql(true);
                    done();
                });
            });
            it('return dataSourceJSON', done => {
                let mockDataSourceRepository = {};
                mockDataSourceRepository.getDataSourceByID = (dataSourceID, traceContext, callback) => {
                    callback(null, {
                        dataSourceID: "station-datatype-other",
                        dataType: "dataType",
                        station: "stationID",
                        lessee: "lesseeID"
                    });
                };
                muk(service, "_dataSourceRepository", mockDataSourceRepository);
                service.getDataSource("data-source-id", {}, (err, dataSourceJSON) => {
                    if (err) {
                        done(err);
                    }
                    dataSourceJSON.dataSourceID.should.be.eql("station-datatype-other");
                    dataSourceJSON.dataType.should.be.eql("dataType");
                    dataSourceJSON.station.should.be.eql("stationID");
                    dataSourceJSON.lessee.should.be.eql("lesseeID");
                    done();
                });
            });
        });
    });
    describe('#registerDataSource(dataSourceData, traceContext, callback)', () => {
        context('register data source', () => {
            it('if data source data no "id station lessee",is fail', done => {
                let dataSourceData = {};
                service.registerDataSource(dataSourceData, {}, (err, isSuccess) => {
                    if (err) {
                        done(err);
                    }
                    isSuccess.should.be.eql(false);
                    done();
                });
            });
            it('if data source already existed,is fail', done => {
                let mockDataSourceRepository = {};
                mockDataSourceRepository.getDataSourceByID = (dataSourceID, traceContext, callback) => {
                    callback(null, {});
                };
                muk(service, "_dataSourceRepository", mockDataSourceRepository);
                let dataSourceData = {
                    dataSourceID: "station-datatype-other",
                    dataType: "dataType",
                    station: "stationID",
                    lessee: "lesseeID"
                };
                service.registerDataSource(dataSourceData, {}, (err, isSuccess) => {
                    if (err) {
                        done(err);
                    }
                    isSuccess.should.be.eql(false);
                    done();
                });
            });
            it('is fail if produce "data-source-added" topic message fail', done => {
                let mockDataSourceRepository = {};
                mockDataSourceRepository.getDataSourceByID = (dataSourceID, traceContext, callback) => {
                    callback(null, null);
                };
                mockDataSourceRepository.save = (dataSource, traceContext, callback) => {
                    callback(null, true);
                };
                muk(service, "_dataSourceRepository", mockDataSourceRepository);
                let mockMessageProducer = {};
                mockMessageProducer.produceDataSourceAddedTopicMessage = (message, traceContext, callback) => {
                    callback(null, null);
                };
                muk(service, "_messageProducer", mockMessageProducer);
                let dataSourceData = {
                    dataSourceID: "station-datatype-other",
                    dataType: "dataType",
                    station: "stationID",
                    lessee: "lesseeID"
                };
                service.registerDataSource(dataSourceData, {}, (err, isSuccess) => {
                    if (err) {
                        done(err);
                    }
                    isSuccess.should.be.eql(false);
                    done();
                });
            });
            it('is success , produce "data-source-added" topic message', done => {
                let mockDataSourceRepository = {};
                mockDataSourceRepository.getDataSourceByID = (dataSourceID, traceContext, callback) => {
                    callback(null, null);
                };
                mockDataSourceRepository.save = (dataSource, {}, callback) => {
                    callback(null, true);
                };
                muk(service, "_dataSourceRepository", mockDataSourceRepository);
                let mockMessageProducer = {};
                mockMessageProducer.produceDataSourceAddedTopicMessage = (message, traceContext, callback) => {
                    callback(null, {});
                };
                muk(service, "_messageProducer", mockMessageProducer);
                let dataSourceData = {
                    dataSourceID: "station-datatype-other",
                    dataType: "dataType",
                    station: "stationID",
                    lessee: "lesseeID"
                };
                service.registerDataSource(dataSourceData, {}, (err, isSuccess) => {
                    if (err) {
                        done(err);
                    }
                    isSuccess.should.be.eql(true);
                    done();
                });
            });
        });
    });
    describe('#getDataSources(queryOpts={}, traceContext, callback)', () => {
        context('get data sources by queryOpts', () => {
            it('if queryOpts is {} ,return all data sources', done => {
                let mockDataSourceRepository = {};
                mockDataSourceRepository.getDataSourcesByQueryOpts = (queryOpts, traceContext, callback) => {
                    callback(null, [{
                        dataSourceID: "station-datatype-other",
                        dataType: "dataType",
                        station: "stationID",
                        lessee: "lesseeID"
                    }]);
                };
                muk(service, "_dataSourceRepository", mockDataSourceRepository);
                service.getDataSources({}, {}, (err, dataSourcesJSON) => {
                    if (err) {
                        done(err);
                    }
                    dataSourcesJSON.length.should.be.eql(1);
                    done();
                });
            });
        });
    });
    after(() => {
        muk.restore();
    });
})
;