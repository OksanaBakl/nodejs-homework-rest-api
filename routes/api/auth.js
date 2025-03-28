const express = require("express");
const { BadRequest, Conflict, Unauthorized } = require("http-errors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../../models/user");
const gravatar = require("gravatar");
const { nanoid } = require("nanoid");
const { sendEmail } = require("../../helpers");

const { joiRegisterSchema, joiLoginSchema } = require("../../models/user");
const router = express.Router();

const { SECRET_KEY, SITE_NAME } = process.env;

router.post("/register", async (req, res, next) => {
	try {
		const { error } = joiRegisterSchema.validate(req.body);
		if (error) {
			throw new BadRequest(error.message);
		}
		const { name, email, password } = req.body;

		const user = await User.findOne({ email });
		if (user) {
			throw new Conflict("User already exist");
		}
		const salt = await bcrypt.genSalt(10);
		const hashPassword = await bcrypt.hash(password, salt);
		const verificationToken = nanoid();
		const avatarURL = gravatar.url(email);
		const newUser = await User.create({
			name,
			email,
			password: hashPassword,
			avatarURL,
			verificationToken,
		});
		const data = {
			to: email,
			subject: "Подтверждение email",
			html: `<a target="_blank" href="${SITE_NAME}/users/verify/${verificationToken}">Подтвердить email</a>`,
		};
		await sendEmail(data);
		res.status(201).json({
			user: {
				name: newUser.name,
				email: newUser.email,
			},
		});
	} catch (error) {
		next(error);
	}
});

router.post("/login", async (req, res, next) => {
	try {
		const { error } = joiLoginSchema.validate(req.body);
		if (error) {
			throw new BadRequest(error.message);
		}
		const { email, password } = req.body;
		const user = await User.findOne({ email });
		if (!user) {
			throw new Unauthorized("Email or password is wrong");
		}
		if (!user.verify) {
			throw new Unauthorized("Email not verify");
		}
		const passwordCompare = await bcrypt.compare(password, user.password);
		if (!passwordCompare) {
			throw new Unauthorized("Email or password is wrong");
		}

		const paqload = {
			id: user._id,
		};
		const token = jwt.sign(paqload, SECRET_KEY, { expiresIn: "1h" });
		await User.findByIdAndUpdate(user._id, { token });
		res.json({
			token,
		});
	} catch (error) {
		next(error);
	}
});

module.exports = router;
