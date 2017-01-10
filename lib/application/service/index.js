'use strict';
const DataPointCollectService = require("./dataPointCollectService");
const DataSourceService = require("./dataSourceService");

let dataPointCollectService = null;
function createDataPointCollectService(single = true) {
    if (single && dataPointCollectService) {
        return dataPointCollectService;
    }
    dataPointCollectService = new DataPointCollectService();
    return dataPointCollectService;
};

let dataSourceService = null;
function createDataSourceService(single = true) {
    if (single && dataSourceService) {
        return dataSourceService;
    }
    dataSourceService = new DataSourceService();
    return dataSourceService;
};

module.exports = {
    createDataPointCollectService,
    createDataSourceService
};