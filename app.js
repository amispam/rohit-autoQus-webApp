//import stuff--------------------------------------
require('dotenv').config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const multer = require("multer");
const authorized = require("./routes/backblaze/backblaze");
const fs = require("fs");
const saltRounds = 10;
const upload = multer({dest: 'uploads/'});

//server stuff--------------------------------------
const port = process.env.PORT || 3000;
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.use(express.urlencoded({extended: true}));

//session stuff deploy------------------------------
app.set('trust proxy', 1);
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: true, maxAge: 24*3600*1000 },
    store: MongoStore.create({mongoUrl: process.env.DATABASE_URI})
}));

//session stuff local-------------------------------
// app.use(session({
//     secret: process.env.SESSION_SECRET,
//     resave: false,
//     saveUninitialized: false,
//     cookie: { secure: false, maxAge: 24*3600*1000 },
//     store: MongoStore.create({mongoUrl: process.env.DATABASE_URI})
// }));

//database stuff------------------------------------

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        minLength: 5,
        unique: true,
        required: true
    },
    password: {
        type: String,
        minLength: 6,
        required: true
    }
});

const User = mongoose.model("User", userSchema);

//route stuff---------------------------------------
app.route("/")
.get((req, res)=>{
    res.render("home");
})
.post((req, res)=>{
    const tempusr = req.body.username;
    const temppass = req.body.password;
    const tempcpass = req.body.cpassword;
    if(temppass === tempcpass){
        console.log("validation successfull");
        bcrypt.hash(temppass, saltRounds).then(hash=>{
            const tempUserData = new User({
                username: tempusr,
                password: hash
            });
            tempUserData.save().then(()=>{
                console.log("signup successfull");
                res.redirect("/login");
            }).catch(err=>{
                console.log("unable to register user.");
                res.redirect("/");
            });
        }).catch(err=>{console.log("uh oh some unexpected server while registering user.")});
    }else{
        console.log("failed to validate...");
        res.redirect("/");
    }
});

app.route("/login")
.get((req, res)=>{
    if(req.session.userid && req.session.authorized === true){
        User.findOne({_id: req.session.userid}).then(userinfo=>{
            res.render("dashboard", {userinfo: userinfo});
        }).catch(err=>{
            console.log("some error took place while finding you!");
        });
    }else{
        res.render("login");
    }
})
.post((req, res)=>{
    const tempusr = req.body.username;
    const temppass = req.body.password;
    User.findOne({username: tempusr}).then(foundUser=>{
        if(foundUser){
            bcrypt.compare(temppass, foundUser.password).then(result=>{
                if(result === true){
                    console.log("login successful...");
                    req.session.userid = foundUser._id;
                    req.session.authorized = true;
                    res.redirect("/dashboard");
                }else{
                    res.send("<h1>please enter the correct password...</h1>");
                }
            })
        }else{ res.send("<h1>Error: unable to find you in our database, please register first to login...</h1>");}
    }).catch(err=>{
        console.log("error while find execution.");
    })
});

app.get("/logout", (req, res)=>{
    req.session.destroy(err=>{
        if(err){
            console.log("unable to logout")
        }else{
            res.clearCookie('connect.sid');
            res.redirect("/login");
        }
    })
});

app.route("/dashboard")
.get((req, res)=>{
    console.log(req.session.userid,req.session.authorized);
    if(req.session.userid && req.session.authorized === true){
        User.findOne({_id: req.session.userid}).then(userinfo=>{
            res.render("dashboard", {userinfo: userinfo});
        }).catch(err=>{
            console.log("dashboard error.");
        });
    }else {
        res.redirect("/login");
    }
});

//paper schema----------------------------------------------
const paperSchema = new mongoose.Schema({
    class:{
        type: Number,
        required: true
    },
    subject:{
        type: String,
        required: true
    },
    score:{
        type: String,
        required: true
    },
    duration:{
        type: String,
        required: true
    },
    test:{
        type: String,
        required: true
    },
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});
const Paper = mongoose.model("Paper", paperSchema);
//questions schema-----------------------------------------
const questionSchema = new mongoose.Schema({
    qtype: {
        type: String,
        required: true
    },
    qus: {
        type: String,
        required: true
    },
    a: String,
    b: String,
    c: String,
    d: String,
    custom: [[]],
    paperid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Paper'
    },
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});
const Question = mongoose.model("Question", questionSchema);


app.route("/create")
.get((req, res)=>{
    if(req.session.userid && req.session.authorized === true){
        res.render("create");
    }else {
        res.redirect("/login");
    }
})
.post((req, res)=>{
    if(req.session.userid && req.session.authorized === true){
        const tempcls = req.body.class;
        const tempsub = req.body.subject;
        const tempscore = req.body.score;
        const tempduration = req.body.duration;
        const temptest = req.body.test;
        const tempPaper = new Paper({
            class: tempcls,
            subject: tempsub,
            score: tempscore,
            duration: tempduration,
            test: temptest,
            userid: req.session.userid
        });
        tempPaper.save().then(()=>{res.redirect("/paper");}).catch(err=>{console.log("unable to save...");});
    }
});

