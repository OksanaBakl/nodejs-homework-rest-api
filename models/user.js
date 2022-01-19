const { Schema, model } = require("mongoose");
const Joi = require("joi");

const emailRegexp = /^\w+([\\.-]?\w+)+@\w+([\\.:]?\w+)+(\.[a-zA-Z0-9]{2,3})+$/;
const userSchema = Schema(
	{
		name: {
			type: String,
			required: [true, "Set name for contact"],
		},
		email: {
			type: String,
			match: emailRegexp,
			require: true,
			unique: true,
		},
		password: {
			type: String,
			minlength: 6,
			require: true,
		},
		token: {
			type: String,
			default: null,
		},
		avatarURL: {
			type: String,
			default: "",
		},
	},
	{ versionKey: false, timestamps: true }
);

const joiRegisterSchema = Joi.object({
	name: Joi.string().min(2).max(20).required(),
	email: Joi.string().pattern(emailRegexp).required(),
	password: Joi.string().min(6).required(),
});

const joiLoginSchema = Joi.object({
	email: Joi.string().pattern(emailRegexp).required(),
	password: Joi.string().min(6).required(),
});

const User = model("user", userSchema);

module.exports = { User, joiRegisterSchema, joiLoginSchema };
