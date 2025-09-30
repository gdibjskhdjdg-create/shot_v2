const { getDataFromReqQuery } = require("../../../helper/general.tool");
const BaseController = require("../../_default/controller/Base.controller");
const ShotDefaultValueService = require("../../services/shotList/ShotDefaultValue.service");

const getDefaultValue = async (req, res) => {
    // Implementation for getting a single default value
};

const listAllDefaultValues = async (req, res) => {
    const { section } = req.params;
    const query = getDataFromReqQuery(req);
    const list = await ShotDefaultValueService.getList(section, query);
    return BaseController.ok(res, list);
};

const listShotsBySpecificDefaultValue = async (req, res) => {
    const { section, id } = req.params;
    const query = getDataFromReqQuery(req);
    const shots = await ShotDefaultValueService.getShotsOfValue(section, id, query);
    return BaseController.ok(res, shots);
};

const createDefaultValue = async (req, res) => {
    // Implementation for creating a default value
};

const updateDefaultValue = async (req, res) => {
    // Implementation for updating a default value
};

const deleteDefaultValue = async (req, res) => {
    // Implementation for deleting a default value
};

const detachShotFromSpecificDefaultValue = async (req, res) => {
    const { section, shotId } = req.params;
    await ShotDefaultValueService.detachShotFromValue(section, shotId);
    return BaseController.ok(res);
};

module.exports = {
    getDefaultValue,
    listAllDefaultValues,
    listShotsBySpecificDefaultValue,
    createDefaultValue,
    updateDefaultValue,
    deleteDefaultValue,
    detachShotFromSpecificDefaultValue,
};
