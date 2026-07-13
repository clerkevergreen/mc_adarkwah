const mongoose = require('mongoose');

const MONGO_OPERATORS = ['$where', '$regex', '$ne', '$gt', '$gte', '$lt', '$lte', '$in', '$nin', '$exists', '$expr', '$and', '$or', '$nor', '$not', '$text', '$elemMatch'];

function stripMongoOperators(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(stripMongoOperators);
  return Object.keys(obj).reduce((acc, key) => {
    if (key.startsWith('$') && MONGO_OPERATORS.includes(key)) return acc;
    acc[key] = stripMongoOperators(obj[key]);
    return acc;
  }, {});
}

function sanitizeQuery(req, res, next) {
  if (req.query) {
    req.query = stripMongoOperators(req.query);
  }
  next();
}

function sanitizeBody(req, res, next) {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
    req.body = stripMongoOperators(req.body);
  }
  next();
}

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function parseQueryParam(value) {
  if (value === 'true' || value === 'false') {
    return value === 'true';
  }
  const num = Number(value);
  if (!isNaN(num) && isFinite(num)) return num;
  return value;
}

module.exports = { stripMongoOperators, sanitizeQuery, sanitizeBody, isValidObjectId, parseQueryParam };
