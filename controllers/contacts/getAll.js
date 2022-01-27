const { Contact } = require("../../models/contact");

const getAll = async (req, res, next) => {
	try {
		const { page = 1, limit = 5 } = req.query;
		const { favorite } = req.query;
		const { _id } = req.user;
		const skip = (page - 1) * limit;
		const contacts = await Contact.find({ owner: _id }, "-createdAt", {
			skip,
			limit: +limit,
		});
		if (favorite) {
			res.json(contacts.filter((item) => item.favorite));
		} else res.json(contacts);
	} catch (error) {
		next(error);
	}
};
module.exports = getAll;
