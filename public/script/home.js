document.querySelector(".dropbtn").addEventListener("click", (evt)=>{
    document.querySelector(".dropdown").classList.toggle("display");
});

document.querySelector(".warning").style.display = "none";

document.querySelector(".warning>span>button").addEventListener("click", evt=>{
    document.querySelector(".warning").style.display = "none";
});

const usr = document.querySelector("#usr");
const pass = document.querySelector("#pass");
const cpass = document.querySelector("#cpass");

document.querySelector(".homeform form").addEventListener("submit", (evt)=>{
    if(usr.value.length < 5){
        evt.preventDefault();
        document.querySelector(".msg").innerHTML = `username must be atleast 5 characters long. Current length of username string is: ${usr.value.length}`;
        document.querySelector(".warning").style.display = "block";
    }else if(pass.value.length < 6 || cpass.value.length < 6){
        evt.preventDefault();
        document.querySelector(".msg").innerHTML = `both password and confirm password must be atleast 6 characters long. current password string length is: ${pass.value.length} and confirm password string length is: ${cpass.value.length}`;
        document.querySelector(".warning").style.display = "block";
    }else if(pass.value !== cpass.value){
        evt.preventDefault();
        document.querySelector(".msg").innerHTML = `password string ${pass.value} does not match with confirm password ${cpass.value}`;
        document.querySelector(".warning").style.display = "block";
    }
})