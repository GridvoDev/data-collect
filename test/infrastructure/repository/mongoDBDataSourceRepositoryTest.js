'use strict';
const MongoClient = require('mongodb').MongoClient;
const _ = require('underscore');
const should = require('should');
const DataSource = require('../../../lib/domain/dataSource');
const mongoDBDataSourceRepository = require('../../../lib/infrastructure/repository/mongoDBDataSourceRepository');

describe('mongoDBDataSourceRepository use case test', () => {
    let Repository;
    before(() => {
        Repository = new mongoDBDataSourceRepository();
    });
    describe('#save(dataSource, traceContext, cb)', () => {
        context('save a data source', () => {
            it('should return true if save success', done => {
                let dataSource = new DataSource({
                    dataSourceID: "station-rain-other",
                    dataType: "dataType",
                    station: "stationID",
                    lessee: "lesseeID",
                    config: {FWJ: 60}
                });
                Repository.save(dataSource, {}, (err, isSuccess) => {
                    if (err) {
                        done(err);
                    }
                    isSuccess.should.be.eql(true);
                    done();
                });
            });
        });
    });
    describe('#getDataSourceByID(id, traceContext, cb)', () => {
        context('get a data source for id', () => {
            it('should return null if no this data source', done => {
                let dataSourceID = "noDataSourceID";
                Repository.getDataSourceByID(dataSourceID, {}, (err, dataSource) => {
                    _.isNull(dataSource).should.be.eql(true);
                    done();
                });
            });
            it('should return data source', done => {
                let id = "station-rain-other";
                Repository.getDataSourceByID(id, {}, (err, dataSource) => {
                    dataSource.dataSourceID.should.be.eql("station-rain-other");
                    dataSource.dataType.should.be.eql("dataType");
                    dataSource.station.should.be.eql("stationID");
                    dataSource.lessee.should.be.eql("lesseeID");
                    dataSource.config.FWJ.should.be.eql(60);
                    done();
                });
            });
        });
    });
    describe('#getDataSourcesByQueryOpts(queryOpts, traceContext, cb)', () => {
        context('get data sources by queryOpts', () => {
            it('should return all data sources if queryOpts is {}', done => {
                let queryOpts = {};
                Repository.getDataSourcesByQueryOpts(queryOpts, {}, (err, dataSources) => {
                    dataSources.length.should.be.eql(1);
                    dataSources[0].dataSourceID.should.be.eql("station-rain-other");
                    dataSources[0].dataType.should.be.eql("dataType");
                    dataSources[0].station.should.be.eql("stationID");
                    dataSources[0].lessee.should.be.eql("lesseeID");
                    dataSources[0].config.FWJ.should.be.eql(60);
                    done();
                });
            });
            it('should return data sources for queryOpts', done => {
                let currentDoneCount = 0;

                function doneMore(err) {
                    currentDoneCount++;
                    if (currentDoneCount == 4) {
                        if (err) {
                            done(err);
                        }
                        else {
                            done();
                        }
                    }
                };
                let queryOpts = {dataType: "noDataType"};
                Repository.getDataSourcesByQueryOpts(queryOpts, {}, (err, dataSources) => {
                    dataSources.length.should.be.eql(0);
                    doneMore();
                });
                queryOpts = {dataType: "dataType"};
                Repository.getDataSourcesByQueryOpts(queryOpts, {}, (err, dataSources) => {
                    dataSources.length.should.be.eql(1);
                    doneMore();
                });
                queryOpts = {dataType: "dataType", station: "noStationID"};
                Repository.getDataSourcesByQueryOpts(queryOpts, {}, (err, dataSources) => {
                    dataSources.length.should.be.eql(0);
                    doneMore();
                });
                queryOpts = {dataType: "dataType", station: "stationID"};
                Repository.getDataSourcesByQueryOpts(queryOpts, {}, (err, dataSources) => {
                    dataSources.length.should.be.eql(1);
                    doneMore();
                });
            });
        });
        describe('#delDataSourceByID(dataSourceID, traceContext, cb)', () => {
            context('del a data source for id', () => {
                it('should return false if no this data source', done => {
                    let dataSourceID = "no-dataSource-id";
                    Repository.delDataSourceByID(dataSourceID, {}, (err, isSuccess) => {
                        isSuccess.should.be.eql(false);
                        done();
                    });
                });
                it('should return true', done => {
                    let dataSourceID = "station-rain-other";
                    Repository.delDataSourceByID(dataSourceID, {}, (err, isSuccess) => {
                        isSuccess.should.be.eql(true);
                        done();
                    });
                });
            });
        });
    });
    after(done => {
        let {MONGODB_SERVICE_HOST = "127.0.0.1", MONGODB_SERVICE_PORT = "27017"}= process.env;
        MongoClient.connect(`mongodb://${MONGODB_SERVICE_HOST}:${MONGODB_SERVICE_PORT}/Data`, (err, db) => {
            if (err) {
                done(err);
            }
            db.collection('DataSource').drop((err, response) => {
                if (err) {
                    done(err);
                }
                db.close();
                done();
            });
        });
    });
});