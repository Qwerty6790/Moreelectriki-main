(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
m[i].l=1*new Date();
for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

// Замените YM_ID на ваш реальный ID
ym(YM_ID, "init", {
  defer: true,
  clickmap: true,
  trackLinks: true,
  accurateTrackBounce: true,
  webvisor: true,
  ecommerce: "dataLayer"
});

// Отслеживание событий
ym(YM_ID, 'hit', window.location.href, {
  title: document.title
});

// Отслеживание кликов по товарам
document.addEventListener('click', function(e) {
  if (e.target.closest('[data-product-id]')) {
    const productId = e.target.closest('[data-product-id]').getAttribute('data-product-id');
    const productName = e.target.closest('[data-product-id]').getAttribute('data-product-name');
    
    ym(YM_ID, 'reachGoal', 'product_click', {
      product_id: productId,
      product_name: productName
    });
  }
});

// Отслеживание добавления в корзину
document.addEventListener('click', function(e) {
  if (e.target.closest('[data-add-to-cart]')) {
    const productId = e.target.closest('[data-add-to-cart]').getAttribute('data-product-id');
    const productName = e.target.closest('[data-add-to-cart]').getAttribute('data-product-name');
    const productPrice = e.target.closest('[data-add-to-cart]').getAttribute('data-product-price');
    
    ym(YM_ID, 'reachGoal', 'add_to_cart', {
      product_id: productId,
      product_name: productName,
      product_price: productPrice
    });
  }
});

// Отслеживание поиска
document.addEventListener('submit', function(e) {
  if (e.target.closest('form[data-search-form]')) {
    const searchQuery = e.target.querySelector('input[type="search"]')?.value;
    if (searchQuery) {
      ym(YM_ID, 'reachGoal', 'search', {
        search_query: searchQuery
      });
    }
  }
}); 