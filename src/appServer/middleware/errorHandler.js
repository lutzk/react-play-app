const errorHandler = () => (err, req, res, next) => {
  console.log('_ERROR_HANDLER_');
  console.log(err);
  // add more specific response
  res
    .status(err.status || 500)
    .json({ error: err })
    .end();
};

export { errorHandler };