app.route("/paper")
.get(async (req, res)=>{
    if(req.session.userid && req.session.authorized === true){
        try{
            if(req.session.userid === process.env.SUPERUSER){
                const userinfo = await Paper.find({});
                res.render("paper", {userinfo: userinfo});
            }else{
                const userinfo = await Paper.find({userid: req.session.userid});
                res.render("paper", {userinfo: userinfo});
            }
        }catch(err){
            console.log("error while handeling paper...");
        }
    }
    else{
        res.redirect("/login");
    }
});

app.route("/add/:paperId")
.get((req, res)=>{
    if(req.session.userid && req.session.authorized === true){
        const customurl = req.params.paperId;
        Paper.findOne({_id: customurl}).then(userinfo=>{
            if(userinfo.userid.toString() === req.session.userid){
                const qusbank = [];
                Question.find({paperid: customurl}).then(qusfilter=>{
                    if(qusfilter){
                        for(el of qusfilter){
                            qusbank.push([el._id, el.qtype, el.qus]);
                        }
                        res.render("add", {userinfo: userinfo, qusbank: qusbank});
                    }else{
                        res.render("add", {userinfo: userinfo, qusbank: qusbank});
                    }
                });
            }else{
                res.redirect("/dashboard");
            }
        }).catch(err=>{console.log("error while validating paper"); res.redirect("/dashboard");});
    }else{
        res.redirect("/login");
    }
})
.post(upload.single('imgfile'), async(req, res)=>{
    if(authorized['authorizationToken']===null){
        await authorized.authorize();
    }
    let imageurl = [];

    if(req.session.userid && req.session.authorized === true){


        function restOfTheWork(){
            const customurl = req.params.paperId;
            Paper.findOne({_id: customurl}).then(userinfo=>{
                if(userinfo.userid.toString() === req.session.userid){
                    const opt = req.body.qtype;
                    if(opt === "opt"){
                        const tempQus = new Question({
                            qtype: req.body.qtype,
                            qus: req.body.qus,
                            a: req.body.a,
                            b: req.body.b,
                            c: req.body.c,
                            d: req.body.d,
                            paperid: customurl,
                            userid: req.session.userid
                        });
                        tempQus.save().then(()=>{res.redirect("/add/"+customurl);}).catch(err=>console.log("sorry, can not save at the moment..."));
                    }else if(opt !== "opt" && opt !== "custom"){
                        const tempQus = new Question({
                            qtype: req.body.qtype,
                            qus: req.body.qus,
                            paperid: customurl,
                            userid: req.session.userid
                        });
                        tempQus.save().then(()=>{res.redirect("/add/"+customurl);}).catch(err=>console.log(err));
                    }
                    else{
                        let tempcustomarray = [];
                        let columnone = [];
                        let columntwo = [];
                        let columnthree = [];
                        let columnmono = [];
                        Object.keys(req.body).forEach(el=>{
                            if(el.substring(0,1) == "l" ){
                                if(parseInt(el.substring(1,))%3===1){
                                    columnone.push(req.body[el]);
                                }else if(parseInt(el.substring(1,))%3 === 2){
                                    columntwo.push(req.body[el]);
                                }else{
                                    columnthree.push(req.body[el]);
                                }
                            }else if(el.substring(0,1) == "m"){
                                columnmono.push(req.body[el]);
                            }
                        });
                        tempcustomarray.push(columnone, columntwo, columnthree, req.body.subtext, columnmono, imageurl);
                        const tempQus = new Question({
                            qtype: req.body.qtype,
                            qus: req.body.qus,
                            custom: tempcustomarray,
                            paperid: customurl,
                            userid: req.session.userid
                        });
                        tempQus.save().then(()=>{res.redirect("/add/"+customurl);}).catch(err=>console.log(err));                   
                    }
                }else{
                    res.redirect("/dashboard");
                }
            }).catch(err=>{console.log("some serious error related to paper..."); res.redirect("/dashboard");});
        }

        let imagefile = req.file;
        let validatedData = "";
        if(imagefile){
            authorized.getUploadUrl({
                bucketId: process.env.BuCKET_ID
            }).then(result=>{
                validatedData = result.data;
                const fileData = imagefile.path;
                fs.promises.readFile(fileData).then(imagebufferdata=>{
                    authorized.uploadFile({
                        uploadUrl: validatedData.uploadUrl,
                        uploadAuthToken: validatedData.authorizationToken,
                        fileName: imagefile.originalname,
                        data: imagebufferdata
                    }).then((response)=>{
                        console.log(response.data.fileName);
                        imageurl.push('https://f005.backblazeb2.com/file/saveuserimage/'+String(response.data.fileName));
                        fs.unlink(fileData, err=>{});
                        restOfTheWork();
                    }).catch(err=>{
                        console.log("Opps: ", err);
                    })
                }).catch(err=>{
                    console.log("last error: ", err);
                });
                
            });
        }else{
            restOfTheWork();
        }

    }else{
        res.redirect("/login");
    }
});

