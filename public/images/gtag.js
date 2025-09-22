window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());

// Google Analytics 4 ID - замените на ваш реальный ID
gtag('config', 'G-XXXXXXXXXX', {
  page_title: document.title,
  page_location: window.location.href,
  custom_map: {
    'custom_parameter_1': 'brand',
    'custom_parameter_2': 'category',
    'custom_parameter_3': 'price_range'
  },
  // Настройки для электронной коммерции
  send_page_view: true,
  anonymize_ip: true,
  allow_google_signals: true,
  allow_ad_personalization_signals: true
});

// Отслеживание событий
gtag('event', 'page_view', {
  page_title: document.title,
  page_location: window.location.href,
  page_referrer: document.referrer,
  custom_parameter_1: 'Elektromos',
  custom_parameter_2: 'Lighting Equipment'
});

// Отслеживание кликов по товарам
document.addEventListener('click', function(e) {
  if (e.target.closest('[data-product-id]')) {
    const productId = e.target.closest('[data-product-id]').getAttribute('data-product-id');
    const productName = e.target.closest('[data-product-id]').getAttribute('data-product-name');
    const productPrice = e.target.closest('[data-product-id]').getAttribute('data-product-price');
    
    gtag('event', 'select_item', {
      item_id: productId,
      item_name: productName,
      price: productPrice,
      currency: 'RUB',
      item_category: 'Lighting Equipment',
      item_brand: 'Elektromos'
    });
  }
});

// Отслеживание добавления в корзину
document.addEventListener('click', function(e) {
  if (e.target.closest('[data-add-to-cart]')) {
    const productId = e.target.closest('[data-add-to-cart]').getAttribute('data-product-id');
    const productName = e.target.closest('[data-add-to-cart]').getAttribute('data-product-name');
    const productPrice = e.target.closest('[data-add-to-cart]').getAttribute('data-product-price');
    
    gtag('event', 'add_to_cart', {
      item_id: productId,
      item_name: productName,
      price: productPrice,
      currency: 'RUB',
      item_category: 'Lighting Equipment',
      item_brand: 'MoreElektriki'
    });
  }
});

// Отслеживание поиска
document.addEventListener('submit', function(e) {
  if (e.target.closest('form[data-search-form]')) {
    const searchTerm = e.target.querySelector('input[type="search"]')?.value;
    if (searchTerm) {
      gtag('event', 'search', {
        search_term: searchTerm,
        page_location: window.location.href
      });
    }
  }
});

// Отслеживание просмотра категорий
document.addEventListener('click', function(e) {
  if (e.target.closest('[data-category-link]')) {
    const category = e.target.closest('[data-category-link]').getAttribute('data-category');
    gtag('event', 'view_item_list', {
      item_list_name: category,
      item_list_id: category.toLowerCase().replace(/\s+/g, '_')
    });
  }
}); 