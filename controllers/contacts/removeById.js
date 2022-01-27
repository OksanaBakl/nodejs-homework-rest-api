const { Contact } = require("../../models/contact");

const removeById = async (req, res, next) => {
	const { id } = req.params;
	try {
		const deleteContact = await Contact.findByIdAndRemove(id);
		if (!deleteContact) {
			const error = new Error("not found");
			error.status = 404;
			throw error;
		}
		res.json({ message: "contact deleted" });
	} catch (error) {
		next(error);
	}
};
module.exports = removeById;