app.route("/delete/:paperId")
.get((req, res)=>{
    const customurl = req.params.paperId;
    if(req.session.userid && req.session.authorized === true){
        Paper.findOne({_id: customurl}).then(foundPaper=>{
            if(foundPaper.userid.toString() === req.session.userid || req.session.userid === process.env.SUPERUSER){
                Paper.deleteOne({_id: customurl}).then(()=>{
                    Question.deleteMany({paperid: customurl}).then(()=>{
                        res.redirect("/paper");
                    }).catch(err=>{console.log("unable to delete question")});
                }).catch(err=>{
                    console.log("ubable to delete paper");
                });
            }else{
                res.send("<h1>Invalid request</h1>");
            }
        }).catch(err=>{
            console.log("seems your paper in not in our records...");
        });
    }else{res.redirect("/login");}
});

app.get("/delete/question/:questionid", (req, res)=>{
    const customurl = req.params.questionid;
    if(req.session.userid && req.session.authorized === true){
        Question.findOne({_id: customurl}).then(foundQuestion=>{
            const getpaperidbyqus = foundQuestion.paperid.toString();
            if(foundQuestion.userid.toString() === req.session.userid || req.session.userid === process.env.SUPERUSER){
                Question.deleteOne({_id: customurl}).then(()=>{
                    res.redirect("/add/"+getpaperidbyqus);
                }).catch(err=>{console.log("unable to delete perticular question...");});
            }
        }).catch(err=>{console.log("unable to find that perticular paper.");});
    }else{
        res.redirect("/login");
    }
});

app.get("/preview/:previewid", (req, res)=>{
    if(req.session.userid && req.session.authorized === true){
        const customurl = req.params.previewid;
        Paper.findOne({_id: customurl}).then(foundPaper=>{
            if(foundPaper.userid.toString() === req.session.userid || req.session.userid === process.env.SUPERUSER){
                const romanNum = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'xi', 'xii', 'xiii', 'xiv', 'xv', 'xvi', 'xvii', 'xviii', 'xix', 'xx', 'xxi', 'xxii', 'xxiii', 'xxiv', 'xxv', 'xxvi', 'xxvii', 'xxviii', 'xxix', 'xxx'];
                const qusNumber = 0;


                const clsData = foundPaper.class;
                const subData = foundPaper.subject;
                const scoData = foundPaper.score;
                const durData = foundPaper.duration;
                const tesData = foundPaper.test;
                const optData = [];
                const fibData = [];
                const tfData = [];
                const ansData = [];
                const customData = [];
                async function filterQus(){
                    const optional = await Question.find({paperid: customurl, qtype: 'opt'});
                    const fib = await Question.find({paperid: customurl, qtype: 'fib'});
                    const tf = await Question.find({paperid: customurl, qtype: 'tf'});
                    const ans = await Question.find({paperid: customurl, qtype: 'ans'});
                    const custom = await Question.find({paperid: customurl, qtype: 'custom'});
                    let romanIndex = 0;
                    optional.forEach(el=>{
                        optData.push([el['qus'], el['a'], el['b'], el['c'], el['d'], romanNum[romanIndex] ]);
                        romanIndex += 1;
                    });
                    romanIndex = 0;
                    fib.forEach(el=>{
                        fibData.push([el['qus'], romanNum[romanIndex] ]);
                        romanIndex += 1;
                    });
                    romanIndex = 0;
                    tf.forEach(el=>{
                        tfData.push([el['qus'], romanNum[romanIndex] ]);
                        romanIndex+=1;
                    });
                    romanIndex = 0;
                    ans.forEach(el=>{
                        ansData.push([el['qus'], romanNum[romanIndex] ]);
                        romanIndex+=1;
                    });
                    custom.forEach(el=>{
                        customData.push([el['qus'], el['custom'] ]);
                    });
                    res.render("preview", {sub: subData, cls: clsData, sco: scoData, dur: durData, tes: tesData, opt: optData, fib: fibData, tf: tfData, ans: ansData, qusNumber: qusNumber, customdata: customData });
                }
                filterQus();
                
            }else{
                res.send("<h1>invalid request</h1>");
            }
        }).catch(err=>{console.log("that paper seems does not exists..."); res.send("<h1>I am not interested in processing your invalid request</h1>")});
    }else{
        res.redirect("/login");
    }
});

app.get("/panel", (req, res)=>{
    res.render("panel");
});

require("./routes/routes")(app);

async function mainFun(){
    try{
        await mongoose.connect(process.env.DATABASE_URI, {useNewUrlParser:true,useUnifiedTopology: true});
        console.log("connected to the database");
        app.listen(port, (req, res)=>{
        console.log(`server started, listening at port ${port}`);
});
        
    }catch(err){
console.log("unable to connect to the database");
    }
}
mainFun();
