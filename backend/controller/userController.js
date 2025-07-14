const hostTenent = require("../models/TenentSchema");
const mongoose = require("mongoose");
const dbCounter = require("../utils/masterDb");
const { initializeCounters } = require("../utils/sequenceGenerator");

const { getTenantConnection } = require("../utils/db");
const bcrypt = require("bcrypt");
const { hostUser, getDynamicUser } = require("../models/UserRolesSchema");
const getTenantDataModel = require("../models/BotAssignmentSchema");
const botSchema = require("../models/BotSchema");
const userSchema = require("../models/UsersSchema");
exports.registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      orgName,
      industry,
      orgSize,
      location,
      selectedBots,
      phoneNumber,
    } = req.body;
    console.log("req.body", req.body);
    console.log(
      "req.bosy",
      name,
      email,
      password,
      orgName,
      industry,
      orgSize,
      phoneNumber
    );
    if (
      !name ||
      !email ||
      !password ||
      !orgName ||
      !industry ||
      !orgSize ||
      !phoneNumber ||
      !location
    ) {
      return res.status(400).json({
        message:
          "Please enter all required fields (name, email, password, orgName, industry, orgSize, location).",
      });
    }
    await initializeCounters();
    let createdHostUser;
    let counter = await dbCounter.findOne();
    if (!counter) {
      counter = await dbCounter.create({ lastDbId: 1 });
    } else {
      counter.lastDbId += 1;
      await counter.save();
    }
    const newTenent = new hostTenent({
      orgName,
      industry,
      orgSize,
      location,
    });
    const createdHostTenent = await newTenent.save();

    try {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const newHostUser = new hostUser({
        name,
        email,
        password: hashedPassword,
        phoneNumber,
      });
      createdHostUser = await newHostUser.save();
      console.log("User created in HOST db", createdHostUser);
    } catch (err) {
      console.log("err in hostUSer collection", err);
    }

    let tenantConnection;
    const dbName = `${counter.lastDbId}`;
    tenantConnection = await getTenantConnection(dbName);
    console.log("tenantConnection", tenantConnection);
    const dynamicUser = getDynamicUser(tenantConnection);
    console.log("dynamicuser", dynamicUser);
    let createdDynamicUser;
    try {
      try {
        const newDynamicUser = new dynamicUser({
          name: createdHostUser.name,
          email: createdHostUser.email,
          phoneNumber: createdHostUser.phoneNumber,
          password: createdHostUser.password,
          userId: createdHostUser.userId,
        });

        createdDynamicUser = await newDynamicUser.save();
      } catch (err) {
        console.log("err in catch  block of newDynamicUser ", err);
      }
      const dynamicAssignement = getTenantDataModel(tenantConnection);
      try {
        selectedBots.map(async (bot) => {
          let newBot = new botSchema({
            botTypeId: bot.id,
            tenentId: createdHostTenent.tenentId,
          });

          const botList = await newBot.save();
          let newDynamicAssignement = new dynamicAssignement({
            botId: botList.botId,
            botTypeId: bot.id,
          });
          const dd = newDynamicAssignement.save();
        });
      } catch (err) {
        console.log("err in seleted baots", err);
      }

      const userDetails = new userSchema({
        tenentId: createdHostTenent.tenentId,
        userId: createdHostUser.userId,
        personName: createdHostUser.name,
        phoneNumber: createdHostUser.phoneNumber,
        email: createdHostUser.email,
        password: createdHostUser.password,
        dbName: "T" + `${dbName}`,
      });
      userDetails.save();
      res.status(200).send(createdDynamicUser);
    } catch (err) {
      console.log("err in catch block", err);
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
