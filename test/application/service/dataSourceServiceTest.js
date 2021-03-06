'use strict';
const _ = require('underscore');
const should = require('should');
const muk = require('muk');
const DataSourceService = require('../../../lib/application/service/dataSourceService');
const DataSource = require('../../../lib/domain/dataSource');

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
                    callback(null, new DataSource({
                        dataSourceID: "station-datatype-other",
                        dataType: "dataType",
                        station: "stationID",
                        lessee: "lesseeID",
                        config: {FWJ: 60}
                    }));
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
                    should.exist(dataSourceJSON.config);
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
                    lessee: "lesseeID",
                    config: {FWJ: 60}
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
                    lessee: "lesseeID",
                    config: {FWJ: 60}
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
                    lessee: "lesseeID",
                    config: {FWJ: 60}
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
                    callback(null, [new DataSource({
                        dataSourceID: "station-datatype-other",
                        dataType: "dataType",
                        station: "stationID",
                        lessee: "lesseeID",
                        config: {FWJ: 60}
                    })]);
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
    describe('#removeDataSource(dataSourceID, traceContext, callback)', () => {
        context('remove data source', () => {
            it('if no data source return false', done => {
                let mockDataSourceRepository = {};
                mockDataSourceRepository.delDataSourceByID = (dataSourceID, traceContext, callback) => {
                    callback(null, false);
                };
                muk(service, "_dataSourceRepository", mockDataSourceRepository);
                service.removeDataSource("no-data-source", {}, (err, isSuccess) => {
                    if (err) {
                        done(err);
                    }
                    isSuccess.should.be.eql(false);
                    done();
                });
            });
            it('is return false if produce "data-source-deleted" topic message fail', done => {
                let mockDataSourceRepository = {};
                mockDataSourceRepository.delDataSourceByID = (dataSourceID, traceContext, callback) => {
                    callback(null, true);
                };
                muk(service, "_dataSourceRepository", mockDataSourceRepository);
                let mockMessageProducer = {};
                mockMessageProducer.produceDataSourceDeletedTopicMessage = (message, traceContext, callback) => {
                    callback(null, null);
                };
                muk(service, "_messageProducer", mockMessageProducer);
                service.removeDataSource("data-source-id", {}, (err, isSuccess) => {
                    if (err) {
                        done(err);
                    }
                    isSuccess.should.be.eql(false);
                    done();
                });
            });
            it('is return true if all ok', done => {
                let mockDataSourceRepository = {};
                mockDataSourceRepository.delDataSourceByID = (dataSourceID, traceContext, callback) => {
                    callback(null, true);
                };
                muk(service, "_dataSourceRepository", mockDataSourceRepository);
                let mockMessageProducer = {};
                mockMessageProducer.produceDataSourceDeletedTopicMessage = (message, traceContext, callback) => {
                    callback(null, {});
                };
                muk(service, "_messageProducer", mockMessageProducer);
                service.removeDataSource("data-source-id", {}, (err, isSuccess) => {
                    if (err) {
                        done(err);
                    }
                    isSuccess.should.be.eql(true);
                    done();
                });
            });
        });
    });
    describe('#updateDataSourceConfig(dataSourceID, configs, traceContext, callback)', () => {
        context('update data source configs', () => {
            it('if no data source id,updated configs return null', done => {
                let dataSourceID = null;
                service.updateDataSourceConfig(dataSourceID, {}, {}, (err, updatedConfigs) => {
                    if (err) {
                        done(err);
                    }
                    _.isNull(updatedConfigs).should.be.eql(true);
                    done();
                });
            });
            it('if repository save fail,updated configs return null', done => {
                let mockDataSourceRepository = {};
                mockDataSourceRepository.getDataSourceByID = (dataSourceID, traceContext, callback) => {
                    callback(null, new DataSource({
                        dataSourceID: "station-datatype-other",
                        dataType: "dataType",
                        station: "stationID",
                        lessee: "lesseeID",
                        config: {FWJ: 50}
                    }));
                };
                mockDataSourceRepository.save = (dataSource, traceContext, callback) => {
                    callback(null, false);
                };
                muk(service, "_dataSourceRepository", mockDataSourceRepository);
                let dataSourceID = "data-source-id";
                service.updateDataSourceConfig(dataSourceID, {}, {}, (err, updatedConfigs) => {
                    if (err) {
                        done(err);
                    }
                    _.isNull(updatedConfigs).should.be.eql(true);
                    done();
                });
            });
            it('updated configs return null if produce "data-source-config" topic message fail', done => {
                let mockDataSourceRepository = {};
                mockDataSourceRepository.getDataSourceByID = (dataSourceID, traceContext, callback) => {
                    callback(null, new DataSource({
                        dataSourceID: "station-datatype-other",
                        dataType: "dataType",
                        station: "stationID",
                        lessee: "lesseeID",
                        config: {FWJ: 50}
                    }));
                };
                mockDataSourceRepository.save = (dataSource, traceContext, callback) => {
                    callback(null, true);
                };
                muk(service, "_dataSourceRepository", mockDataSourceRepository);
                let mockMessageProducer = {};
                mockMessageProducer.produceDataSourceConfigTopicMessage = (message, traceContext, callback) => {
                    callback(null, null);
                };
                muk(service, "_messageProducer", mockMessageProducer);
                let dataSourceID = "data-source-id";
                service.updateDataSourceConfig(dataSourceID, {FWJ: 90}, {}, (err, updatedConfigs) => {
                    if (err) {
                        done(err);
                    }
                    _.isNull(updatedConfigs).should.be.eql(true);
                    done();
                });
            });
            it('return updated configs, produce "data-source-config" topic message if all is ok', done => {
                let mockDataSourceRepository = {};
                mockDataSourceRepository.getDataSourceByID = (dataSourceID, traceContext, callback) => {
                    callback(null, new DataSource({
                        dataSourceID: "station-datatype-other",
                        dataType: "dataType",
                        station: "stationID",
                        lessee: "lesseeID",
                        config: {FWJ: 50}
                    }));
                };
                mockDataSourceRepository.save = (dataSource, traceContext, callback) => {
                    callback(null, true);
                };
                muk(service, "_dataSourceRepository", mockDataSourceRepository);
                let mockMessageProducer = {};
                mockMessageProducer.produceDataSourceConfigTopicMessage = (message, traceContext, callback) => {
                    callback(null, {});
                };
                muk(service, "_messageProducer", mockMessageProducer);
                let dataSourceID = "data-source-id";
                service.updateDataSourceConfig(dataSourceID, {FWJ: 90}, {}, (err, updatedConfigs) => {
                    if (err) {
                        done(err);
                    }
                    _.isNull(updatedConfigs).should.be.eql(false);
                    updatedConfigs.FWJ.should.be.eql(90);
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