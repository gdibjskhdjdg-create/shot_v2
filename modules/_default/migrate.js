
const CreateTable = async (table, schema, queryInterface) => {
    Object.keys(schema).forEach(key => {
        if(schema[key].unique){
            schema[key].unique = true;
        }
    });

    await queryInterface.createTable(table, schema);
}

module.exports = CreateTable;