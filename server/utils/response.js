export const ok = (res, data = null, meta = undefined, statusCode = 200) => {
  const payload = { success: true, data };
  if (meta) payload.meta = meta;
  return res.status(statusCode).json(payload);
};

export const created = (res, data, meta = undefined) => ok(res, data, meta, 201);

export const message = (res, text, data = null, statusCode = 200) =>
  res.status(statusCode).json({ success: true, message: text, data });

export default ok;
