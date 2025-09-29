module.exports = (DataTypes) => ({

    videoFileId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        unique: true,
        references: {
            model: "video_files",
            key: "id",
            as: "videoFile",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
    },
    projectId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "projects",
            key: "id",
            as: "project",
        },
        onUpdate: "SET NULL",
        onDelete: "SET NULL",
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "users",
            key: "id",
            as: "user",
        },
        onUpdate: "SET NULL",
        onDelete: "SET NULL",
    },

    cityId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "city",
            key: "id",
            as: "city",
        },
        onUpdate: "SET NULL",
        onDelete: "SET NULL",
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    gallery: {
        type: DataTypes.TEXT,
        allowNull: true,
    },

    soundQuality: {
        type: DataTypes.STRING(10), // none, no, noise, weak, mid, good
        allowNull: true
    },
    color: {
        type: DataTypes.SMALLINT, // 0 = colorfull, 1 = both, 2 = blackWhite
        allowNull: true
    },
    pictureEnvironment: {
        type: DataTypes.SMALLINT, // 0 = outer, 1 = inner
        allowNull: true
    },
    hasCameraShake: {
        type: DataTypes.SMALLINT,
        defaultValue: 0
    },
    hasLogo: {
        type: DataTypes.SMALLINT,
        defaultValue: 0
    },
    hasMusic: {
        type: DataTypes.SMALLINT,
        defaultValue: 0
    },
    hasMainLang: {
        type: DataTypes.SMALLINT, // null = not main language, 0 = not care, 1 = has main language
        allowNull: true
    },
    hasDubbed: {
        type: DataTypes.SMALLINT, // null = not dubbed, 0 = not care, 1 = has dubbed
        allowNull: true
    },
    hasSubtitle: {
        type: DataTypes.SMALLINT, // null = not subtitle, 0 = not care, 1 = has subtitle
        allowNull: true
    },
    hasNarration: {
        type: DataTypes.SMALLINT, // null = not Narration, 0 = not care, 1 = has Narration
        allowNull: true
    },
    narrationDescription: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    pictureDescription: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    gender: {
        type: DataTypes.SMALLINT, // 0 = female, 1 = male
        allowNull: true
    },
    ageRangeDefaultValueId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },


    dayNight: {
        type: DataTypes.STRING(10), // day, night, rise, sunset
        allowNull: true
    },
    qualityGrade: {
        type: DataTypes.SMALLINT, // 0, 1, 2, 3
        allowNull: true
    },
    isArchive: {
        type: DataTypes.SMALLINT,
        defaultValue: 0
    },
    pictureViewId: { //نمای تصویر
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "shot_default_values",
            key: "id",
            as: "shotDefaultValue",
        },
        onUpdate: "SET NULL",
        onDelete: "SET NULL",
    },
    pictureTypeId: { //نوع تصویر
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "shot_default_values",
            key: "id",
            as: "shotDefaultValue",
        },
        onUpdate: "SET NULL",
        onDelete: "SET NULL",
    },
    pictureModeId: { //حرکت دوربین
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "shot_default_values",
            key: "id",
            as: "shotDefaultValue",
        },
        onUpdate: "SET NULL",
        onDelete: "SET NULL",
    },
    ownerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "owners",
            key: "id",
            as: "owner",
        },
        onUpdate: "SET NULL",
        onDelete: "SET NULL",
    },
    duration: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    startDate: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    endDate: {
        type: DataTypes.STRING,
        allowNull: true,
    },

    status: { // init, cleaning , accept , reject
        type: DataTypes.STRING(20),
        allowNull: true,
    },

    shotStatus: { // 'init-check' , 'equalizing', 'equalize_confirm', 'equalize_confirm_edit', 'equalize_need_meeting'
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'init-check'
    },

    cleaningDescription: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    isAI: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        defaultValue: 0
    },
    aiTagsId: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    aiTagStatus: { // queue , pending, complete , error
        type: DataTypes.STRING(20),
        allowNull: true,
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
    },

})