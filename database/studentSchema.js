const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
    name: String,
    gaurdian: String,
    class: Number,
    roll: Number,
    reg:{
        type: String,
        required: true,
        unique: true
    },
    contact: BigInt,
    author: String
});

const Student = mongoose.model("Student", studentSchema);

const payload = {
    schema: studentSchema,
    model: Student
}

module.exports = payload;