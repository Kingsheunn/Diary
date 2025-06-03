import Joi from 'joi';

export function validateReminder(data) {
  const schema = Joi.object({
    remind: Joi.boolean().strict().required()
  });
  return schema.validate(data);
}
