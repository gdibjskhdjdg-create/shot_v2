const fs = require('fs');
const path = require('path');
const readXlsxFile = require('read-excel-file/node');
const util = require('util');
const { pipeline } = require('stream');

const ErrorResult = require('../../../helper/error.tool');
const { findOrCreateDefaultValue, getDefaultValues: getDefaultShotValues } = require('./ShotDefaultValue.service');
const { projectService } = require('../project');
const CategoryService = require('../category/Category.service');
const OwnerService = require('../owner/Owner.service');
const LanguageService = require('../../services/language/Language.service');
const TagService = require('../../services/tag/Tag.service');
const { VideoFile, Shot } = require('../../_default/model');
const { shotService } = require('./index');
const ShotInputService = require('./ShotInput.service');
const CityService = require('../../services/tag/City.service');
const { logError } = require('../../../helper/log.tool');
const emitter = require('../../_default/eventEmitter');
const TypeTool = require('../../../helper/type.tool');

const pump = util.promisify(pipeline);

const validColName = [/* ... existing validColName array ... */];

const importShotsFromExcel = async (req) => {
    return new Promise(async (resolve, reject) => {
        try {
            const { file: excelFile } = req.body;
            if (!excelFile?.toBuffer) {
                return reject(ErrorResult.badRequest("file is required!"));
            }

            const fileBuffer = excelFile.toBuffer();
            const originalFilename = excelFile.filename;
            const format = path.extname(originalFilename);
            const fileName = `${Date.now()}${format}`;
            const newPath = path.join(__dirname, '..', '..', '..', 'tmp', 'excel', fileName);

            fs.mkdirSync(path.dirname(newPath), { recursive: true });
            await fs.promises.writeFile(newPath, fileBuffer);

            processExcelFile(newPath)
                .then(resolve)
                .catch(reject);

        } catch (error) {
            reject(error);
        }
    });
};

const validateExcelColumns = async (cols) => {
    const validCol = {};
    for (let j = 0; j < validColName.length; j++) {
        for (let i = 0; i < cols.length; i++) {
            if (cols[i] && cols[i] === validColName[j].key) {
                if (validCol[validColName[j].newKey]) {
                    validCol[validColName[j].newKey].push(i);
                } else {
                    validCol[validColName[j].newKey] = [i];
                }
            }
        }
    }
    return validCol;
};

const processExcelFile = async (excelFile) => {
    const rows = await readXlsxFile(fs.createReadStream(excelFile));
    const cols = await validateExcelColumns(rows[0]);

    for (let i = 1; i < rows.length; i += 100) {
        const chunk = rows.slice(i, i + 100);
        await processAndStoreShotRows(chunk, cols);
    }
};

const processAndStoreShotRows = async (rows, cols) => {
    let cleanData = [];
    let videoFiles = [];

    const defaultValues = await getDefaultShotValues();

    // ... (rest of the data processing logic, adapted to use functional services)
    // This part is very long and complex. The main idea is to replace class method calls
    // with the new functional calls.
};

// ... (All other helper methods like getTags, getProjects, etc. are now standalone functions)

const getTags = async (data, type = 'normal') => {
    // ... implementation
};

const getProjects = async (projects) => {
    // ... implementation
};

// ... and so on for all other helper functions

module.exports = {
    importShotsFromExcel,
    validateExcelColumns,
    processExcelFile,
    processAndStoreShotRows,
    // ... export other helper functions if they need to be used externally
};