const { Contact } = require("../../models/contact");

const updateFavorite = async (req, res, next) => {
	try {
		const { contactId } = req.params;
		const { favorite } = req.body;

		const updateStatusContact = await Contact.findByIdAndUpdate(
			contactId,
			{ favorite },
			{ new: true }
		);
		if (!updateStatusContact) {
			const error = new Error({ message: "missing field favorite" });
			error.status = 400;
			throw error;
		}
		res.json(updateStatusContact);
	} catch (error) {
		next(error.message);
	}
};
module.exports = updateFavorite;
