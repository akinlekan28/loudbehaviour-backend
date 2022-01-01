const paginationWithQuery =
  (model, customQuery, populate) => async (req, res, next) => {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    let query, total;
    if (customQuery.conditions && customQuery.conditions == "user") {
      query = model.find().where("user").equals(req.user.id);
      total = await model.countDocuments().where("user").equals(req.user.id);
    }
    if (customQuery.sort) {
      query = query.sort({ createdAt: -1 });
    }

    if (populate) {
      query = query.populate(populate);
    }
    const data = await query.skip(startIndex).limit(limit).exec();

    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }
    res.paginationWithQuery = {
      success: true,
      count: total,
      pagination,
      data,
    };

    next();
  };

module.exports = paginationWithQuery;
