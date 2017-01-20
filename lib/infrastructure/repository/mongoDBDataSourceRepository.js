'use strict';
const _ = require('underscore');
const {createMongoZipkinClient} = require('gridvo-common-js');
const {DataSource} = require('../../domain');
const {tracer} = require('../../util');

class Repository {
    constructor() {
        this._dbName = "DataCollect";
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
        mongoClient.then(({db, collection})=> {
            let {dataSourceID, station, lessee}=dataSource;
            let updateOperations = {
                station,
                lessee
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
                (err, result)=> {
                    if (err) {
                        callback(err);
                        db.close();
                        return;
                    }
                    if (result.result.n == 1) {
                        callback(null, true);
                    }
                    else {
                        callback(null, false);
                    }
                    db.close();
                });
        }).catch(err=> {
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
        mongoClient.then(({db, collection})=> {
            collection.findOne({dataSourceID}, {limit: 1}, (err, document)=> {
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
        }).catch(err=> {
            callback(err);
        });
    }
}

module.exports = Repository;