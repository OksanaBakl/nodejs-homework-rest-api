const express = require("express");
const { User } = require("../../models/user");
const path = require("path");
const mkdirp = require("mkdirp");
const router = express.Router();
const { authenticate, upload } = require("../../middlewares");
const fs = require("fs/promises");
const UploadService = require("../../middlewares/file-upload");

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

module.exports = router;
