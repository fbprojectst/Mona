// ============================================
// منطق الصفحة الرئيسية: البطاقات المتحركة + المنتجات المميزة
// ============================================

async function loadBanners() {
  const { data: banners, error } = await supabaseClient
    .from('banners')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  const heroSlider = document.getElementById('heroSlider');
  const track = document.getElementById('sliderTrack');
  const dotsContainer = document.getElementById('sliderDots');

  if (error || !banners || banners.length === 0) {
    heroSlider.style.display = 'none';
    return;
  }

  heroSlider.style.display = 'block';
  track.innerHTML = banners.map((b, i) => {
    if (b.banner_type === 'image' && b.image_url) {
      return `<div class="slide slide-image" style="background-image:url('${b.image_url}')"></div>`;
    }
    return `
      <div class="slide ${i % 2 === 0 ? 'slide-a' : 'slide-b'}">
        ${b.eyebrow_text ? `<p class="slide-eyebrow">${b.eyebrow_text}</p>` : ''}
        <h2>${b.title}</h2>
      </div>
    `;
  }).join('');

  const count = banners.length;
  let index = 0;

  if (count > 1) {
    dotsContainer.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('span');
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    }

    function goTo(i) {
      index = i;
      track.style.transform = `translateX(${index * 100}%)`;
      Array.from(dotsContainer.children).forEach((d, di) =>
        d.classList.toggle('active', di === index)
      );
    }

    setInterval(() => goTo((index + 1) % count), 4000);
  }
}

async function loadFeaturedProducts() {
  // نجيب كل المنتجات المميزة والنشطة، ثم نتحقق يدويًا إن لها فئة نشطة واحدة على الأقل
  const { data: products, error } = await supabaseClient
    .from('products')
    .select('*, product_categories(categories(is_active))')
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('sort_order', { ascending: true });

  const grid = document.getElementById('featuredGrid');

  if (error) {
    grid.innerHTML = '<p class="loading-msg">حدث خطأ في تحميل المنتجات.</p>';
    return;
  }

  const visibleProducts = (products || []).filter(p =>
    (p.product_categories || []).some(pc => pc.categories && pc.categories.is_active)
  );

  if (visibleProducts.length === 0) {
    grid.innerHTML = '<p class="loading-msg">لا توجد منتجات مميزة حالياً.</p>';
    return;
  }

  grid.innerHTML = visibleProducts.map(buildProductCard).join('');
}

async function loadHomeCategories() {
  const { data: categories, error } = await supabaseClient
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  const grid = document.getElementById('categoriesGrid');

  if (error || !categories || categories.length === 0) {
    grid.innerHTML = '';
    return;
  }

  grid.innerHTML = categories.map(cat => `
    <a href="category.html?id=${cat.id}" class="category-card">
      <div class="category-img" style="background-image:url('${cat.image_url || ''}')"></div>
      <div class="category-label">
        <h3>${cat.name}</h3>
        <span>اكتشف المجموعة ←</span>
      </div>
    </a>
  `).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  loadBanners();
  loadHomeCategories();
  loadFeaturedProducts();
});
