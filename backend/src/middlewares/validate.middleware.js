export function validate(schema, property = "body") {
  return (req, res, next) => {
    try {
      const data = req[property];

      const { value, error } =
        typeof schema.validate === "function"
          ? schema.validate(data, { abortEarly: false, stripUnknown: true })
          : { value: data, error: null };

      if (error) {
        const err = new Error("Validation error");
        err.status = 422;
        err.code = "VALIDATION_ERROR";
        err.details = error.details?.map((d) => ({
          path: d.path?.join("."),
          message: d.message,
        })) || error;
        throw err;
      }

      req[property] = value;
      next();
    } catch (err) {
      next(err);
    }
  };
}
