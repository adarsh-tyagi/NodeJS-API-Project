const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

exports.user_signup = async (req, res, next) => {
  User.find({ email: req.body.email })
    .exec()
    .then((user) => {
      if (user.length > 0) {
        return res.status(409).json({ message: "Email id already exists." });
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).json({
              error: err,
            });
          } else {
            const user = new User({
              _id: mongoose.Types.ObjectId(),
              email: req.body.email,
              password: hash,
            });
            user
              .save()
              .then((result) => {
                res.status(200).json({ message: "User created" });
              })
              .catch((err) => {
                res.status(500).json({ error: err });
              });
          }
        });
      }
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
};

exports.user_login = async (req, res, next) => {
  User.find({ email: req.body.email })
    .exec()
    .then((user) => {
      if (user.length < 1) {
        return res
          .status(409)
          .json({ message: "Auth failed, email not found" });
      }
      bcrypt.compare(req.body.password, user[0].password, (err, result) => {
        if (err) {
          return res
            .status(409)
            .json({ message: "Auth failed, password invalid" });
        }
        if (result) {
          const token = jwt.sign(
            { email: user[0].email, userId: user[0]._id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "10h" }
          );
          return res.status(200).json({
            message: "Auth successful",
            token: token,
          });
        }
        return res
          .status(409)
          .json({ message: "Auth failed, password invalid" });
      });
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
};

exports.user_delete = async (req, res) => {
  User.remove({ _id: req.params.userId })
    .exec()
    .then((result) => {
      res.status(200).json({ message: "User deleted" });
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
};
