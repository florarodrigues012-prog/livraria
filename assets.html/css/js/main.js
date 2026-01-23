// ========================================
// LIVRARIA EM SUAS MÃOS - JAVASCRIPT PRINCIPAL
// ========================================

// Configuração de markup (taxa de lucro)
let markupPercentage = 15;

// Atualizar taxa de markup
function updateMarkup() {
  const markupInput = document.getElementById('markupRate');
  if (!markupInput) return;
  
  const newRate = markupInput.value;
  markupPercentage = parseFloat(newRate);
  alert(`✅ Taxa atualizada para ${markupPercentage}%`);
  
  // Recarregar produtos se houver algum exibido
  const container = document.getElementById('productsContainer');
  if (container && container.children.length > 1) {
    searchBooks();
  }
}

// Calcular preço final com markup
function calculateFinalPrice(basePrice) {
  const markup = basePrice * (markupPercentage / 100);
  return basePrice + markup;
}

// Buscar livros na Google Books API
async function searchBooks() {
  const searchInput = document.getElementById('searchInput');
  const languageFilter = document.getElementById('languageFilter');
  const container = document.getElementById('productsContainer');
  
  if (!searchInput || !container) return;
  
  const query = searchInput.value.trim();
  
  if (!query) {
    container.innerHTML = '<div class="loading">Digite algo para buscar 📝</div>';
    return;
  }

  container.innerHTML = '<div class="loading">🔍 Buscando livros...</div>';

  try {
    let url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=20&printType=books`;
    
    if (languageFilter && languageFilter.value) {
      url += `&langRestrict=${languageFilter.value}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      container.innerHTML = '<div class="loading">Nenhum livro encontrado 😕</div>';
      return;
    }

    displayBooks(data.items);
  } catch (error) {
    container.innerHTML = '<div class="loading">❌ Erro ao buscar livros. Tente novamente.</div>';
    console.error('Erro ao buscar livros:', error);
  }
}

// Buscar por categoria
function searchByCategory(category) {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.value = category;
    searchBooks();
    
    // Scroll suave para o catálogo
    const catalogo = document.getElementById('catalogo');
    if (catalogo) {
      catalogo.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}

// Exibir livros no grid
function displayBooks(books) {
  const container = document.getElementById('productsContainer');
  if (!container) return;
  
  container.innerHTML = '';

  const grid = document.createElement('div');
  grid.className = 'products-grid';

  books.forEach(book => {
    const info = book.volumeInfo;
    const saleInfo = book.saleInfo;
    
    // Preço base
    let basePrice = 19.99; // Preço padrão
    let currency = 'EUR';
    
    if (saleInfo.saleability === 'FOR_SALE' && saleInfo.listPrice) {
      basePrice = saleInfo.listPrice.amount;
      currency = saleInfo.listPrice.currencyCode;
    }

    const finalPrice = calculateFinalPrice(basePrice);
    
    // Criar card do produto
    const card = document.createElement('div');
    card.className = 'product-card';
    
    const imageUrl = info.imageLinks?.thumbnail || 'https://via.placeholder.com/200x300?text=Sem+Imagem';
    const title = info.title || 'Título desconhecido';
    const authors = info.authors?.join(', ') || 'Autor desconhecido';
    
    card.innerHTML = `
      <img src="${imageUrl}" alt="${title}" class="product-image">
      <div class="product-info">
        <div class="product-title">${title}</div>
        <div class="product-author">${authors}</div>
        <div class="product-price">
          <span class="original-price">${basePrice.toFixed(2)} ${currency}</span>
          <span class="final-price">${finalPrice.toFixed(2)} ${currency}</span>
          <span class="markup-badge">+${markupPercentage}%</span>
        </div>
        <button class="add-to-cart" onclick="addToCart('${title.replace(/'/g, "\\'")}', ${finalPrice}, '${currency}')">
          🛒 Adicionar ao Carrinho
        </button>
      </div>
    `;
    
    grid.appendChild(card);
  });

  container.appendChild(grid);
}

// Adicionar ao carrinho
function addToCart(title, price, currency) {
  alert(`✅ "${title}" adicionado ao carrinho!\n\nPreço: ${price.toFixed(2)} ${currency}`);
  // Aqui você pode implementar lógica real de carrinho com localStorage
}

// Toggle do chat
function toggleChat() {
  const chatBox = document.getElementById('chatBox');
  if (chatBox) {
    chatBox.classList.toggle('active');
  }
}

// Selecionar opção do chat
function selectOption(option) {
  const responses = {
    'pedido': 'Para consultar o status do seu pedido, envie email para:\nsuporte@livrariaemsuasmaos.com',
    'cancelamento': 'Cancelamentos são aceitos APENAS antes do envio.\nContato: suporte@livrariaemsuasmaos.com',
    'pagamento': 'Formas de pagamento aceitas:\n• Visa\n• Mastercard\n• American Express\n• PayPal\n• MBWay',
    'envio': 'Informações de envio:\n• Prazo: 3 a 7 dias úteis\n• Regiões: Europa, América do Norte e Sul\n• Frete gerido pela loja parceira'
  };
  
  if (responses[option]) {
    alert(responses[option]);
  }
}

// Smooth scroll para links internos
document.addEventListener('DOMContentLoaded', function() {
  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const target = document.querySelector(targetId);
      
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Enter para buscar
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        searchBooks();
      }
    });
  }
});