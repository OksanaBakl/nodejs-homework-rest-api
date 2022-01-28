const { NotFound } = require("http-errors");
const { Contact } = require("../../models/contact");

const getById = async (req, res, next) => {
	const { id } = req.params;
	try {
		const contact = await Contact.findById(id);

		if (!contact) {
			throw new NotFound();
		}

		res.json(contact);
	} catch (error) {
		if (error.message.includes("Cast to ObjectId failed")) {
			error.status = 404;
		}
		next(error);
	}
};
module.exports = getById;
