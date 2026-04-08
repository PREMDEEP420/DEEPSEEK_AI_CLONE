import { User } from "../model/user.model.js";
import bcrypt from "bcryptjs";
import config from "../config.js";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  
  // Validation
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ errors: "All fields are required" });
  }
  if (password.length < 6) {
    return res.status(400).json({ errors: "Password must be at least 6 characters" });
  }
  if (!email.includes("@")) {
    return res.status(400).json({ errors: "Invalid email address" });
  }
  
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      return res.status(400).json({ errors: "Account already exists. Please login." });
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const newuser = new User({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashPassword,
    });
    await newuser.save();
    return res.status(201).json({ message: "Signup succeeded" });
  } catch (error) {
    console.log("Error in signup: ", error);
    return res.status(500).json({ errors: error.message || "Error in signup" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  
  // Validation
  if (!email || !password) {
    return res.status(400).json({ errors: "Email and password are required" });
  }
  
  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(403).json({ errors: "Account not found, please sign up / create an account" });
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(403).json({ errors: "Invalid Credentials" });
    }
    // jwt code
    const token = jwt.sign({ id: user._id }, config.JWT_USER_PASSWORD, {
      expiresIn: "1d",
    });

    const cookieOptions = {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    };

    res.cookie("jwt", token, cookieOptions);
    return res
      .status(201)
      .json({ message: "User loggedin succeeded", user, token });
  } catch (error) {
    console.log("Error in login: ", error);
    return res.status(500).json({ errors: "Error in login" });
  }
};

export const logout = (req, res) => {
  try {
    res.clearCookie("jwt");
    return res.status(200).json({ message: "Loggout succeeded" });
  } catch (error) {
    console.log("Error in logout: ", error);
    return res.status(500).json({ errors: "Error in logout" });
  }
};