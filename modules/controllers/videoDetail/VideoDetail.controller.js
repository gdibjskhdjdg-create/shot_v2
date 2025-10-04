const { getDataFromReqQuery } = require("../../../helper/general.tool");
const ResponseDTO = require("../../_default/Response.dto");
const VideoDetailListResponse = require("../../dto/videoDetail/VideoDetailList.response");
const { videoDetailService, videoDetailExportService, videoDetailImportService } = require("../../services/videoDetail/index");
const videoDetailValidation = require("../../validation/videoDetail/videoDetail.validation");
const TagResponse = require("../../dto/tag/Tag.response");


async function getList(req, res) {
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

    return ResponseDTO.success(res, { videoDetails: VideoDetailListResponse.create(videoDetails), count });
}

async function getAllList(req, res) {
    const query = getDataFromReqQuery(req);
    const filters = {
        page: query.page || 1,
        take: query.take || 10,
        ...query,
    }

    const { videoDetails, count } = await videoDetailService.videoDetailList(filters);

    return ResponseDTO.success(res, { videoDetails: VideoDetailListResponse.create(videoDetails), count });
}

async function getDetail(req, res) {
    const { videoFileId } = req.params;

    const response = await videoDetailService.detail(videoFileId);
    return ResponseDTO.success(res, response?.[0]);
}

async function setOwner2FilesProject(req, res) {
    const { projectId } = req.params
    const { ownerId } = req.body

    await videoDetailService.setOwner2VideosOfProject(projectId, ownerId);
    return ResponseDTO.success(res, {})
}

async function getVideoDetailsOfVideoFile(req, res) {
    const videoFileId = req.params.videoFileId;
    const response = await videoDetailService.getSections_Service(videoFileId);
    return ResponseDTO.success(res, response);
}

async function updateVideoDetail(req, res) {
    const body = req.body;
    const { videoFileId } = req.params;

    const validData = await videoDetailValidation.updateVideoDetail(body);
    const response = await videoDetailService.updateVideoDetail(
        videoFileId,
        req.user.id,
        validData
    );
    return ResponseDTO.success(res, response)
}

async function updateInitVideoDetail(req, res) {
    const body = req.body;
    const { id: userId } = req.user;
    const { videoFileId } = req.params;

    const validData = await videoDetailValidation.updateVideoDetail(body);
    const response = await videoDetailService.initToCleaningVideoDetail(videoFileId, userId, validData);

    return ResponseDTO.success(res, response)
}

async function updateCleaningVideoDetail(req, res) {
    const body = req.body;
    const videoFileId = req.params.videoFileId;

    const validData = await videoDetailValidation.updateVideoDetail(body);
    const validStatus = await videoDetailValidation.updateCleaningVideoDetail(body);

    const response = await videoDetailService.cleaningVideoDetail(videoFileId, req.user.id, {
        ...validData,
        ...validStatus
    });
    return ResponseDTO.success(res, response)
}

async function updateVideoDetailStatus(req, res) {
    const { changeToStatus, videoFileIds, isExcludeMode, ...filters } = req.body;
    const { status } = videoDetailValidation.checkStatus(changeToStatus);
    await videoDetailService.updateVideoDetailStatus_Service(videoFileIds, isExcludeMode, filters, status);
    return ResponseDTO.success(res);
}

async function updateVideoDetailScores(req, res) {
    const { scores, videoFileIds, isExcludeMode, ...filters } = req.body;
    await videoDetailService.updateVideoDetailScores_Service(req.user.id, videoFileIds, isExcludeMode, filters, scores);
    return ResponseDTO.success(res);
}


async function getExportInfoVideos(req, res) {
    const query = getDataFromReqQuery(req);
    const { videos, isExcludeMode, ...filters } = query
    const info = await videoDetailService.getExportInfoVideos({ videos, isExcludeMode, filters })
    return ResponseDTO.success(res, info)
}

async function getVideoDetailSpecial(req, res) {
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

    return ResponseDTO.success(res, { videoDetail: VideoDetailListResponse.create(videoDetails), count });
}

