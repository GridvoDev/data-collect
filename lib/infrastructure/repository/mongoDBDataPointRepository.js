'use strict';
const _ = require('underscore');
const {createMongoZipkinClient} = require('gridvo-common-js');
const {DataPoint} = require('../../domain');
const {tracer} = require('../../util');

class Repository {
    constructor() {
        this._dbName = "Data";
        this._serviceName = "data-collect";
    }

    save(dataPoint, traceContext, callback) {
        let mongoClient = createMongoZipkinClient({
            tracer,
            traceContext,
            dbName: this._dbName,
            collectionName: dataPoint.s,
            serviceName: this._serviceName
        });
        mongoClient.then(({db, collection})=> {
            let {t, v}=dataPoint;
            let updateOperations = {
                v
            };
            collection.updateOne({
                    t
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
}

module.exports = Repository;