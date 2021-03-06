'use strict';
const _ = require('underscore');
const {createMongoZipkinClient} = require('gridvo-common-js');
const {DataSource} = require('../../domain');
const {tracer} = require('../../util');

class Repository {
    constructor() {
        this._dbName = "Data";
        this._collectionName = "DataSource";
        this._serviceName = "data-collect";
    }

    save(dataSource, traceContext, callback) {
        let mongoClient = createMongoZipkinClient({
            tracer,
            traceContext,
            dbName: this._dbName,
            collectionName: this._collectionName,
            serviceName: this._serviceName
        });
        mongoClient.then(({db, collection}) => {
            let {dataSourceID, dataType, station, lessee, config}=dataSource;
            let updateOperations = {
                dataType,
                station,
                lessee,
                config
            };
            collection.updateOne({
                    dataSourceID
                },
                {
                    $set: updateOperations
                },
                {
                    upsert: true
                },
                (err, result) => {
                    if (err) {
                        callback(err);
                        db.close();
                        return;
                    }
                    if (result.result.n == 0) {
                        callback(null, false);
                    }
                    else {
                        callback(null, true);
                    }
                    db.close();
                });
        }).catch(err => {
            callback(err);
        });
    }

    getDataSourceByID(dataSourceID, traceContext, callback) {
        let mongoClient = createMongoZipkinClient({
            tracer,
            traceContext,
            dbName: this._dbName,
            collectionName: this._collectionName,
            serviceName: this._serviceName
        });
        mongoClient.then(({db, collection}) => {
            collection.findOne({dataSourceID}, {limit: 1}, (err, document) => {
                    if (err) {
                        callback(err, null);
                        db.close();
                        return;
                    }
                    if (_.isNull(document)) {
                        callback(null, null);
                        db.close();
                        return;
                    }
                    let dataSource = new DataSource(document);
                    callback(null, dataSource);
                    db.close();
                }
            );
        }).catch(err => {
            callback(err);
        });
    }

    delDataSourceByID(dataSourceID, traceContext, callback) {
        let mongoClient = createMongoZipkinClient({
            tracer,
            traceContext,
            dbName: this._dbName,
            collectionName: this._collectionName,
            serviceName: this._serviceName
        });
        mongoClient.then(({db, collection}) => {
            collection.deleteOne({dataSourceID},
                {limit: 1},
                (err, result) => {
                    if (err) {
                        callback(err);
                        db.close();
                        return;
                    }
                    if (result.result.n == 0) {
                        callback(null, false);
                    }
                    else {
                        callback(null, true);
                    }
                    db.close();
                }
            );
        }).catch(err => {
            callback(err);
        });
    }

    getDataSourcesByQueryOpts(queryOpts, traceContext, callback) {
        let mongoClient = createMongoZipkinClient({
            tracer,
            traceContext,
            dbName: this._dbName,
            collectionName: this._collectionName,
            serviceName: this._serviceName
        });
        let match = queryOpts;
        mongoClient.then(({db, collection}) => {
            collection.aggregate([{
                    $match: match
                }, {
                    $project: {
                        "dataSourceID": 1,
                        "dataType": 1,
                        "station": 1,
                        "lessee": 1,
                        "config": 1,
                        "_id": 0
                    }
                }], (err, result) => {
                    if (err) {
                        callback(err, null);
                        db.close();
                        return;
                    }
                    let dataSources = [];
                    for (let data of result) {
                        let dataSource = new DataSource(data);
                        dataSources.push(dataSource);
                    }
                    callback(null, dataSources);
                    db.close();
                }
            );
        }).catch(err => {
            callback(err);
        });
    }
}

module.exports = Repository;