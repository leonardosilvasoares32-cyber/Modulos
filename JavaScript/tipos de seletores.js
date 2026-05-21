let elements = document.getElementsByTagName('p');
console.log(elements);
//neste exemplos utilizamos o getElementsByTagName para selecionar todos os elementos <p> do documento HTML e armazená-los na variável elements.
//  Em seguida, imprimimos essa coleção no console.

let item = document.getElementById('meuId');
console.log(item);
//neste exemplo utilizamos o getElementById para selecionar o elemento com o ID 'meuId' do documento HTML e armazená-lo na variável item.
//  Em seguida, imprimimos esse elemento no console. 

let itens = document.getElementsByClassName('minhaClasse');
console.log(itens);
//neste exemplo utilizamos o getElementsByClassName para selecionar todos os elementos com a classe 'minhaClasse' do documento HTML e armazená-los na variável itens.
//  Em seguida, imprimimos essa coleção no console.



let primeiroItem = document.querySelector('.minhaClasse');
console.log(primeiroItem);
//neste exemplo utilizamos o querySelector para selecionar o primeiro elemento com a classe 'minhaClasse' do documento HTML e armazená-lo na variável primeiroItem.
//  Em seguida, imprimimos esse elemento no console.


let todosItens = document.querySelectorAll('.minhaClasse');
console.log(todosItens);
//neste exemplo utilizamos o querySelectorAll para selecionar todos os elementos com a classe 'minhaClasse' do documento HTML e armazená-los na variável todosItens.
//  Em seguida, imprimimos essa coleção no console.

//Resumo dos seletores:
/*
-getElementsByTagName: Seleciona todos os elementos com a tag especificada.
-getElementById: Seleciona o elemento com o ID especificado.
-getElementsByClassName: Seleciona todos os elementos com a classe especificada.
-querySelector: Traz um elemento, seleciona o primeiro elemento que  encontrar, posso buscar de varias formas, pela classe, id, tag, etc.
-querySelectorAll: Traz todos os elementos que encontrar, posso buscar de varias formas, pela classe, id, tag, etc.

*/
