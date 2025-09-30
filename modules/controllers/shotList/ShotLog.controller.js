const { getDataFromReqQuery } = require("../../../helper/general.tool");
const BaseController = require("../../_default/controller/Base.controller");
const { shotLogService } = require("../../services/shotList/index");

const getShotLogs = async (req, res) => {
    const { shotId } = req.params;
    const logs = await shotLogService.getShotLogList(shotId, req.query);
    return BaseController.ok(res, logs);
};

const getShotGeneralReport = async (req, res) => {
    const report = await shotLogService.getShoteReport(req.query);
    return BaseController.ok(res, report);
};

const getDailyLogReport = async (req, res) => {
    const query = getDataFromReqQuery(req);
    const report = await shotLogService.specificDayLogReport(query);
    return BaseController.ok(res, report);
};

const exportUserProjectsReport = async (req, res) => {
    const { exportType, userId } = req.params;
    const query = getDataFromReqQuery(req);
    let result = {};
    if (exportType === 'excel') {
        result = await shotLogService.exportExcelUserProjectsReport(userId, query);
    }
    return BaseController.ok(res, result);
};

const getUserProjectsReport = async (req, res) => {
    const { userId } = req.params;
    const query = getDataFromReqQuery(req);
    const report = await shotLogService.getUserProjectsReport(userId, query);
    return BaseController.ok(res, report);
};

const exportDailySummaryReport = async (req, res) => {
    const { exportType } = req.params;
    const query = getDataFromReqQuery(req);
    let result = {};
    if (exportType === 'excel') {
        result = await shotLogService.exportExcelDailyReport(query);
    }
    return BaseController.ok(res, result);
};

const getDailySummaryReport = async (req, res) => {
    const query = getDataFromReqQuery(req);
    const report = await shotLogService.getDailyReport(query);
    return BaseController.ok(res, report);
};

const createShotLog = async (req, res) => {
    const userId = req.user.id;
    const { shotId } = req.params;
    await shotLogService.createShotLog({ shotId, userId, body: req.body });
    return BaseController.ok(res);
};

module.exports = {
    getShotLogs,
    getShotGeneralReport,
    getDailyLogReport,
    exportUserProjectsReport,
    getUserProjectsReport,
    exportDailySummaryReport,
    getDailySummaryReport,
    createShotLog,
};