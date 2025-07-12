import Joi from "joi";

const validateSignUp = (user) => {
  const schema = Joi.object({
    email: Joi.string().min(5).trim().max(255).required().email(),
    password: Joi.string().min(5).trim().max(255).required(),
    name: Joi.string().min(3).trim().max(255).required(),
  });
  return schema.validate(user);
};

const validateSignUpMiddleware = (req, res, next) => {
  const { error } = validateSignUp(req.body);
  
  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
      status: "error"
    });
  }
  
  next();
};

export default validateSignUpMiddleware;
