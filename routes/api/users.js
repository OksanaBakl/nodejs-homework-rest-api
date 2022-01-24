const express = require("express");
const { NotFound, BadRequest } = require("http-errors");
const { nanoid } = require("nanoid");

const { User } = require("../../models/user");
const path = require("path");
const mkdirp = require("mkdirp");
const router = express.Router();
const { authenticate, upload } = require("../../middlewares");
const fs = require("fs/promises");
const UploadService = require("../../middlewares/file-upload");
const { sendEmail } = require("../../helpers");
const { SITE_NAME } = process.env;

const avatarsDir = path.join(__dirname, "../../", "public", "avatars");
router.get("/logout", authenticate, async (req, res, next) => {
	const { _id } = req.user;
	await User.findByIdAndUpdate(_id, { token: null });
	res.status(204).send();
});

router.get("/current", authenticate, async (req, res, next) => {
	const { name, email } = req.user;
	res.json({
		user: { name, email },
	});
});
router.patch(
	"/avatars",
	authenticate,
	upload.single("avatar"),
	async (req, res) => {
		const id = String(req.user._id);
		const file = req.file;
		const AVATAR_OF_USERS = process.env.AVATAR_OF_USERS;
		const destination = path.join(AVATAR_OF_USERS, id);
		await mkdirp(destination);

		const { path: tempUpload, filename } = req.file;
		const [extension] = filename.split(".").reverse();
		const newFileName = `${req.user._id}.${extension}`;
		const fileUpload = path.join(avatarsDir, newFileName);
		await fs.rename(tempUpload, fileUpload);

		const uploadService = new UploadService(destination);
		const avatarURL = await uploadService.save(file, id);
		await User.updateAvatar(id, avatarURL);

		res.json({ avatarURL });
	}
);

router.post("/verify", async (req, res, next) => {
	try {
		const { email } = req.body;
		if (!email) {
			throw new BadRequest("missing required field email");
		}
		const user = await User.findOne({ email });
		if (!user) {
			throw new NotFound("User not found");
		}
		if (user.verify) {
			throw new BadRequest("Verification has already been passed");
		}
		const { verificationToken } = user;
		const data = {
			to: email,
			subject: "Подтверждение email",
			html: `<a target="_blank" href="${SITE_NAME}/users/verify/${verificationToken}">Подтвердить email</a>`,
		};

		await sendEmail(data);

		res.json({ message: "Verification email sent" });
	} catch (error) {}
});
router.get("/verify/:verificationToken", async (req, res, next) => {
	try {
		const { verificationToken } = req.params;
		const user = await User.findOne({ verificationToken });
		if (!user) {
			throw new NotFound("User not found");
		}
		await User.findByIdAndUpdate(user._id, {
			verificationToken: null,
			verify: true,
		});
		res.json({ message: "Verification successful" });
	} catch (error) {
		next(error);
	}
});

module.exports = router;
