const _ = require('underscore');
const co = require('co');
const should = require('should');
const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const dataSourceRouter = require('../../../lib/express/routes/dataSource');
const {expressZipkinMiddleware, createZipkinTracer} = require("gridvo-common-js");

describe('dataSourceRouter use case test', ()=> {
    let app;
    let server;
    before(done=> {
        function setupExpress() {
            return new Promise((resolve, reject)=> {
                app = express();
                app.use(bodyParser.json());
                app.use(expressZipkinMiddleware({
                    tracer: createZipkinTracer({}),
                    serviceName: 'test-service'
                }));
                app.use('/data-sources', dataSourceRouter);
                let mockDataSourceService = {};
                mockDataSourceService.registerDataSource = function (dataSourceData, traceContext, callback) {
                    if (!dataSourceData || !dataSourceData.id || !dataSourceData.station || !dataSourceData.lessee) {
                        callback(null, false);
                        return;
                    }
                    callback(null, true);
                }
                mockDataSourceService.getDataSource = function (dataSourceID, traceContext, callback) {
                    if (dataSourceID == "no-data-source") {
                        callback(null, null);
                        return;
                    }
                    callback(null, {
                        id: "station-type-other",
                        station: "stationID",
                        lessee: "lesseeID"
                    });
                }
                app.set('dataSourceService', mockDataSourceService);
                server = app.listen(3001, err=> {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        };
        function* setup() {
            yield setupExpress();
        };
        co(setup).then(()=> {
            done();
        }).catch(err=> {
            done(err);
        });
    });
    describe('#get:/data-sources/:dataSourceID', ()=> {
        context('get a data source', ()=> {
            it('should response fail if no this data source', done=> {
                request(server)
                    .get(`/data-sources/no-data-source`)
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .end((err, res)=> {
                        if (err) {
                            done(err);
                            return;
                        }
                        res.body.errcode.should.be.eql(400);
                        res.body.errmsg.should.be.eql("fail");
                        done();
                    });
            });
            it('should response ok', done=> {
                request(server)
                    .get(`/data-sources/station-type-other`)
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .end((err, res)=> {
                        if (err) {
                            done(err);
                            return;
                        }
                        res.body.errcode.should.be.eql(0);
                        res.body.errmsg.should.be.eql("ok");
                        res.body.dataSource.id.should.be.eql("station-type-other");
                        done();
                    });
            });
        });
    });
    describe('#post:/data-sources', ()=> {
        context('add a data source', ()=> {
            it('should response fail', done=> {
                request(server)
                    .post(`/data-sources`)
                    .send({})
                    .set('Accept', 'application/json')
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .end((err, res)=> {
                        if (err) {
                            done(err);
                            return;
                        }
                        res.body.errcode.should.be.eql(400);
                        res.body.errmsg.should.be.eql("fail");
                        done();
                    });
            });
            it('should response ok', done=> {
                request(server)
                    .post(`/data-sources`)
                    .send({
                        id: "/station/type/other",
                        station: "stationID",
                        lessee: "lesseeID"
                    })
                    .set('Accept', 'application/json')
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .end((err, res)=> {
                        if (err) {
                            done(err);
                            return;
                        }
                        res.body.errcode.should.be.eql(0);
                        res.body.errmsg.should.be.eql("ok");
                        done();
                    });
            });
        });
    });
    after(done=> {
        function teardownExpress() {
            return new Promise((resolve, reject)=> {
                server.close(err=> {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        };
        function* teardown() {
            yield teardownExpress();
        };
        co(teardown).then(()=> {
            done();
        }).catch(err=> {
            done(err);
        });
    });
});