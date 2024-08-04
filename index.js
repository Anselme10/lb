require("dotenv").config();
const bcrypt = require("bcrypt");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const socketIO = require("socket.io");

const app = express();

const mongodbUri = process.env.MONGODB_URI;

const cors = require("cors");

const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());
const jwt = require("jsonwebtoken");

mongoose
  .connect(mongodbUri)
  .then(() => {
    console.log("Conected to MongoDB");
  })
  .catch((err) => {
    console.log("Error connecting to MongoDB", err);
  });

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });

  socket.on("newOrder", async (data) => {
    console.log("New order received:", data);

    const order = await Order.findById(data._id);

    if (!order) {
      return;
    }

    const orderStatus = order.status;

    io.emit("orderStatus", orderStatus);
  });
  socket.on("newOrder", async (driverRs) => {
    console.log("The driver said:", driverRs);
    const clientResp = "ok thanks";
    io.emit("orderStatus", clientResp);
  });
});

const User = require("./models/user");
const Car = require("./models/carType");
const Order = require("./models/orders");
const CarSelling = require("./models/carSelling");
const Rent = require("./models/carRent");
const Seller = require("./models/seller");
const CarOrder = require("./models/carsOrders");
const RentOrder = require("./models/rentOrder");
const Chat = require("./models/chat");

app.get("/", (req, res) => {
  res.send("Welcome to my backend application!");
});

app.post("/location/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const { latitude, longitude } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    user.location.latitude = latitude;
    user.location.longitude = longitude;
    await user.save();

    res.status(200).json({ message: "User location updated successfully" });
  } catch (error) {
    console.log("Error saving location", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/userInfo", async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ userInfo: user });
  } catch (error) {
    console.log("Error fetching user info", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ message: "User already exist" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    newUser.verificationToken = crypto.randomBytes(20).toString("hex");

    await newUser.save();

    sendVerificationEmail(newUser.email, newUser.verificationToken);

    res.status(201).json({ message: "Registration successful" });
  } catch (error) {
    console.log("Error registering user", error);
    res.status(500).json({ message: "Registration failed" });
  }
});

const sendVerificationEmail = async (email, verificationToken) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Email Verification",
    text: `click the following link to verify your email: http://localhost:3000/verify/${verificationToken}`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log("Error sending the verification email: ", error);
  }
};

app.get("/verify/:token", async (req, res) => {
  try {
    const token = req.params.token;
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(404).json({ message: "Invalid verification token" });
    }

    user.verified = true;
    user.verificationToken = undefined;
    await user.save();
    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "Email verification failed" });
  }
});

const generateSecretKey = () => {
  const secretKey = crypto.randomBytes(32).toString("hex");
  return secretKey;
};

const secretKey = generateSecretKey();

const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

app.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    const resetCode = generateCode();
    const resetPasswordExpires = Date.now() + 3600000; // 1 hour

    user.resetPasswordCode = resetCode;
    user.resetPasswordExpires = resetPasswordExpires;

    await user.save();

    // Send email with the code
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "venioga100@gmail.com",
        pass: "qkbpnuugrcvlunee",
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset Code",
      text: `Your password reset code is: ${resetCode}`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Password reset code sent" });
  } catch (error) {
    res.status(500).json({ message: "Error processing request" });
  }
});

app.post("/reset-code", async (req, res) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({
      email,
      resetPasswordCode: code,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    if (user.resetPasswordCode != code) {
      return res.status(400).json({
        success: false,
        message: "Invalid reset code. Please check your code and try again.",
      });
    }

    res.status(200).json({ message: "Successful" });
  } catch (error) {
    res.status(500).json({ message: "Error resetting code" });
  }
});
app.post("/reset-password", async (req, res) => {
  try {
    console.log("1");
    const { email, password } = req.body;
    console.log("2");
    const user = await User.findOne({ email });
    console.log("3");

    if (!user) {
      console.log("4");
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    console.log("4");
    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordCode = undefined;
    console.log("4");
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: "Error resetting password" });
  }
});

app.post("/login", async (req, res) => {
  console.log("Login route hit");
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Incorrect passwords" });
    }

    const name = user.name;

    console.log(name);

    const token = jwt.sign({ userId: user._id }, secretKey);

    res.status(200).json({ token, name });
  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
});

app.get("/location/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { latitude, longitude } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).send("User not found");
    }

    user.location = { latitude, longitude };

    await user.save();

    res.status(200).send("Location updated successfully");
  } catch (error) {
    console.log("Error updating location: ", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/user/fetchcar", async (req, res) => {
  try {
    const cars = await Car.find();
    res.status(200).json(cars);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
app.post("/user/order", async (req, res) => {
  try {
    const { type, originPlace, destinationPlace, userId, carId } = req.body;
    const cars = await Car.find();

    const newOrder = new Order({
      type: type,
      originLatitude: originPlace.data.geometry.location.lat,
      originLongitude: originPlace.data.geometry.location.lng,
      destinationLAtitude: destinationPlace.data.geometry.location.lat,
      destinationLongitude: destinationPlace.data.geometry.location.lng,
      userId: userId,
      carId: carId.toString(),
      status: "NEW",
    });

    await newOrder.save();
    res.status(200).json(newOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
app.get("/user/orderedcar/:carId", async (req, res) => {
  try {
    const { carId } = req.params;
    const orderedCar = await Car.findById(carId);

    res.status(200).json(orderedCar);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/user/forsalescars", async (req, res) => {
  try {
    const Carforsell = await CarSelling.find();

    res.status(200).json(Carforsell);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
app.get("/user/carrent", async (req, res) => {
  try {
    const carForRent = await Rent.find();

    res.status(200).json(carForRent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/user/rentsubmit", async (req, res) => {
  try {
    const { vehicle, userId } = req.body;

    const sellerId = vehicle.seller;

    const seller = await Seller.findById(sellerId);

    seller.rentCars.push(vehicle._id);

    await seller.save();

    res.status(200).json(seller);
  } catch (error) {
    console.log("Error sending rent car", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/carorder", async (req, res) => {
  try {
    const { sellingCar, userId } = req.body;

    if (!sellingCar) {
      return console.log("Car doen't exist");
    }
    console.log(sellingCar);

    const newCarOrder = new CarOrder({
      userId: userId,
      carId: sellingCar._id,
    });
    await newCarOrder.save();

    res.status(200).json({ message: "Car sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Car sending failed" });
  }
});
app.post("/rentorder", async (req, res) => {
  try {
    const { rentorder, userId } = req.body;

    if (!rentorder) {
      returnconsole.log("RentCar doen't exist");
    }
    console.log(rentorder);

    const newCarOrder = new CarOrder({
      userId: userId,
      carId: rentorder._id,
    });
    await newCarOrder.save();

    res.status(200).json({ message: "Car sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Car sending failed" });
  }
});

app.get("/user/message", async (req, res) => {
  try {
    const { senderId, receiverId } = req.query;

    console.log("senderId: ", senderId);
    console.log("receiverId: ", receiverId);

    const messages = await Chat.find({
      $or: [
        { users: { senderId: senderId, receiverId: receiverId } },
        { users: { senderId: receiverId, receiverId: senderId } },
      ],
    });

    console.log("Messages are: ", messages);

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error fetching messages", error);
    res.status(500).json({ error: "Error fetching messages" });
  }
});

//const restPort = 3000;
const restPort = process.env.PORT || 3000;

app.listen(restPort, () => {
  console.log("REST API server is running on port", restPort);
});
