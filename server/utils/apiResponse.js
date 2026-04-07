export const apiResponse = (res, statusCode, success, message, data = null, pagination = null) => {
  const response = { success, message };
  if (data !== null) response.data = data;
  if (pagination !== null) response.pagination = pagination;
  return res.status(statusCode).json(response);
};

export const successResponse = (res, message, data = null, statusCode = 200) =>
  apiResponse(res, statusCode, true, message, data);

export const errorResponse = (res, message, statusCode = 400) =>
  apiResponse(res, statusCode, false, message);
