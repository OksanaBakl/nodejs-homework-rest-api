const { Contact } = require("../../models/contact");
const { NotFound } = require("http-errors");

const updateById = async (req, res, next) => {
	try {
		const { id } = req.params;
		const updateContact = await Contact.findByIdAndUpdate(id, req.body);
		if (!updateContact) {
			throw new NotFound();
		}
		res.json(updateContact);
    } catch (error) {
		next(error);
	}
};
module.exports = updateById;
