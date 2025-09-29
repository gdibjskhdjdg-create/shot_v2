const { getDataFromReqQuery } = require("../../../helper/general.tool");
const BaseController = require("../../_default/controller/Base.controller");
const VideoDetailList_DTO = require("../../dto/videoDetail/VideoDetailList.dto");
const { videoDetailService, videoDetailExportService, videoDetailImportService } = require("../../services/videoDetail/index");
const videoDetailValidation = require("../../validation/videoDetail/videoDetail.validation");
const Tag_DTO = require("../../dto/tag/Tag.dto");

class VideoDetailController {

    async getList(req, res) {
        const { status: sourceStatus } = req.params

        videoDetailValidation.checkStatus(sourceStatus);

        const query = getDataFromReqQuery(req);

        const { status } = videoDetailValidation.checkQueryStatusIsBySourceStatus(sourceStatus, query.status)

        const filters = {
            page: query.page || 1,
            take: query.take || 10,
            ...query,
            status
        }

        const user = req.user;
        if (
            sourceStatus === "init" &&
            user.permission !== 'admin' &&
            !user.access.includes("videos-full-access")
        ) {
            filters.userId = user.id;
        }

        const { videoDetails, count } = await videoDetailService.videoDetailList(filters);

        return BaseController.ok(res, { videoDetails: VideoDetailList_DTO.create(videoDetails), count });
    }

    async getAllList(req, res) {
        const query = getDataFromReqQuery(req);
        const filters = {
            page: query.page || 1,
            take: query.take || 10,
            ...query,
        }

        const { videoDetails, count } = await videoDetailService.videoDetailList(filters);

        return BaseController.ok(res, { videoDetails: VideoDetailList_DTO.create(videoDetails), count });
    }

    async getDetail(req, res) {
        const { videoFileId } = req.params;

        const response = await videoDetailService.detail(videoFileId);
        return BaseController.ok(res, response?.[0]);
    }

    async setOwner2FilesProject(req, res) {
        const { projectId } = req.params
        const { ownerId } = req.body

        await videoDetailService.setOwner2VideosOfProject(projectId, ownerId);
        return BaseController.ok(res, {})
    }

    async getVideoDetailsOfVideoFile(req, res) {
        const videoFileId = req.params.videoFileId;
        const response = await videoDetailService.getSections_Service(videoFileId);
        return BaseController.ok(res, response);
    }

    async updateVideoDetail(req, res) {
        const body = req.body;
        const { videoFileId } = req.params;

        const validData = await videoDetailValidation.updateVideoDetail(body);
        const response = await videoDetailService.updateVideoDetail(
            videoFileId,
            req.user.id,
            validData
        );
        return BaseController.ok(res, response)
    }

    async updateInitVideoDetail(req, res) {
        const body = req.body;
        const { id: userId } = req.user;
        const { videoFileId } = req.params;

        const validData = await videoDetailValidation.updateVideoDetail(body);
        const response = await videoDetailService.initToCleaningVideoDetail(videoFileId, userId, validData);

        return BaseController.ok(res, response)
    }

    async updateCleaningVideoDetail(req, res) {
        const body = req.body;
        const videoFileId = req.params.videoFileId;

        const validData = await videoDetailValidation.updateVideoDetail(body);
        const validStatus = await videoDetailValidation.updateCleaningVideoDetail(body);

        const response = await videoDetailService.cleaningVideoDetail(videoFileId, req.user.id, {
            ...validData,
            ...validStatus
        });
        return BaseController.ok(res, response)
    }

    async updateVideoDetailStatus(req, res) {
        const { changeToStatus, videoFileIds, isExcludeMode, ...filters } = req.body;
        const { status } = videoDetailValidation.checkStatus(changeToStatus);
        await videoDetailService.updateVideoDetailStatus_Service(videoFileIds, isExcludeMode, filters, status);
        return BaseController.ok(res);
    }

    async updateVideoDetailScores(req, res) {
        const { scores, videoFileIds, isExcludeMode, ...filters } = req.body;
        await videoDetailService.updateVideoDetailScores_Service(req.user.id, videoFileIds, isExcludeMode, filters, scores);
        return BaseController.ok(res);
    }


