const produtos = [
    {id:1, nome:"Livro A", preco:10, img:"assets/img/livro1.jpg"},
    {id:2, nome:"Livro B", preco:12, img:"assets/img/livro2.jpg"},
    {id:3, nome:"Livro C", preco:15, img:"assets/img/livro3.jpg"}
];

document.addEventListener("DOMContentLoaded", () => {
    const lista = document.getElementById("lista-destaques");

    if (lista) {
        produtos.forEach(p => {
            lista.innerHTML += `
                <div class="produto-card">
                    <img src="${p.img}">
                    <h3>${p.nome}</h3>
                    <p>${p.preco} EUR</p>
                    <a href="produto.html?id=${p.id}" class="btn">Ver mais</a>
                </div>
            `;
        });
    }
});
