export const validateFields = (requiredFields) => {
  return (req, res, next) => {
    const missing = [];

    requiredFields.forEach((field) => {
      if (!req.body[field] || req.body[field].toString().trim() === "") {
        missing.push(field);
      }
    });

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Faltan los siguientes campos obligatorios: ${missing.join(", ")}`
      });
    }

    next();
  };
};