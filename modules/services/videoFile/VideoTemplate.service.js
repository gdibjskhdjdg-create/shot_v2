const { createPaginationQuery } = require("../../../helper/SqlHelper.tool");
const { VideoTemplate } = require("../../_default/model");
const path = require('path');
const fs = require('fs');
const util = require('util');
const { pipeline } = require('stream');
const { generateRandomCode } = require("../../../helper/general.tool");
const TypeTool = require("../../../helper/type.tool");
const { Op } = require("sequelize");

const pump = util.promisify(pipeline);

// --- Helper Functions ---

const getRootDir = () => path.join(__dirname, "..", "..", "..");

const saveLogoFile = async (logoFileStream, fileName) => {
    const fileExtension = path.extname(fileName);
    const newName = `${Date.now()}${generateRandomCode(5)}${fileExtension}`;

    const logoFolder = path.join(getRootDir(), process.env.STORE_FOLDER_FROM_APP_ROOT || 'storage', 'logo');
    if (!fs.existsSync(logoFolder)) {
        fs.mkdirSync(logoFolder, { recursive: true });
    }

    const targetLogoPath = path.join(logoFolder, newName);
    await pump(logoFileStream, fs.createWriteStream(targetLogoPath));

    return path.join('logo', newName); // Returns relative path
};

const applyTemplateUpdates = async (template, body, logoFileStream, logoFileName) => {
    const { title, bitrate, quality, isMute, gifTime, logo, text } = body;

    let logoParams = template.logoParams ? JSON.parse(template.logoParams) : {};
    if(logo) {
        logoParams = { ...logoParams, ...JSON.parse(logo) };
    }

    if (logoFileStream) {
        if (logoParams.src) {
            // Delete old logo if it exists
            const oldLogoPath = path.join(getRootDir(), process.env.STORE_FOLDER_FROM_APP_ROOT || 'storage', logoParams.src);
            if (fs.existsSync(oldLogoPath)) fs.unlinkSync(oldLogoPath);
        }
        logoParams.src = await saveLogoFile(logoFileStream, logoFileName);
    }

    template.title = title || template.title;
    template.quality = quality || template.quality;
    template.gifTime = gifTime || template.gifTime;
    template.bitrate = bitrate || template.bitrate;
    template.textParams = text ? JSON.stringify(text) : template.textParams;
    template.logoParams = JSON.stringify(logoParams);

    if (!TypeTool.isNullUndefined(isMute)) {
        template.isMute = TypeTool.boolean2Int(isMute);
    }

    return template.save();
};

// --- Public API ---

const listTemplates = async (query = {}) => {
    const { templateId, page = 1, take = 10, search } = query;

    const sqlQuery = {
        where: {},
        order: [["createdAt", "DESC"]]
    };

    if (search) {
        sqlQuery.where.title = { [Op.like]: `%${String(search).trim()}%` };
    }

    if (templateId) {
        sqlQuery.where.id = templateId;
    }

    const paginatedQuery = createPaginationQuery(sqlQuery, page, take);
    return VideoTemplate.findAndCountAll(paginatedQuery);
};

const getTemplateById = (id) => {
    return VideoTemplate.findByPk(id);
};

const createTemplate = (body, logoFileStream, logoFileName) => {
    const newTemplate = VideoTemplate.build();
    return applyTemplateUpdates(newTemplate, body, logoFileStream, logoFileName);
};

const updateTemplate = async (id, body, logoFileStream, logoFileName) => {
    const template = await getTemplateById(id);
    if (!template) throw new Error('Template not found');
    return applyTemplateUpdates(template, body, logoFileStream, logoFileName);
};

const deleteTemplate = async (id) => {
    const template = await getTemplateById(id);
    if (!template) return false;

    if (template.logoParams) {
        const logo = JSON.parse(template.logoParams);
        if (logo.src) {
            const logoPath = path.join(getRootDir(), process.env.STORE_FOLDER_FROM_APP_ROOT || 'storage', logo.src);
            if (fs.existsSync(logoPath)) {
                fs.unlinkSync(logoPath);
            }
        }
    }

    await template.destroy();
    return true;
};

const logoTemplateWithFullPath = (logoPath) => {
    if (!logoPath) return null;
    return path.join(getRootDir(), process.env.STORE_FOLDER_FROM_APP_ROOT || 'storage', logoPath);
}

module.exports = {
    listTemplates,
    getById: getTemplateById, // aliased for compatibility
    createTemplate,
    updateTemplate,
    deleteTemplate,
    logoTemplateWithFullPath
};