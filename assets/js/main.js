// ================================================
// LIVRARIA EM SUAS MÃOS — JavaScript Principal
// ================================================

let markupPercentage = 15;

// --- Carrinho (localStorage) ---

function getCart() {
  return JSON.parse(localStorage.getItem('cart') || '[]');
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartCount() {
  const total = getCart().reduce((sum, i) => sum + i.qty, 0);
  document.querySelectorAll('#cartCount').forEach(el => el.textContent = total);
}

function addToCart(title, price, currency, author, image, bookId) {
  const cart = getCart();
  const existing = cart.find(i => i.title === title);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ title, price, currency, author: author || '', image: image || '', bookId: bookId || '', qty: 1 });
  }
  saveCart(cart);
  updateCartCount();
  showToast('"' + title.substring(0, 30) + '..." adicionado ao carrinho!');
}

function showToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.style.cssText = 'position:fixed;bottom:90px;right:25px;background:#333;color:white;padding:14px 20px;border-radius:6px;z-index:9999;font-size:0.9em;max-width:280px;box-shadow:0 4px 12px rgba(0,0,0,0.2);transition:opacity 0.3s;';
    document.body.appendChild(toast);
  }
  toast.textContent = '✅ ' + msg;
  toast.style.opacity = '1';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(function() { toast.style.opacity = '0'; }, 2800);
}

// --- Margem de lucro ---

function calculateFinalPrice(basePrice) {
  return basePrice * (1 + markupPercentage / 100);
}

// --- Pesquisa de livros (Google Books API) ---

async function searchBooks() {
  const searchInput = document.getElementById('searchInput');
  const languageFilter = document.getElementById('languageFilter');
  const sortFilter = document.getElementById('sortFilter');
  const container = document.getElementById('productsContainer');

  if (!searchInput || !container) return;

  const query = searchInput.value.trim();
  if (!query) {
    container.innerHTML = '<div class="loading">Digite algo para pesquisar 📝</div>';
    return;
  }

  container.innerHTML = '<div class="loading">🔍 A pesquisar livros...</div>';

  try {
    let url = 'https://www.googleapis.com/books/v1/volumes?q=' + encodeURIComponent(query) + '&maxResults=24&printType=books';
    if (languageFilter && languageFilter.value) url += '&langRestrict=' + languageFilter.value;
    if (sortFilter && sortFilter.value === 'newest') url += '&orderBy=newest';

    const res = await fetch(url);
    const data = await res.json();

    if (!data.items || data.items.length === 0) {
      container.innerHTML = '<div class="loading">Nenhum livro encontrado para "' + query + '" 😕</div>';
      return;
    }

    displayBooks(data.items);
  } catch (err) {
    container.innerHTML = '<div class="loading">❌ Erro ao pesquisar. Verifique a sua ligação e tente novamente.</div>';
    console.error('Erro API:', err);
  }
}

function searchByCategory(category) {
  const input = document.getElementById('searchInput');
  if (input) {
    input.value = category;
    searchBooks();
    const catalogo = document.getElementById('catalogo');
    if (catalogo) catalogo.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    window.location.href = 'categorias.html?cat=' + encodeURIComponent(category);
  }
}

// --- Renderização dos cards ---

