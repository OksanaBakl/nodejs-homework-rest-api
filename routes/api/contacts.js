const express = require("express");
const router = express.Router();
const { authenticate } = require("../../middlewares");
const { Contact } = require("../../models/contact");
const { joiSchema } = require("../../models/contact");

router.get("/", authenticate, async (req, res, next) => {
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
});

router.get("/:id", authenticate, async (req, res, next) => {
	const { id } = req.params;
	try {
		const contact = await Contact.findById(id);

		if (!contact) {
			const error = new Error("not found");
			error.status = 404;
			throw error;
		}

		res.json(contact);
	} catch (error) {
		if (error.message.includes("Cast to ObjectId failed")) {
			error.status = 404;
		}
		next(error);
	}
});

router.post("/", authenticate, async (req, res, next) => {
	try {
		const { error } = joiSchema.validate(req.body);
		if (error) {
			error.status = 400;
			throw error;
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
});

router.delete("/:id", authenticate, async (req, res, next) => {
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
});

router.put("/:id", authenticate, async (req, res, next) => {
	try {
		const { id } = req.params;
		const updateContact = await Contact.findByIdAndUpdate(id, req.body);
		res.json(updateContact);
	} catch (error) {
		next(error);
	}
});

router.patch("/:contactId/favorite", authenticate, async (req, res, next) => {
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
});

module.exports = router;
