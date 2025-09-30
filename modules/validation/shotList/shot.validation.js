const TypeTool = require("../../../helper/type.tool");
const ShotDefaultValueService = require("../../services/shotList/ShotDefaultValue.service");
const TagInVideoDetail_VO = require("../../entity/shotList/valueObject/TagInVideoDetail.vo");

const createValidationResult = () => ({
    errors: [],
    validData: {},
    hasError() {
        return this.errors.length > 0;
    },
    setError(error) {
        this.errors.push(error);
    },
    setValidData(key, value) {
        this.validData[key] = value;
    },
    getResult() {
        if (this.hasError()) {
            const error = new Error(this.errors.join(", "));
            error.statusCode = 400;
            throw error;
        }
        return this.validData;
    },
});

const validateCreateShot = async (data = {}) => {
    const validation = createValidationResult();
    const { title = "", description = null, categoriesId = null, startTime = null, endTime = null } = data;

    if (!TypeTool.boolean(title)) {
        validation.setError("title is required");
    } else {
        validation.setValidData("title", title);
    }

    if (!TypeTool.isNullUndefined(description)) validation.setValidData("description", description);
    if (!TypeTool.isNullUndefined(categoriesId)) validation.setValidData("categoriesId", categoriesId);
    if (!TypeTool.isNullUndefined(startTime)) validation.setValidData("startTime", startTime);
    if (!TypeTool.isNullUndefined(endTime)) validation.setValidData("endTime", endTime);

    return validation.getResult();
};

