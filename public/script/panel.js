const zdisplay = document.getElementById("zdisplay");
const zlatex = document.getElementById("zlatex");
const cpy = document.getElementById("cpy");
const copycode = document.getElementById("copycode");


var cPos = zlatex.selectionStart;
var tLen = zlatex.value.length;
function zshowVal(obj){
    cPos = parseInt(zlatex.selectionStart);
    tLen = parseInt(zlatex.value.length);
    var txt1 = zlatex.value.slice(0, cPos);
    var txt2 = zlatex.value.slice(cPos, tLen);
    zlatex.value = txt1+obj.value+txt2;
    zdisplay.innerHTML = "\\("+zlatex.value+"\\)";
    MathJax.typeset([zdisplay]);
    zlatex.focus();
    }



zlatex.addEventListener("input", function(){
    zdisplay.innerHTML = "\\("+zlatex.value+"\\)";
    MathJax.typeset([zdisplay]);
});


function cpyIt(){
    copycode.style.display = "block";
    copycode.value = " \\("+String(zlatex.value)+"\\) ";
    copycode.select();
    copycode.setSelectionRange(0,99999);
    navigator.clipboard.writeText(copycode.value); 
    setTimeout(()=> {copycode.style.display="none";}, 1000); 
}