'use strict';
const MongoClient = require('mongodb').MongoClient;
const _ = require('underscore');
const should = require('should');
const DataSource = require('../../../lib/domain/dataSource');
const mongoDBDataSourceRepository = require('../../../lib/infrastructure/repository/mongoDBDataSourceRepository');

describe('mongoDBDataSourceRepository use case test', ()=> {
    let Repository;
    before(()=> {
        Repository = new mongoDBDataSourceRepository();
    });
    describe('#save(dataSource, traceContext, cb)', ()=> {
        context('save a data source', ()=> {
            it('should return true if save success', done=> {
                let dataSource = new DataSource({
                    id: "/station/rain/other",
                    station: "stationID",
                    lessee: "lesseeID"
                });
                Repository.save(dataSource, {}, (err, isSuccess)=> {
                    if (err) {
                        done(err);
                    }
                    isSuccess.should.be.eql(true);
                    done();
                });
            });
        });
    });
    describe('#getDataSourceByID(id, traceContext, cb)', ()=> {
        context('get a data source for id', ()=> {
            it('should return null if no this data source', done=> {
                let dataSourceID = "noDataSourceID";
                Repository.getDataSourceByID(dataSourceID, {}, (err, dataSource)=> {
                    _.isNull(dataSource).should.be.eql(true);
                    done();
                });
            });
            it('should return data source', done=> {
                let id = "/station/rain/other";
                Repository.getDataSourceByID(id, {}, (err, dataSource)=> {
                    dataSource.id.should.be.eql("/station/rain/other");
                    dataSource.station.should.be.eql("stationID");
                    dataSource.lessee.should.be.eql("lesseeID");
                    done();
                });
            });
        });
    });
    after(done=> {
        let {MONGODB_SERVICE_HOST = "127.0.0.1", MONGODB_SERVICE_PORT = "27017"}= process.env;
        MongoClient.connect(`mongodb://${MONGODB_SERVICE_HOST}:${MONGODB_SERVICE_PORT}/DataCollect`, (err, db)=> {
            if (err) {
                done(err);
            }
            db.collection('DataSource').drop((err, response)=> {
                if (err) {
                    done(err);
                }
                db.close();
                done();
            });
        });
    });
});