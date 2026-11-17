import ApiError from '../utils/ApiError.js';

const flattenIssues = (error) => {
  const fieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || 'form';
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
};

/**
 * Validates request body/params with Zod schemas.
 * Query strings are parsed by controllers (Express 5 exposes req.query as a
 * getter, so it cannot be reassigned). Parsed query is exposed as req.validatedQuery.
 */
export const validate = (schemas) => (req, res, next) => {
  try {
    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (!result.success) {
        throw ApiError.unprocessable('Please check the submitted values', flattenIssues(result.error));
      }
      req.body = result.data;
    }
    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) {
        throw ApiError.unprocessable('Invalid request parameters', flattenIssues(result.error));
      }
      req.params = result.data;
    }
    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (!result.success) {
        throw ApiError.unprocessable('Invalid query parameters', flattenIssues(result.error));
      }
      req.validatedQuery = result.data;
    }
    next();
  } catch (error) {
    next(error);
  }
};

export default validate;
