import Joi from "joi";

export const entrySchema = Joi.object({
  userId: Joi.number().integer().required(),
  title: Joi.string().min(3).required(),
  body: Joi.string().allow(''), 
  date: Joi.string().required() 
});

export function validateEntry(data) {
  return entrySchema.validate(data);
}
