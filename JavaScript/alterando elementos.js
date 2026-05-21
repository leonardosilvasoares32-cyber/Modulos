let element = document.getElementById('titulo');
element.textContent = 'Título Alterado';
//neste exemplo utilizamos o getElementById para selecionar o elemento com o ID 'titulo' do documento HTML e armazená-lo na variável element.
//  Em seguida, alteramos o conteúdo de texto desse elemento para 'Título Alterado'.


/*
    textContent = é uma propriedade que permite acessar ou modificar o 
conteúdo de texto de um elemento HTML. 
Ao definir textContent, você substitui todo o conteúdo de texto existente do 
elemento pelo novo valor fornecido.

    innerHTML = é uma propriedade que permite acessar ou modificar o conteúdo HTML interno de um elemento.
Ao definir innerHTML, você pode inserir não apenas texto, mas também tags HTML, o que permite criar estruturas mais complexas dentro do elemento.

    innerText = é uma propriedade semelhante a textContent, mas com algumas diferenças.  innerText leva 
em consideração o estilo CSS aplicado ao elemento e pode afetar a forma como o texto é exibido, enquanto textContent retorna o texto bruto sem considerar o estilo.

*/

let section = document.querySelector('#falesobrevoce');
section.innerHTML = '<h3>Falando sobre mim!</h3>';
section.style = 'color: blue;';
//neste exemplo, usamos querySelector para selecionar o primeiro elemento <section> com a classe 'inicio'.
// Em seguida, alteramos o conteúdo HTML interno dessa seção para incluir um novo título <h2> e um parágrafo <p>.

let button1 = document.getElementById('btn1');
button1.innerText = 'Botão Modificado';
button1.style = 'background-color: green; color: white;';
if (button1) {onclick = function() {
    button1.style.backgroundColor = 'red';
}}

//neste exemplo acima, selecionamos o botão com o ID 'meuBotao' e alteramos o texto exibido no botão para 'Botão Modificado'.
// Além disso, modificamos o estilo do botão para ter um fundo verde e texto branco.

