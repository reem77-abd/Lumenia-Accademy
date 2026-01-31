const authService = require("../services/auth.service");

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const result = await authService.register({ name, email, password });

    return res.status(201).json({
      success: true,
      data: result, // { token, user }
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await authService.login({ email, password });

    return res.status(200).json({
      success: true,
      data: result, // { token, user }
    });
  } catch (err) {
    next(err);
  }
};

// optionnel (si tu veux /auth/me)
exports.me = async (req, res, next) => {
  try {
    // req.user est injecté par auth.middleware.js après vérification JWT
    return res.status(200).json({
      success: true,
      data: { user: req.user },
    });
  } catch (err) {
    next(err);
  }
};
