const { audience, validateAssertion } = require('./IAPauth');

const isUserAuthenticated = async (req, res, next) => {
  const assertion = req.header('X-Goog-IAP-JWT-Assertion');
  let email = 'None';
  try {
    const info = await validateAssertion(assertion);
    email = info.email;
    next();
  } catch (error) {
    return res.status(403).json({
      msg: 'Forbidden',
    });
    console.log(error);
  }
};

module.exports = { isUserAuthenticated };
