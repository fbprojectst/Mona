// ============================================
// منطق صفحة الفئة: عرض تفاصيل الفئة ومنتجاتها
// ============================================

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

async function loadCategoryPage() {
  const categoryId = getQueryParam('id');
  const nameEl = document.getElementById('categoryName');
  const descEl = document.getElementById('categoryDesc');
  const grid = document.getElementById('categoryGrid');

  if (!categoryId) {
    nameEl.textContent = 'الفئة غير موجودة';
    grid.innerHTML = '';
    return;
  }

  // جلب بيانات الفئة
  const { data: category, error: catError } = await supabaseClient
    .from('categories')
    .select('*')
    .eq('id', categoryId)
    .eq('is_active', true)
    .single();

  if (catError || !category) {
    nameEl.textContent = 'الفئة غير موجودة';
    grid.innerHTML = '';
    return;
  }

  nameEl.textContent = category.name;
  descEl.textContent = category.description || '';
  document.getElementById('pageTitle').textContent = `${category.name} | Mona`;

  // جلب منتجات هذه الفئة عبر جدول الربط (تصنيفات متعددة)
  const { data: links, error: prodError } = await supabaseClient
    .from('product_categories')
    .select('products!inner(*)')
    .eq('category_id', categoryId)
    .eq('products.is_active', true)
    .order('sort_order', { referencedTable: 'products', ascending: true });

  const products = (links || []).map(link => link.products);

  if (prodError || !products || products.length === 0) {
    grid.innerHTML = '<p class="empty-category">المجموعة قريباً... تواصلوا معنا عبر Instagram لمعرفة التفاصيل والطلب المسبق.</p>';
    return;
  }

  grid.innerHTML = products.map(buildProductCard).join('');
}

document.addEventListener('DOMContentLoaded', loadCategoryPage);
