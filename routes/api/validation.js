const Joi = require("joi");

const patternName = "[a-zA-Z].*[\\s\\.]*";
const patternPhone = "\\(?(\\d{3})\\)?[- ]?(\\d{3})[- ]?(\\d{2})[- ]?(\\d{2})";
const patternId = "\\w{8}-\\w{4}-\\w{4}-\\w{4}-\\w{12}";

const schemaContact = Joi.object({
	name: Joi.string().pattern(new RegExp(patternName)).min(3).max(30).required(),
	email: Joi.string().email().required(),
	phone: Joi.string().pattern(new RegExp(patternPhone)).required(),
});

const schemaContactId = Joi.object({
	contactId: Joi.string().pattern(new RegExp(patternId)).required(),
});

const schemaUpdateContact = Joi.object({
	name: Joi.string().pattern(new RegExp(patternName)).min(3).max(30).optional(),
	email: Joi.string().email().optional(),
	phone: Joi.string().pattern(new RegExp(patternPhone)).optional(),
}).min(1);

const validate = async (schema, obj, res, next) => {
	try {
		await schema.validateAsync(obj);
		next();
	} catch (error) {
		res.status(400).json({
			status: "error",
			code: 400,
			message: `Field ${error.message.replace(/"/g, "")}`,
		});
	}
};

module.exports.validateContact = async (req, res, next) => {
	return await validate(schemaContact, req.body, res, next);
};

module.exports.validateContactId = async (req, res, next) => {
	return await validate(schemaContactId, req.params, res, next);
};

module.exports.validateUpdateContact = async (req, res, next) => {
	return await validate(schemaUpdateContact, req.body, res, next);
};
