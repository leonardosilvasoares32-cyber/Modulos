let inputmain = document.querySelector("#main-input");

function btnMeuBotao() {
    alert("Botão clicado com sucesso!")
    alert("O valor do input é: " + inputmain.value);
    document.getElementById("input-value").textContent = inputmain.value;    
}
//document.getElementById("meuBotao").addEventListener("click", btnMeuBotao);


function digiteiinput() {
    console.log(inputmain.value);
}