const validateUpdateShot = async (data = {}) => {
    const validation = createValidationResult();
    const { 
        title, description, categoriesId, startTime, endTime, imgGallery, rate, startDate, endDate,
        pictureTypeId, pictureModeId, pictureViewId, qualityGrade, dayNight, isArchive, ownerId,
        ageRangeDefaultValueId, gender, pictureDescription, tagInput, tagInVideo, soundQuality, color,
        pictureEnvironment, hasCameraShake, hasLogo, hasMusic, mainLanguage, dubbed, subtitle, narration,
        narrationDescription, userStartTimeActivity, userEndTimeActivity, logMode 
    } = data;

    if (!TypeTool.isNullUndefined(tagInVideo)) {
        const mapOfTagInVideo = tagInVideo.map(tag => ({
            tagId: tag.tagId,
            times: tag.times.map(item => new TagInVideoDetail_VO(item))
        }));
        validation.setValidData("tagInVideo", mapOfTagInVideo);
    }

    if (!TypeTool.isNullUndefined(title)) validation.setValidData("title", title);
    if (!TypeTool.isNullUndefined(description)) validation.setValidData("description", description);
    if (!TypeTool.isNullUndefined(categoriesId)) validation.setValidData("categoriesId", categoriesId);
    if (!TypeTool.isNullUndefined(hasLogo)) validation.setValidData("hasLogo", TypeTool.boolean2Int(hasLogo));
    if (!TypeTool.isNullUndefined(hasMusic)) validation.setValidData("hasMusic", TypeTool.boolean2Int(hasMusic));
    if (!TypeTool.isNullUndefined(hasCameraShake)) validation.setValidData("hasCameraShake", TypeTool.boolean2Int(hasCameraShake));
    if (!TypeTool.isNullUndefined(narrationDescription)) validation.setValidData("narrationDescription", narrationDescription);
    if (!TypeTool.isUndefined(pictureTypeId)) validation.setValidData("pictureTypeId", pictureTypeId);
    if (!TypeTool.isUndefined(pictureModeId)) validation.setValidData("pictureModeId", pictureModeId);
    if (!TypeTool.isUndefined(pictureViewId)) validation.setValidData("pictureViewId", pictureViewId);
    if (!TypeTool.isUndefined(qualityGrade)) validation.setValidData("qualityGrade", qualityGrade);
    if (!TypeTool.isUndefined(dayNight)) validation.setValidData("dayNight", dayNight);
    if (!TypeTool.isUndefined(isArchive)) validation.setValidData("isArchive", TypeTool.boolean2Int(isArchive));

    if (!TypeTool.isUndefined(startDate)) {
        validation.setValidData("startDate", TypeTool.isValidJalaliDate(startDate) ? TypeTool.jalaliDateToTimestamp(startDate) : startDate);
    }
    if (!TypeTool.isUndefined(endDate)) {
        validation.setValidData("endDate", TypeTool.isValidJalaliDate(endDate) ? TypeTool.jalaliDateToTimestamp(endDate) : endDate);
    }

    if (!TypeTool.isNullUndefined(rate)) validation.setValidData("rate", parseInt(rate));
    if (!TypeTool.isUndefined(ownerId)) validation.setValidData("ownerId", ownerId);
    if (!TypeTool.isNullUndefined(pictureDescription)) validation.setValidData("pictureDescription", pictureDescription);
    if (!TypeTool.isNullUndefined(tagInput)) validation.setValidData("tagInput", tagInput);
    if (!TypeTool.isNullUndefined(imgGallery)) validation.setValidData("imgGallery", imgGallery);
    if (!TypeTool.isNullUndefined(startTime)) validation.setValidData("startTime", Math.trunc(startTime * 1000) / 1000);
    if (!TypeTool.isNullUndefined(endTime)) validation.setValidData("endTime", Math.trunc(endTime * 1000) / 1000);

    const defaultValues = await ShotDefaultValueService.getDefault();

    if (!TypeTool.isUndefined(gender)) {
        if (gender !== null && ![0, 1].includes(parseInt(gender))) {
            validation.setError("gender is invalid");
        } else {
            validation.setValidData("gender", gender === null ? null : parseInt(gender));
        }
    }

    if (!TypeTool.isUndefined(ageRangeDefaultValueId)) {
        if (ageRangeDefaultValueId !== null && !defaultValues.ageRange.some(item => item.id === parseInt(ageRangeDefaultValueId))) {
            validation.setError("Age range is invalid");
        } else {
            validation.setValidData("ageRangeDefaultValueId", ageRangeDefaultValueId === null ? null : parseInt(ageRangeDefaultValueId));
        }
    }

    if (!TypeTool.isUndefined(soundQuality) && !defaultValues.soundQuality.some(item => item.value == soundQuality)) {
        validation.setError("soundQuality is invalid");
    }
    validation.setValidData("soundQuality", soundQuality);

    if (!TypeTool.isUndefined(color) && !defaultValues.color.some(item => item.value == color)) {
        validation.setError("color is invalid");
    }
    validation.setValidData("color", color);

    if (!TypeTool.isUndefined(pictureEnvironment) && !defaultValues.pictureEnvironment.some(item => +item.value === +pictureEnvironment)) {
        validation.setError("pictureEnvironment is invalid");
    }
    validation.setValidData("pictureEnvironment", pictureEnvironment);

    ["mainLanguage", "dubbed", "subtitle", "narration"].forEach(key => {
        if (!TypeTool.isUndefined(data[key])) {
            if (!Array.isArray(data[key])) {
                validation.setError(`${key} is invalid`);
            }
            validation.setValidData(key, data[key]);
        }
    });

    validation.setValidData("userStartTimeActivity", userStartTimeActivity);
    validation.setValidData("userEndTimeActivity", userEndTimeActivity);
    validation.setValidData("logMode", logMode);

    return validation.getResult();
};

const validateCreateSectionTimeOfShot = (data = {}) => {
    const validation = createValidationResult();
    const { title, startTime, endTime, tagInput = [] } = data;

    if (!TypeTool.boolean(title)) validation.setError("title is required");
    if (typeof startTime !== "number") validation.setError("startTime is invalid");
    if (typeof endTime !== "number") validation.setError("endTime is invalid");
    if (startTime > endTime) validation.setError("startTime Must Less than EndTime");

    validation.setValidData("title", title);
    validation.setValidData("startTime", startTime);
    validation.setValidData("endTime", endTime);
    validation.setValidData("tagInput", tagInput);

    return validation.getResult();
};

const validateExportShots = (shotsId) => {
    const validation = createValidationResult();
    if (!shotsId?.length) {
        validation.setError("at least one shot is required");
    }
    validation.setValidData("shotsId", shotsId);
    return validation.getResult();
};

module.exports = {
    validateCreateShot,
    validateUpdateShot,
    validateCreateSectionTimeOfShot,
    validateExportShots,
};
