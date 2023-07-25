const express = require("express");
const testroute = require("./contact/contact");
const studentroute = require("./students/students");
const resultroute = require("./results/results");

module.exports = (app)=>{
    app.use(express.json());
    app.use("/contact", testroute);
    app.use("/students", studentroute);
    app.use("/results", resultroute);
};