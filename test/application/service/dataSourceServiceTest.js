'use strict';
const _ = require('underscore');
const should = require('should');
const muk = require('muk');
const DataSourceService = require('../../../lib/application/service/dataSourceService');

describe('DataSourceService use case test', ()=> {
    let service;
    before(()=> {
        service = new DataSourceService();
    });
    describe('#getDataSource(dataSourceID, traceContext, callback)', ()=> {
        context('get data source', ()=> {
            it('if no data source id return null', done=> {
                service.getDataSource(null, {}, (err, dataSourceJSON)=> {
                    if (err) {
                        done(err);
                    }
                    _.isNull(dataSourceJSON).should.be.eql(true);
                    done();
                });
            });
            it('return dataSourceJSON', done=> {
                let mockDataSourceRepository = {};
                mockDataSourceRepository.getDataSourceByID = (dataSourceID, {}, callback)=> {
                    callback(null, {
                        id: "/station/datatype/other",
                        station: "stationID",
                        lessee: "lesseeID"
                    });
                };
                muk(service, "_dataSourceRepository", mockDataSourceRepository);
                service.getDataSource("data-source-id", {}, (err, dataSourceJSON)=> {
                    if (err) {
                        done(err);
                    }
                    dataSourceJSON.id.should.be.eql("/station/datatype/other");
                    done();
                });
            });
        });
        context('register data source', ()=> {
            it('if data source data no "id station lessee",is fail', done=> {
                let dataSourceData = {};
                service.registerDataSource(dataSourceData, {}, (err, isSuccess)=> {
                    if (err) {
                        done(err);
                    }
                    isSuccess.should.be.eql(false);
                    done();
                });
            });
            it('if data source already existed,is fail', done=> {
                let mockDataSourceRepository = {};
                mockDataSourceRepository.getDataSourceByID = (dataSourceID, {}, callback)=> {
                    callback(null, {});
                };
                muk(service, "_dataSourceRepository", mockDataSourceRepository);
                let dataSourceData = {
                    id: "/station/datatype/other",
                    station: "stationID",
                    lessee: "lesseeID"
                };
                service.registerDataSource(dataSourceData, {}, (err, isSuccess)=> {
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
                    callback(null, null);
                };
                mockDataSourceRepository.save = (dataSource, {}, callback)=> {
                    callback(null, true);
                };
                muk(service, "_dataSourceRepository", mockDataSourceRepository);
                let dataSourceData = {
                    id: "/station/datatype/other",
                    station: "stationID",
                    lessee: "lesseeID"
                };
                service.registerDataSource(dataSourceData, {}, (err, isSuccess)=> {
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