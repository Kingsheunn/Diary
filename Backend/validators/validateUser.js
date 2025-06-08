import Joi from "joi";

const validateUser = (user) => {
  const schema = Joi.object({
    name: Joi.string().min(5).max(255).trim().optional(),
    email: Joi.string().email().max(255).trim().optional(),
  }).min(1);
  return schema.validate(user);
};

export default validateUser;
