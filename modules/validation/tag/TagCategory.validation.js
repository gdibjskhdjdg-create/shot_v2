
const TypeTool = require("../../../helper/type.tool");
const ErrorResult = require('../../../helper/error.tool');

const createTagCategory = (data = {}) => {
    const {
        name,
        tagIds = []
    } = data;

    if (!TypeTool.boolean(name)) {
        throw ErrorResult.badRequest("name is required");
    }
    if (name.trim().length < 2) {
        throw ErrorResult.badRequest("min tag name is 2 characters");
    }

    if (!Array.isArray(tagIds)) {
        throw ErrorResult.badRequest("tagIds must be an array");
    }

    return {
        name: name.trim(),
        tagIds: tagIds.filter(item => item),
    };
};

module.exports = {
    createTagCategory
};