const { Schema, model } = require("mongoose");
const Joi = require("joi");

const contactSchema = Schema({
	name: {
		type: String,
		required: [true, "Set name for contact"],
	},
	email: {
		type: String,
	},
	phone: {
		type: String,
	},
	favorite: {
		type: Boolean,
		default: false,
	},
	owner: {
		type: Schema.Types.ObjectId,
		ref: "user",
	},
});

const joiSchema = Joi.object({
	name: Joi.string().min(2).max(20).required(),

	email: Joi.string()

		.email({
			minDomainSegments: 2,
		})
		.required(),
	phone: Joi.string().required(),

	favorite: Joi.boolean(),
});

const Contact = model("contact", contactSchema);

module.exports = { Contact, joiSchema };
