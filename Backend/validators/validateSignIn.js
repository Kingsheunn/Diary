import Joi from "joi";

const validateSignIn = (user) => {
  const schema = Joi.object({
    email: Joi.string().min(5).trim().max(255).required().email(),
    password: Joi.string().min(5).trim().max(255).required(),
  });
  return schema.validate(user); 
};

const validateSignInMiddleware = (req, res, next) => {
  const { error } = validateSignIn(req.body);
  
  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
      status: "error"
    });
  }
  
  next();
};

export default validateSignInMiddleware;