async function getExportVideoDetailIds(req, res) {
    const query = getDataFromReqQuery(req);
    const { videoDetails, isExcludeMode, ...filters } = query
    const videoIds = await videoDetailExportService.getExportVideoDetailsId(videoDetails, isExcludeMode, filters)
    return ResponseDTO.success(res, videoIds)
}

async function exportVideoDetailSpecial(req, res) {
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

    return ResponseDTO.success(res, response);
}

async function exportVideoDetails(req, res) {
    const { exportType } = req.params;
    const query = getDataFromReqQuery(req);

    const validData = videoDetailValidation.exportVideoDetails(query.videoDetailsId);
    const response = await videoDetailExportService.exportVideoDetail(exportType, validData.videoDetailsId)

    return ResponseDTO.success(res, response);
}

async function exportExcel(req, res) {
    const { exportType, videoDetailId } = req.params;
    const videoDetails = await videoDetailExportService.exportVideoDetail(exportType, [videoDetailId])
    return ResponseDTO.success(res, videoDetails)
}

async function exportVideoDetailsPath(req, res) {
    const { exportType } = req.params;
    const filters = getDataFromReqQuery(req);
    const videoDetails = await videoDetailExportService.exportSpecialVideoDetailPath(exportType, filters)
    return ResponseDTO.success(res, videoDetails)
}

async function uploadExcel(req, res) {
    await videoDetailImportService.storeExcelFile(req);
    return ResponseDTO.success(res, {});
}

async function uploadRemovalExcel(req, res) {
    await videoDetailImportService.storeRemovalExcelFile(req)
    return ResponseDTO.success(res, {});

}

async function aiTagsTotalReport(req, res) {
    const query = getDataFromReqQuery(req);

    let response = await videoDetailService.getVideoDetailTotalReport(query)
    return ResponseDTO.success(res, response);
}


async function aiTagsReport(req, res) {
    const query = getDataFromReqQuery(req);

    let { rows, count } = await videoDetailService.videoDetailAiTagsList(query)
    return ResponseDTO.success(res, { rows, count });
}

async function aiTagsDetail(req, res) {
    const { videoFileId } = req.params;
    let { allTags, aiTags, videoUrl } = await videoDetailService.videoDetailAiTagsReport(+videoFileId)
    return ResponseDTO.success(res, { videoUrl, allTags: TagResponse.create(allTags), aiTags: TagResponse.create(aiTags) });
}

async function generateListLink(req, res) {
    const link = await videoDetailService.generateFilterListLink(req.body)
    return ResponseDTO.success(res, { link })
}

async function getVideoListWithCode(req, res) {
    const { uuid } = req.params;
    const { page = 1, take = 10 } = getDataFromReqQuery(req);
    const { videoDetails, count } = await videoDetailService.getVideoListWithCode(uuid, { page, take })
    return ResponseDTO.success(res, { videoDetail: VideoDetailListResponse.create(videoDetails), count });
}

async function getDetailWithUUID(req, res) {
    const { videoFileId, uuid } = req.params;
    const response = await videoDetailService.validateCodeWithVideoId(videoFileId, uuid);
    return ResponseDTO.success(res, response);
}


module.exports ={
    getList,
    getAllList,
    getDetail,
    setOwner2FilesProject,
    getVideoDetailsOfVideoFile,
    updateVideoDetail,
    updateInitVideoDetail,
    updateCleaningVideoDetail,
    updateVideoDetailStatus,
    updateVideoDetailScores,
    getExportInfoVideos,
    getVideoDetailSpecial,
    getExportVideoDetailIds,
    exportVideoDetailSpecial,
    exportVideoDetails,
    exportExcel,
    exportVideoDetailsPath,
    uploadExcel,
    uploadRemovalExcel,
    aiTagsTotalReport,
    aiTagsReport,
    aiTagsDetail,
    generateListLink,
    getVideoListWithCode,
    getDetailWithUUID
};