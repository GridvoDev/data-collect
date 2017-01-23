'use strict';
const MongoClient = require('mongodb').MongoClient;
const _ = require('underscore');
const should = require('should');
const DataPoint = require('../../../lib/domain/dataPoint');
const mongoDBDataPointRepository = require('../../../lib/infrastructure/repository/mongoDBDataPointRepository');

describe('mongoDBDataPointRepository use case test', ()=> {
    let Repository;
    before(()=> {
        Repository = new mongoDBDataPointRepository();
    });
    describe('#save(dataPoint, traceContext, cb)', ()=> {
        context('save a data point', ()=> {
            it('should return true if save success', done=> {
                let dataPoint = new DataPoint({
                    s: "/station/rain/other",
                    t: new Date(),
                    v: 110
                });
                Repository.save(dataPoint, {}, (err, isSuccess)=> {
                    if (err) {
                        done(err);
                    }
                    isSuccess.should.be.eql(true);
                    done();
                });
            });
        });
    });
    after(done=> {
        let {MONGODB_SERVICE_HOST = "127.0.0.1", MONGODB_SERVICE_PORT = "27017"}= process.env;
        MongoClient.connect(`mongodb://${MONGODB_SERVICE_HOST}:${MONGODB_SERVICE_PORT}/Data`, (err, db)=> {
            if (err) {
                done(err);
            }
            db.collection('/station/rain/other').drop((err, response)=> {
                if (err) {
                    done(err);
                }
                db.close();
                done();
            });
        });
    });
});