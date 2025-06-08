import Joi from "joi";

export const entrySchema = Joi.object({
  user_id: Joi.number().integer().optional(),
  title: Joi.string().min(3).required(),
  content: Joi.string().allow(''), 
  date: Joi.string().optional() 
});

export function validateEntry(data) {
  return entrySchema.validate(data);
}
