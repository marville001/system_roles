const db = require("../db/db");
const { validateUsers } = require("../helpers/validateUser");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const Joi = require("joi");
const _ = require("lodash");
const generateToken = require("../helpers/generateToken");

module.exports = {
  loginUser: async (req, res) => {
    const schema = Joi.object().keys({
      email: Joi.string().email().required(),
      password: Joi.string().min(8).required(),
    });
    const { error } = schema.validate(req.body);
    if (error)
      return res
        .status(400)
        .send({ success: false, message: error.details[0].message });

    const { email, password } = req.body;

    const { recordset } = await db.exec("userByEmailGet", { email });

    const user = recordset[0];
    if (!user)
      return res.status(404).send({ message: "Account does not exist" });
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(404).send({ message: "Invalid email or password" });

    const token = generateToken(user.email, user._id, user.isAdmin);
    res.send({
      user: _.pick(user, [
        "_id",
        "first",
        "last",
        "email",
        "gender",
        "age",
        "isAdmin",
      ]),
      token,
    });
  },

  registerUser: async (req, res) => {
    const { error } = validateUsers(req.body);
    if (error)
      return res
        .status(400)
        .send({ success: false, message: error.details[0].message });

    const { recordset } = await db.exec("userByEmailGet", { email: req.body.email });

    const user = recordset[0];
    if (user)
      return res.status(404).send({ message: "Account exists with the given email" });

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(req.body.password, salt);
    const { firstname, email, gender, age, lastname, isAdmin } = req.body;
    const id = uuidv4();
    const admin = isAdmin ? 1 : 0;
    try {
      await db.exec("userRegister", {
        id,
        firstname,
        lastname,
        password,
        email,
        gender,
        age,
        isAdmin: admin,
      });
      await db.query(
        "INSERT INTO dbo.registration_email_queue (user_id, active) VALUES ('" +
          id +
          "', 1)"
      );
      res.send({ message: "User registered successfully" });
    } catch (error) {
      res.status(500).send({ message: "Internal Server Error" });
    }
  },
};
