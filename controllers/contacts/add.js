const { BadRequest } = require("http-errors");
const { Contact, joiSchema } = require("../../models/contact");

const add = async (req, res, next) => {
	try {
		const { error } = joiSchema.validate(req.body);
		if (error) {
			throw new BadRequest(error.message);
		}
		const { _id } = req.user;
		const newContact = await Contact.create({ ...req.body, owner: _id });
		res.status(201).json(newContact);
	} catch (error) {
		if (error.message.includes("validation failed")) {
			error.status = 400;
		}
		next(error);
	}
};

module.exports = add;
