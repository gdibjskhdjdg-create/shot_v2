const TypeTool = require("../../../helper/type.tool");
const Validation = require("../../_default/validation");
const ShotDefaultValueService = require("../../services/shotList/ShotDefaultValue.service");
const TagInVideoDetail_VO = require("../../entity/shotList/valueObject/TagInVideoDetail.vo");


class ShotValidation extends Validation {

    async create(data = {}) {
        this.setEmpty()
        const {
            title = "",
            description = null,
            categoriesId = null,
            startTime = null,
            endTime = null,
        } = data;


        if (!TypeTool.boolean(title)) {
            this.setError("title is required");
        }
        else {
            this.setValidData("title", title);
        }

        if (!TypeTool.isNullUndefined(description)) this.setValidData("description", description);
        if (!TypeTool.isNullUndefined(categoriesId)) this.setValidData("categoriesId", categoriesId);
        if (!TypeTool.isNullUndefined(startTime)) this.setValidData("startTime", startTime);
        if (!TypeTool.isNullUndefined(endTime)) this.setValidData("endTime", endTime);

        return this.getResult();
    }

    async updateShot(data = {}) {
        this.setEmpty()
        const {
            title,
            description,
            categoriesId,
            startTime,
            endTime,
            imgGallery,
            rate,

            startDate,
            endDate,

            pictureTypeId,
            pictureModeId,
            pictureViewId,
            qualityGrade,
            dayNight,
            isArchive,
            ownerId,

            ageRangeDefaultValueId,
            gender,
            pictureDescription,
            tagInput,
            tagInVideo,

            soundQuality,
            color,
            pictureEnvironment,
            hasCameraShake,
            hasLogo,
            hasMusic,
            mainLanguage,
            dubbed,
            subtitle,
            narration,
            narrationDescription,

            userStartTimeActivity,
            userEndTimeActivity,
            logMode,
        } = data;

        if (!TypeTool.isNullUndefined(tagInVideo)) {
            let mapOfTagInVideo = tagInVideo.map(tag => ({
                tagId: tag.tagId,
                times: tag.times.map(item => new TagInVideoDetail_VO(item))
            }))
            this.setValidData("tagInVideo", mapOfTagInVideo)
        }


        if (!TypeTool.isNullUndefined(title)) this.setValidData("title", title);
        if (!TypeTool.isNullUndefined(description)) this.setValidData("description", description);
        if (!TypeTool.isNullUndefined(categoriesId)) this.setValidData("categoriesId", categoriesId);

        if (!TypeTool.isNullUndefined(hasLogo)) this.setValidData("hasLogo", TypeTool.boolean2Int(hasLogo));
        if (!TypeTool.isNullUndefined(hasMusic)) this.setValidData("hasMusic", TypeTool.boolean2Int(hasMusic));
        if (!TypeTool.isNullUndefined(hasCameraShake)) this.setValidData("hasCameraShake", TypeTool.boolean2Int(hasCameraShake));
        if (!TypeTool.isNullUndefined(narrationDescription)) this.setValidData("narrationDescription", narrationDescription);
        if (!TypeTool.isUndefined(pictureTypeId)) this.setValidData("pictureTypeId", pictureTypeId);
        if (!TypeTool.isUndefined(pictureModeId)) this.setValidData("pictureModeId", pictureModeId);
        if (!TypeTool.isUndefined(pictureViewId)) this.setValidData("pictureViewId", pictureViewId);
        if (!TypeTool.isUndefined(qualityGrade)) this.setValidData("qualityGrade", qualityGrade);
        if (!TypeTool.isUndefined(dayNight)) this.setValidData("dayNight", dayNight);
        if (!TypeTool.isUndefined(isArchive)) this.setValidData("isArchive", TypeTool.boolean2Int(isArchive));

        if (!TypeTool.isUndefined(startDate)) {
            if (TypeTool.isValidJalaliDate(startDate)) {
                this.setValidData("startDate", TypeTool.jalaliDateToTimestamp(startDate));
            } else {
                this.setValidData("startDate", startDate);
            }
        }

        if (!TypeTool.isUndefined(endDate)) {
            if (TypeTool.isValidJalaliDate(endDate)) {
                this.setValidData("endDate", TypeTool.jalaliDateToTimestamp(endDate));
            } else {
                this.setValidData("endDate", endDate);
            }
        }

        if (!TypeTool.isNullUndefined(rate)) { this.setValidData("rate", parseInt(rate)); }
        if (!TypeTool.isUndefined(ownerId)) this.setValidData("ownerId", ownerId);
        if (!TypeTool.isNullUndefined(pictureDescription)) this.setValidData("pictureDescription", pictureDescription);
        if (!TypeTool.isNullUndefined(tagInput)) this.setValidData("tagInput", tagInput);
        if (!TypeTool.isNullUndefined(imgGallery)) this.setValidData("imgGallery", imgGallery);


        if (!TypeTool.isNullUndefined(startTime)) {
            this.setValidData("startTime", Math.trunc(startTime * 1000) / 1000);
        }
        if (!TypeTool.isNullUndefined(endTime)) {
            this.setValidData("endTime", Math.trunc(endTime * 1000) / 1000);
        }

        const defaultValues = await ShotDefaultValueService.getDefault();

        const ageRangeValues = defaultValues.ageRange;

        if (!TypeTool.isUndefined(gender)) {
            if (gender === null) {
                this.setValidData("gender", null)
            }
            else if (![0, 1].includes(parseInt(gender))) {
                this.setError("gender is invalid")
            }
            else {
                this.setValidData("gender", parseInt(gender));
            }
        }

        if (!TypeTool.isUndefined(ageRangeDefaultValueId)) {
            if (ageRangeDefaultValueId === null) {
                this.setValidData("ageRangeDefaultValueId", null)
            }
            else if (!ageRangeValues.map(item => item.id).includes(parseInt(ageRangeDefaultValueId))) {
                this.setError("Age range is invalid")
            }
            else {
                this.setValidData("ageRangeDefaultValueId", parseInt(ageRangeDefaultValueId))
            }
        }

        if (!TypeTool.isUndefined(soundQuality)) {
            if (!defaultValues.soundQuality.find(item => item.value == soundQuality)) {
                this.setError("soundQuality is invalid");
            }
            this.setValidData("soundQuality", soundQuality);
        }

        if (!TypeTool.isUndefined(color)) {
            if (!defaultValues.color.find(item => item.value == color)) {
                this.setError("color is invalid");
            }
            this.setValidData("color", color);
        }

        if (!TypeTool.isUndefined(pictureEnvironment)) {
            if (!defaultValues.pictureEnvironment.find(item => +item.value == +pictureEnvironment)) {
                this.setError("pictureEnvironment is invalid");
            }
            this.setValidData("pictureEnvironment", pictureEnvironment);
        }

        const keyWithSameValidation = ["mainLanguage", "dubbed", "subtitle", "narration"];
        keyWithSameValidation.forEach(key => {
            if (!TypeTool.isUndefined(data[key])) {
                if (!Array.isArray(data[key])) {
                    this.setError(`${key} is invalid`);
                }
                this.setValidData(key, data[key]);
            }
        })

        // shot log
        this.setValidData("userStartTimeActivity", userStartTimeActivity);
        this.setValidData("userEndTimeActivity", userEndTimeActivity);
        this.setValidData("logMode", logMode);

        return this.getResult();
    }

    async createSectionTimeOfShot(data = {}) {
        this.setEmpty();
        const {
            title,
            startTime,
            endTime,
            tagInput = [],
        } = data;

        if (!TypeTool.boolean(title)) {
            this.setError("title is required");
        }
        if (typeof startTime !== "number") {
            this.setError("startTime is invalid");
        }
        if (typeof endTime !== "number") {
            this.setError("endTime is invalid");
        }

        if (startTime > endTime) {
            this.setError("startTime Must Less than EndTime");
        }

        this.setValidData("title", title);
        this.setValidData("startTime", startTime);
        this.setValidData("endTime", endTime);
        this.setValidData("tagInput", tagInput);

        return this.getResult();
    }

    exportShots(shotsId) {
        this.setEmpty();

        if (!shotsId?.length) {
            this.setError("at least one shot is required");
        }

        this.setValidData("shotsId", shotsId);
        return this.getResult();

    }
}

module.exports = new ShotValidation();