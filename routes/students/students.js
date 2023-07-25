const express = require("express");
const router = express.Router();
const studentdb = require("../../database/studentSchema");

const mydate = new Date();
let currentYear = "";

const studentSchema = studentdb.schema;
const Student = studentdb.model;

router.get("/", (req, res)=>{
    if(req.session.userid && req.session.authorized === true){
        currentYear = mydate.getFullYear();
        res.render("students");
    }else{
        res.redirect("/login");
    }
});

router.post("/", (req, res)=>{
    if(req.session.userid && req.session.authorized === true){
        const data = req.body;
        const tempData = new Student({
            name: String(data.stdname).toLowerCase(),
            gaurdian: String(data.fatname).toLowerCase(),
            class: data.class,
            roll: data.rollnum,
            reg: String(currentYear)+"/UM/"+String(data.class)+String(data.rollnum),
            contact: data.phon,
            author: req.session.userid
        });
        tempData.save().then(()=>{
            console.log("student registered successfully");
            res.redirect("/students");
        }).catch(err=>{
            console.log("Error while registering student.");
            res.send("unable to register the student please try again!");
        });
    }else{
        res.redirect("/login");
    }
});

module.exports = router;