    async getExportInfoVideos(req, res) {
        const query = getDataFromReqQuery(req);
        const { videos, isExcludeMode, ...filters } = query
        const info = await videoDetailService.getExportInfoVideos({ videos, isExcludeMode, filters })
        return BaseController.ok(res, info)
    }

    async getVideoDetailSpecial(req, res) {
        const query = getDataFromReqQuery(req);
        const filters = {
            page: 1,
            take: 10,
            ...query
        };

        const user = req.user;
        if (
            user.permission !== 'admin'
            && !user.access.includes("video-list")
            && !user.access.includes("videos-full-access")
            && !user.access.includes("source-full-access")
        ) {
            filters.userId = user.id;
        }

        const { videoDetails, count } = await videoDetailService.specialVideoDetailList(filters);

        return BaseController.ok(res, { videoDetail: VideoDetailList_DTO.create(videoDetails), count });
    }

    async getExportVideoDetailIds(req, res) {
        const query = getDataFromReqQuery(req);
        const { videoDetails, isExcludeMode, ...filters } = query
        const videoIds = await videoDetailExportService.getExportVideoDetailsId(videoDetails, isExcludeMode, filters)
        return BaseController.ok(res, videoIds)
    }

    async exportVideoDetailSpecial(req, res) {
        const { exportType } = req.params;

        const query = getDataFromReqQuery(req);
        const filters = {
            page: 1,
            excludesId: null,
            ...query
        };

        const user = req.user;
        if (user.permission !== 'admin' && !user.access.includes("videos-full-access")) {
            filters.userId = user.id;
        }

        const response = await videoDetailExportService.exportSpecialVideoDetail(exportType, filters)

        return BaseController.ok(res, response);
    }

    async exportVideoDetails(req, res) {
        const { exportType } = req.params;
        const query = getDataFromReqQuery(req);

        const validData = videoDetailValidation.exportVideoDetails(query.videoDetailsId);
        const response = await videoDetailExportService.exportVideoDetail(exportType, validData.videoDetailsId)

        return BaseController.ok(res, response);
    }

    async exportExcel(req, res) {
        const { exportType, videoDetailId } = req.params;
        const videoDetails = await videoDetailExportService.exportVideoDetail(exportType, [videoDetailId])
        return BaseController.ok(res, videoDetails)
    }

    async exportVideoDetailsPath(req, res) {
        const { exportType } = req.params;
        const filters = getDataFromReqQuery(req);
        const videoDetails = await videoDetailExportService.exportSpecialVideoDetailPath(exportType, filters)
        return BaseController.ok(res, videoDetails)
    }

    async uploadExcel(req, res) {
        await videoDetailImportService.storeExcelFile(req);
        return BaseController.ok(res, {});
    }

    async uploadRemovalExcel(req, res) {
        await videoDetailImportService.storeRemovalExcelFile(req)
        return BaseController.ok(res, {});

    }

    async aiTagsTotalReport(req, res) {
        const query = getDataFromReqQuery(req);

        let response = await videoDetailService.getVideoDetailTotalReport(query)
        return BaseController.ok(res, response);
    }


    async aiTagsReport(req, res) {
        const query = getDataFromReqQuery(req);

        let { rows, count } = await videoDetailService.videoDetailAiTagsList(query)
        return BaseController.ok(res, { rows, count });
    }

    async aiTagsDetail(req, res) {
        const { videoFileId } = req.params;
        let { allTags, aiTags, videoUrl } = await videoDetailService.videoDetailAiTagsReport(+videoFileId)
        return BaseController.ok(res, { videoUrl, allTags: Tag_DTO.create(allTags), aiTags: Tag_DTO.create(aiTags) });
    }

    async generateListLink(req, res) {
        const link = await videoDetailService.generateFilterListLink(req.body)
        return BaseController.ok(res, { link })
    }

    async getVideoListWithCode(req, res) {
        const { uuid } = req.params;
        const { page = 1, take = 10 } = getDataFromReqQuery(req);
        const { videoDetails, count } = await videoDetailService.getVideoListWithCode(uuid, { page, take })
        return BaseController.ok(res, { videoDetail: VideoDetailList_DTO.create(videoDetails), count });
    }

    async getDetailWithUUID(req, res) {
        const { videoFileId, uuid } = req.params;
        const response = await videoDetailService.validateCodeWithVideoId(videoFileId, uuid);
        return BaseController.ok(res, response);
    }
}

module.exports = new VideoDetailController();