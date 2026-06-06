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

function updateMarkup() {
  const input = document.getElementById('markupRate');
  if (!input) return;
  const val = parseFloat(input.value);
  if (isNaN(val) || val < 0 || val > 200) {
    alert('Introduza uma margem válida entre 0 e 200%.');
    return;
  }
  markupPercentage = val;
  localStorage.setItem('markupPercentage', markupPercentage);
  const status = document.getElementById('markupStatus');
  if (status) status.textContent = 'Margem atual: ' + markupPercentage + '%';

  const container = document.getElementById('productsContainer');
  if (container && container.querySelector('.products-grid')) {
    const searchInput = document.getElementById('searchInput');
    if (searchInput && searchInput.value.trim()) searchBooks();
  }
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
          '<span class="original-price">' + basePrice.toFixed(2) + ' ' + currency + '</span>' +
          '<span class="final-price">' + finalPrice.toFixed(2) + ' ' + currency + '</span>' +
          '<span class="markup-badge">+' + markupPercentage + '%</span>' +
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
    pedido: 'Para consultar o estado do seu pedido, envie e-mail para:\nsuporte@livrariaemsuasmaos.com\ncom o número de encomenda.',
    cancelamento: 'Cancelamentos são aceites APENAS antes do envio.\nContacto: suporte@livrariaemsuasmaos.com',
    pagamento: 'Formas de pagamento:\n• Visa / Mastercard\n• American Express\n• MB Way\n• PayPal\n• Transferência Bancária',
    envio: 'Prazos de envio:\n• Portugal Continental: 2–4 dias\n• Ilhas: 4–7 dias\n• Europa: 5–8 dias\n• Brasil: 10–15 dias\nEnvio grátis acima de 30 €!'
  };
  if (responses[option]) alert(responses[option]);
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

  const savedMarkup = localStorage.getItem('markupPercentage');
  if (savedMarkup) {
    markupPercentage = parseFloat(savedMarkup);
    const input = document.getElementById('markupRate');
    if (input) input.value = markupPercentage;
    const status = document.getElementById('markupStatus');
    if (status) status.textContent = 'Margem atual: ' + markupPercentage + '%';
  }
});
