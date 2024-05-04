// higher order functions to catch errors
const asyncHandler = (func) => {
  return async (req, res, next) => {
    try {
      await func(req, res, next);
    } catch (error) {
      res.status(error.code || 500).json({
        success: false,
        message: error.message,
        stack: error.stack,
      });
    }
  };
};

module.exports = asyncHandler;
