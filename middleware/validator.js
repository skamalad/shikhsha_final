const { check } = require('express-validator');

module.exports = {
  validateConfirmPassword: check('confPassword')
    .trim()
    .custom(async (confPassword, { req }) => {
      const password = req.body.password;
      if (password !== confPassword) {
        throw new Error('Passwords must be the same');
      }
    }),
};
