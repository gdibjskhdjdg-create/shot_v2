module.exports = (DataTypes) => ({
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
    },
    projectId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "projects",
            keys: "id",
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
            keys: "id",
            as: "user",
        },
        onUpdate: "SET NULL",
        onDelete: "SET NULL",
    },
    videoFileId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "video_files",
            keys: "id",
            as: "videoFile",
        },
        onUpdate: "SET NULL",
        onDelete: "SET NULL",
    },
    cityId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "city",
            keys: "id",
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
    startTime: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    endTime: {
        type: DataTypes.STRING(20),
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
            keys: "id",
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
            keys: "id",
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
            keys: "id",
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
            keys: "id",
            as: "owner",
        },
        onUpdate: "SET NULL",
        onDelete: "SET NULL",
    },

    startDate: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    endDate: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    status: { // 'init-check' , 'equalizing', 'equalize_confirm', 'equalize_confirm_edit', 'equalize_need_meeting'
        type: DataTypes.STRING(30),
        allowNull: true,
    },

    /* This commented for equalize table, create after shot and cannot be references */
    // lastEqualizeLogId: {
    //     type: DataTypes.INTEGER,
    //     allowNull: true,
    //     references: {
    //         model: "equalizer_log",
    //         keys: "id",
    //         as: "equalizer_log",
    //     },
    //     onUpdate: "SET NULL",
    //     onDelete: "SET NULL",
    // },
    rate: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    UUID: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
    }
})