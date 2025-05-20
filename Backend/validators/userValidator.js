import Joi from "joi";

export const userSchema = Joi.object({
  name: Joi.string().min(3).required(),
  age: Joi.number().min(1).max(99).required(),
});