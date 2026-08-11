/** Shared inventory list filtering helpers (no React). */

export function filterInventoryItems(items, { search = '', stockFilter = 'all', getSearchText } = {}) {
  const q = search.trim().toLowerCase();
  return (items || []).filter((item) => {
    if (stockFilter !== 'all' && item.stock !== stockFilter) return false;
    if (!q) return true;
    const hay = (getSearchText ? getSearchText(item) : item.name || '').toLowerCase();
    return hay.includes(q);
  });
}

export function countByStock(items) {
  const list = items || [];
  return {
    all: list.length,
    in_stock: list.filter((i) => i.stock === 'in_stock').length,
    low_stock: list.filter((i) => i.stock === 'low_stock').length,
    out_of_stock: list.filter((i) => i.stock === 'out_of_stock').length,
  };
}
