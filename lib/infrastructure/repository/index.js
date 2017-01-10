'use strict';
const MongoDBDataSourceRepository = require("./mongoDBDataSourceRepository");
const MongoDBDataPointRepository = require("./mongoDBDataPointRepository");

let mongoDBDataSourceRepository = null;
function createDataSourceRepository(single = true) {
    if (single && mongoDBDataSourceRepository) {
        return mongoDBDataSourceRepository;
    }
    mongoDBDataSourceRepository = new MongoDBDataSourceRepository();
    return mongoDBDataSourceRepository;
};

let mongoDBDataPointRepository = null;
function createDataPointRepository(single = true) {
    if (single && mongoDBDataPointRepository) {
        return mongoDBDataPointRepository;
    }
    mongoDBDataPointRepository = new MongoDBDataPointRepository();
    return mongoDBDataPointRepository;
};

module.exports = {
    createDataSourceRepository,
    createDataPointRepository
};