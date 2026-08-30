// ============================================
// منطق صفحة المنتج: عرض التفاصيل الكاملة والصور المتعددة
// ============================================

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

async function loadProductPage() {
  const productId = getQueryParam('id');
  const container = document.getElementById('productDetail');

  if (!productId) {
    container.innerHTML = '<p class="loading-msg">المنتج غير موجود.</p>';
    return;
  }

  const { data: product, error } = await supabaseClient
    .from('products')
    .select('*')
    .eq('id', productId)
    .eq('is_active', true)
    .single();

  if (error || !product) {
    container.innerHTML = '<p class="loading-msg">المنتج غير موجود.</p>';
    return;
  }

  document.getElementById('pageTitle').textContent = `${product.name} | Mona`;

  const images = (product.images && product.images.length > 0) ? product.images : [''];
  const mainImage = images[0];

  const thumbsHTML = images.length > 1 ? `
    <div class="product-thumbs">
      ${images.map((img, i) => `
        <div class="product-thumb ${i === 0 ? 'active' : ''}" data-img="${img}">
          <img src="${img}" alt="صورة ${i + 1}">
        </div>
      `).join('')}
    </div>
  ` : '';

  container.innerHTML = `
    <div>
      <div class="product-detail-img">
        <img src="${mainImage}" alt="${product.name}" id="mainProductImg">
      </div>
      ${thumbsHTML}
    </div>
    <div class="product-detail-info">
      <h1>${product.name}</h1>
      <div class="price-block">${formatPriceHTML(product)}</div>
      <p class="desc">${product.description || ''}</p>
      <a href="${buildWhatsAppOrderLink(product)}" target="_blank" rel="noopener" class="btn-order">اطلب عبر واتساب</a>
    </div>
  `;

  // تبديل الصورة الرئيسية عند الضغط على صورة مصغرة
  const thumbs = container.querySelectorAll('.product-thumb');
  const mainImg = document.getElementById('mainProductImg');
  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      mainImg.src = thumb.dataset.img;
      thumbs.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
    });
  });
}

document.addEventListener('DOMContentLoaded', loadProductPage);
