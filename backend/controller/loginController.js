const usersSchema = require("../models/UsersSchema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.loginUser = async (req, res) => {
  try {
    const { userId, password } = req.body;
    const user = await usersSchema.findOne({ userId });
    if (!user) {
      return res.status(404).json({ message: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: user.userId,
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "15m" }
    );
    res.status(200).send({
      loginUser: user,
      token: token,
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).send({ message: "Internal server error" }, error);
  }
};
