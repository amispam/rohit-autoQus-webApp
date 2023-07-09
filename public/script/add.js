
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
        }else{
            document.querySelector("#optional").style.display = "block";
            document.querySelector("#optional").innerHTML = '<label for="aA">option a</label><input type="text" id="aA" name="a" autocomplete="off"><label for="aB">option b</label><input type="text" id="aB" name="b" autocomplete="off"><label for="aC">option c</label><input type="text" id="aC" name="c" autocomplete="off"><label for="aD">option d</label><input type="text" id="aD" name="d" autocomplete="off"></input>';
            document.querySelectorAll("#optional input[type=text]").forEach(el=>{
                el.setAttribute("required", "ture");
            });
        }
    })
})