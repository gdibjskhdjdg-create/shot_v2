const ResponseDTO = require("../../_default/Response.dto");
const VideoDetailListResponse = require("../../dto/videoDetail/VideoDetailList.response");
const { videoDetailService, videoDetailExportService, videoDetailImportService } = require("../../services/videoDetail/index");
const videoDetailValidation = require("../../validation/videoDetail/videoDetail.validation");
const KeywordResponse = require("../../dto/keyword/Keyword.response");


async function fetchList(req, res) {
    const { status: sourceStatus } = req.params

    videoDetailValidation.checkStatus(sourceStatus);

    query = req.query
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

async function fetchAllList(req, res) {
    const query = req.query
    const filters = {
        page: query.page || 1,
        take: query.take || 10,
        ...query,
    }

    const { videoDetails, count } = await videoDetailService.videoDetailList(filters);

    return ResponseDTO.success(res, { videoDetails: VideoDetailListResponse.create(videoDetails), count });
}

async function fetchDetail(req, res) {
    const { videoFileId } = req.params;

    const response = await videoDetailService.detail(videoFileId);
    return ResponseDTO.success(res, response?.[0]);
}

async function assignOwnerToProjectFiles(req, res) {
    const { projectId } = req.params
    const { ownerId } = req.body

    await videoDetailService.setOwner2VideosOfProject(projectId, ownerId);
    return ResponseDTO.success(res, {})
}

async function fetchVideoDetailsOfVideoFile(req, res) {
    const videoFileId = req.params.videoFileId;
    const response = await videoDetailService.getSections_Service(videoFileId);
    return ResponseDTO.success(res, response);
}

async function modifyVideoDetail(req, res) {
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

async function modifyInitVideoDetail(req, res) {
    const body = req.body;
    const { id: userId } = req.user;
    const { videoFileId } = req.params;

    const validData = await videoDetailValidation.updateVideoDetail(body);
    const response = await videoDetailService.initToCleaningVideoDetail(videoFileId, userId, validData);

    return ResponseDTO.success(res, response)
}

async function modifyCleaningVideoDetail(req, res) {
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

async function modifyVideoDetailStatus(req, res) {
    const { changeToStatus, videoFileIds, isExcludeMode, ...filters } = req.body;
    const { status } = videoDetailValidation.checkStatus(changeToStatus);
    await videoDetailService.updateVideoDetailStatus_Service(videoFileIds, isExcludeMode, filters, status);
    return ResponseDTO.success(res);
}

async function modifyVideoDetailScores(req, res) {
    const { scores, videoFileIds, isExcludeMode, ...filters } = req.body;
    await videoDetailService.updateVideoDetailScores_Service(req.user.id, videoFileIds, isExcludeMode, filters, scores);
    return ResponseDTO.success(res);
}


async function fetchExportInfoVideos(req, res) {

    const { videos, isExcludeMode, ...filters } = req.query
    const info = await videoDetailService.getExportInfoVideos({ videos, isExcludeMode, filters })
    return ResponseDTO.success(res, info)
}

async function fetchVideoDetailSpecial(req, res) {
    const query = req.query
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

async function fetchExportVideoDetailIds(req, res) {
    const { videoDetails, isExcludeMode, ...filters } = req.query
    const videoIds = await videoDetailExportService.getExportVideoDetailsId(videoDetails, isExcludeMode, filters)
    return ResponseDTO.success(res, videoIds)
}

async function exportSpecialVideoDetail(req, res) {
    const { exportType } = req.params;

    const query = req.query;
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

async function exportVideoDetailData(req, res) {
    const { exportType } = req.params;

    const validData = videoDetailValidation.exportVideoDetails(req.query.videoDetailsId);
    const response = await videoDetailExportService.exportVideoDetail(exportType, validData.videoDetailsId)

    return ResponseDTO.success(res, response);
}

async function exportToExcel(req, res) {
    const { exportType, videoDetailId } = req.params;
    const videoDetails = await videoDetailExportService.exportVideoDetail(exportType, [videoDetailId])
    return ResponseDTO.success(res, videoDetails)
}

async function exportVideoDetailPath(req, res) {
    const { exportType } = req.params;
    const filters = req.query;
    const videoDetails = await videoDetailExportService.exportSpecialVideoDetailPath(exportType, filters)
    return ResponseDTO.success(res, videoDetails)
}

async function importFromExcel(req, res) {
    await videoDetailImportService.storeExcelFile(req);
    return ResponseDTO.success(res, {});
}

async function importRemovalFromExcel(req, res) {
    await videoDetailImportService.storeRemovalExcelFile(req)
    return ResponseDTO.success(res, {});

}

async function fetchAiKeywordsTotalReport(req, res) {
    let response = await videoDetailService.getVideoDetailTotalReport(req.query)
    return ResponseDTO.success(res, response);
}


async function fetchAiKeywordsReport(req, res) {
    let { rows, count } = await videoDetailService.videoDetailAiTagsList(req.query)
    return ResponseDTO.success(res, { rows, count });
}

async function fetchAiKeywordsDetail(req, res) {
    const { videoFileId } = req.params;
    let { allTags, aiTags, videoUrl } = await videoDetailService.videoDetailAiTagsReport(+videoFileId)
    return ResponseDTO.success(res, { videoUrl, allTags: KeywordResponse.create(allTags), aiTags: KeywordResponse.create(aiTags) });
}

async function createListLink(req, res) {
    const link = await videoDetailService.generateFilterListLink(req.body)
    return ResponseDTO.success(res, { link })
}

async function fetchVideoListWithCode(req, res) {
    const { uuid } = req.params;
    const { page = 1, take = 10 } = req.query;
    const { videoDetails, count } = await videoDetailService.getVideoListWithCode(uuid, { page, take })
    return ResponseDTO.success(res, { videoDetail: VideoDetailListResponse.create(videoDetails), count });
}

async function fetchDetailWithUUID(req, res) {
    const { videoFileId, uuid } = req.params;
    const response = await videoDetailService.validateCodeWithVideoId(videoFileId, uuid);
    return ResponseDTO.success(res, response);
}


module.exports = {
    fetchList,
    fetchAllList,
    fetchDetail,
    assignOwnerToProjectFiles,
    fetchVideoDetailsOfVideoFile,
    modifyVideoDetail,
    modifyInitVideoDetail,
    modifyCleaningVideoDetail,
    modifyVideoDetailStatus,
    modifyVideoDetailScores,
    fetchExportInfoVideos,
    fetchVideoDetailSpecial,
    fetchExportVideoDetailIds,
    exportSpecialVideoDetail,
    exportVideoDetailData,
    exportToExcel,
    exportVideoDetailPath,
    importFromExcel,
    importRemovalFromExcel,
    fetchAiKeywordsTotalReport,
    fetchAiKeywordsReport,
    fetchAiKeywordsDetail,
    createListLink,
    fetchVideoListWithCode,
    fetchDetailWithUUID
};