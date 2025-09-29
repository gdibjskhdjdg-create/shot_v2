
exports.createPaginationQuery = (query, page, take) => {
    if (page < 1) page = 1;

    if (take !== null && page !== null && page > 0 && take > 0) {
        query.offset = parseInt((page - 1) * take);
        query.limit = parseInt(take);
    }
    return query;
};