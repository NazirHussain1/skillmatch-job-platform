const sanitizeString = (value) => {
  if (typeof value !== 'string') {
    return value;
  }

  return value.replace(/\0/g, '');
};

const sanitizeObject = (value) => {
  if (Array.isArray(value)) {
    return value.map(sanitizeObject);
  }

  if (value && typeof value === 'object') {
    const sanitized = {};

    Object.keys(value).forEach((key) => {
      // Prevent Mongo-style operator injection via keys like "$ne" and dotted paths.
      const cleanKey = key.replace(/^\$+/g, '').replace(/\./g, '');

      if (!cleanKey) {
        return;
      }

      sanitized[cleanKey] = sanitizeObject(value[key]);
    });

    return sanitized;
  }

  return sanitizeString(value);
};

const sanitizeInputs = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }

  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }

  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeObject(req.params);
  }

  next();
};

module.exports = sanitizeInputs;