function displayBooks(books) {
  const container = document.getElementById('productsContainer');
  if (!container) return;

  const grid = document.createElement('div');
  grid.className = 'products-grid';

  books.forEach(function(book) {
    const info = book.volumeInfo || {};
    const saleInfo = book.saleInfo || {};

    let basePrice = 19.99;
    let currency = 'EUR';
    if (saleInfo.saleability === 'FOR_SALE' && saleInfo.listPrice) {
      basePrice = saleInfo.listPrice.amount;
      currency = saleInfo.listPrice.currencyCode;
    }

    const finalPrice = calculateFinalPrice(basePrice);
    const imageUrl = (info.imageLinks && info.imageLinks.thumbnail)
      ? info.imageLinks.thumbnail.replace('http:', 'https:')
      : 'https://placehold.co/200x300?text=Sem+Capa';
    const title = info.title || 'Título desconhecido';
    const author = (info.authors || ['Autor desconhecido']).join(', ');
    const bookId = book.id || '';

    const card = document.createElement('div');
    card.className = 'product-card';

    const safeTitle = title.replace(/'/g, "\\'").replace(/"/g, '&quot;');
    const safeAuthor = author.replace(/'/g, "\\'").replace(/"/g, '&quot;');
    const safeImage = imageUrl.replace(/'/g, "\\'");

    card.innerHTML =
      '<a href="produto.html?id=' + bookId + '" style="text-decoration:none;color:inherit;">' +
        '<img src="' + imageUrl + '" alt="' + safeTitle + '" class="product-image"' +
          ' onerror="this.src=\'https://placehold.co/200x300?text=Sem+Capa\'">' +
      '</a>' +
      '<div class="product-info">' +
        '<a href="produto.html?id=' + bookId + '" class="product-title" style="text-decoration:none;color:inherit;">' + title + '</a>' +
        '<div class="product-author">' + author + '</div>' +
        '<div class="product-price">' +
          '<span class="final-price">' + finalPrice.toFixed(2) + ' ' + currency + '</span>' +
        '</div>' +
        '<button class="add-to-cart"' +
          ' onclick="addToCart(\'' + safeTitle + '\', ' + finalPrice + ', \'' + currency + '\', \'' + safeAuthor + '\', \'' + safeImage + '\', \'' + bookId + '\')">' +
          '🛒 Adicionar ao Carrinho' +
        '</button>' +
      '</div>';

    grid.appendChild(card);
  });

  container.innerHTML = '';
  container.appendChild(grid);
}

// --- Chat Widget ---

function toggleChat() {
  const chatBox = document.getElementById('chatBox');
  if (chatBox) chatBox.classList.toggle('active');
}

function selectOption(option) {
  const responses = {
    pedido: '📦 Estado do Pedido\n\nPara consultar o estado da sua encomenda, envie um e-mail para suporte@livrariaemsuasmaos.com com o número de encomenda (ex: #LIV123456).\n\nTambém pode consultar o e-mail de confirmação que recebeu — contém um link de rastreio.',
    cancelamento: '❌ Cancelar Encomenda\n\nPode cancelar gratuitamente enquanto o estado for "Em Preparação".\nApós o envio, terá de seguir o processo normal de devolução (30 dias).\n\nPara cancelar, contacte-nos com urgência: suporte@livrariaemsuasmaos.com',
    pagamento: '💳 Formas de Pagamento\n\n• Visa / Mastercard\n• American Express\n• MB Way\n• PayPal\n• Transferência Bancária\n\nTodos os pagamentos são processados de forma segura e encriptada (SSL).',
    envio: '🚚 Prazos & Custos de Envio\n\n• Portugal Continental: 2–4 dias úteis (3,99 €)\n• Ilhas: 4–7 dias úteis (6,99 €)\n• Espanha: 3–5 dias úteis (5,99 €)\n• Resto da Europa: 5–8 dias úteis (8,99 €)\n• Brasil: 10–15 dias úteis (12,99 €)\n\n🎉 Envio GRÁTIS em encomendas acima de 30 €!',
    devolucao: '↩️ Devoluções e Trocas\n\nAceitamos devoluções até 30 dias após a receção, desde que o livro esteja em perfeitas condições.\n\nPara iniciar: envie um e-mail para suporte@livrariaemsuasmaos.com com o número de encomenda e motivo da devolução. Receberá uma autorização (RMA) em 24h.',
    humano: '🙋 Falar com um Humano\n\nA nossa equipa está disponível:\n• Segunda a Sexta: 9h–18h\n• Sábado: 10h–14h\n\n📧 suporte@livrariaemsuasmaos.com\n📞 +351 210 000 000\n\nResponderemos assim que possível!'
  };
  if (responses[option]) alert(responses[option]);
}

// --- Pré-visualização de livros por categoria ---

const SHOWCASE_CATEGORIES = [
  { key: 'romance',   label: '❤️ Romance',              query: 'romance' },
  { key: 'scifi',     label: '🚀 Ficção Científica',     query: 'ficção científica' },
  { key: 'historia',  label: '🏛️ História',             query: 'história' },
  { key: 'tech',      label: '💻 Tecnologia',           query: 'programação informática' },
  { key: 'filosofia', label: '🧠 Filosofia',            query: 'filosofia' },
  { key: 'infantil',  label: '🧸 Infantil',             query: 'livros infantis' },
  { key: 'culinaria', label: '🍳 Culinária',            query: 'culinária receitas' },
  { key: 'autoajuda', label: '⭐ Autoajuda',            query: 'autoajuda desenvolvimento pessoal' },
  { key: 'thriller',  label: '🔍 Thriller & Mistério',  query: 'thriller mistério suspense' },
  { key: 'arte',      label: '🎨 Arte & Design',        query: 'arte design' }
];

function loadCategoryShowcase() {
  const container = document.getElementById('categoryShowcase');
  if (!container) return;

  container.innerHTML = SHOWCASE_CATEGORIES.map(function(cat) {
    return '<div class="category-showcase">' +
      '<h3>' + cat.label + ' <a href="categorias.html?cat=' + encodeURIComponent(cat.query) + '">Ver mais →</a></h3>' +
      '<div class="category-row" id="cat-row-' + cat.key + '"><div class="loading" style="padding:30px;width:100%;">A carregar livros...</div></div>' +
    '</div>';
  }).join('');

  SHOWCASE_CATEGORIES.forEach(function(cat) {
    fetchCategoryBooks(cat);
  });
}

async function fetchCategoryBooks(cat) {
  const row = document.getElementById('cat-row-' + cat.key);
  if (!row) return;

  try {
    const url = 'https://www.googleapis.com/books/v1/volumes?q=subject:' + encodeURIComponent(cat.query) +
      '&maxResults=8&printType=books&orderBy=relevance';
    const res = await fetch(url);
    const data = await res.json();

    if (!data.items || data.items.length === 0) {
      row.innerHTML = '<p style="color:#999;padding:10px;">Sem livros disponíveis nesta categoria de momento.</p>';
      return;
    }

    row.innerHTML = data.items.map(function(book) {
      const info = book.volumeInfo || {};
      const saleInfo = book.saleInfo || {};

      let basePrice = 19.99;
      let currency = 'EUR';
      if (saleInfo.saleability === 'FOR_SALE' && saleInfo.listPrice) {
        basePrice = saleInfo.listPrice.amount;
        currency = saleInfo.listPrice.currencyCode;
      }

      const finalPrice = calculateFinalPrice(basePrice);
      const image = (info.imageLinks && info.imageLinks.thumbnail)
        ? info.imageLinks.thumbnail.replace('http:', 'https:')
        : 'https://placehold.co/145x195?text=Sem+Capa';
      const title = info.title || 'Título desconhecido';
      const safeTitle = title.replace(/"/g, '&quot;');

      return '<a class="mini-card" href="produto.html?id=' + (book.id || '') + '">' +
        '<img src="' + image + '" alt="' + safeTitle + '" loading="lazy" onerror="this.src=\'https://placehold.co/145x195?text=Sem+Capa\'">' +
        '<div class="mini-info">' +
          '<div class="mini-title">' + title + '</div>' +
          '<div class="mini-price">' + finalPrice.toFixed(2) + ' ' + currency + '</div>' +
        '</div>' +
      '</a>';
    }).join('');
  } catch (err) {
    row.innerHTML = '<p style="color:#999;padding:10px;">Erro ao carregar livros desta categoria.</p>';
    console.error('Erro showcase categoria ' + cat.key + ':', err);
  }
}

// --- Inicialização ---

document.addEventListener('DOMContentLoaded', function() {
  updateCartCount();

  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') searchBooks();
    });
  }

  loadCategoryShowcase();
});
