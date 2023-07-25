
document.querySelectorAll("#optional input[type=text]").forEach(el=>{
    el.setAttribute("required", "ture");
});

document.querySelectorAll(".aqtype input[type=radio]").forEach(el=>{
    el.addEventListener("click", (evt)=>{
        if(evt.target.checked && evt.target.value !== "opt"){
            // document.querySelectorAll("#optional input[type=text]").forEach(el=>{
            //     el.setAttribute("required", "false");
            // });
            document.querySelector("#optional").innerHTML = '';
            if(evt.target.value === "custom"){
                document.getElementById("addcustom").style.display = "block";
            }
            else if(evt.target.value !== "addcustom"){
                document.getElementById("addcustom").style.display = "none";
            }
        }else{
            document.getElementById("addcustom").style.display = "none";
            document.querySelector("#optional").style.display = "block";
            document.querySelector("#optional").innerHTML = '<label for="aA">option a</label><input type="text" id="aA" name="a" autocomplete="off"><label for="aB">option b</label><input type="text" id="aB" name="b" autocomplete="off"><label for="aC">option c</label><input type="text" id="aC" name="c" autocomplete="off"><label for="aD">option d</label><input type="text" id="aD" name="d" autocomplete="off"></input>';
            document.querySelectorAll("#optional input[type=text]").forEach(el=>{
                el.setAttribute("required", "ture");
            });
        }
    })
});

let customindex = 1;
function addmorelist(){
    document.getElementById("addlistgrid").innerHTML += '<div><input type="text" id="specialInput" name="l'+(customindex*3+1)+'" autocomplete="off"></div><div><input type="text" id="specialInput" name="l'+(customindex*3+2)+'" autocomplete="off"></div><div><input type="text" id="specialInput" name="l'+(customindex*3+3)+'" autocomplete="off"></div>';
    customindex+=1;
}
let monoIndex = 2;
function addmono(){
    document.getElementById("addmono").innerHTML += '<div><input type="text" id="mono" name="mono'+(monoIndex)+'" autocomplete="off"></div>';
    monoIndex+=1;
}