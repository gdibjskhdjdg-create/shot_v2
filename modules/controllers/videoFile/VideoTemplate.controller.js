const { getDataFromReqQuery } = require("../../../helper/general.tool");
const BaseController = require("../../_default/controller/Base.controller");
const videoTemplateService = require("../../services/videoFile/VideoTemplate.service");
const VideoTemplateValidation = require("../../validation/videoFile/VideoTemplate.validation");
const VideoTemplate_DTO = require("../../dto/videoFile/VideoTemplate.dto");

const listVideoTemplates = async (req, res) => {
    const query = getDataFromReqQuery(req);
    const { count, rows } = await videoTemplateService.listTemplates(query);
    const templates = VideoTemplate_DTO.create(rows);
    return BaseController.ok(res, { count, rows: templates });
};

const showVideoTemplate = async (req, res) => {
    const { templateId } = req.params;
    const template = await videoTemplateService.getById(templateId);
    if (!template) {
        return BaseController.notFound(res, "Template not found");
    }
    const templateDto = VideoTemplate_DTO.create(template);
    return BaseController.ok(res, templateDto);
};

const createVideoTemplate = async (req, res) => {
    const { logoFile, ...fields } = req.body;
    const fileStream = logoFile ? logoFile.toBuffer() : null;
    const fileName = logoFile ? logoFile.filename : null;
    
    const validData = VideoTemplateValidation.createTemplate(fields);
    
    await videoTemplateService.createTemplate(validData, fileStream, fileName);
    return BaseController.created(res, { message: "Template created successfully." });
};

const updateVideoTemplate = async (req, res) => {
    const { templateId } = req.params;
    const { logoFile, ...fields } = req.body;

    const fileStream = logoFile ? logoFile.toBuffer() : null;
    const fileName = logoFile ? logoFile.filename : null;

    const validData = VideoTemplateValidation.updateTemplate(fields);

    await videoTemplateService.updateTemplate(+templateId, validData, fileStream, fileName);
    return BaseController.ok(res, { message: "Template updated successfully." });
};

const deleteVideoTemplate = async (req, res) => {
    const { templateId } = req.params;
    await videoTemplateService.deleteTemplate(templateId);
    return BaseController.ok(res, { message: "Template deleted successfully." });
};

module.exports = {
    listVideoTemplates,
    showVideoTemplate,
    createVideoTemplate,
    updateVideoTemplate,
    deleteVideoTemplate,
};