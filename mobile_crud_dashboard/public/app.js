const rows = document.getElementById("productRows");
const modal = document.getElementById("modalBackdrop");
const form = document.getElementById("productForm");
const searchInput = document.getElementById("searchInput");
let products = [];
let editingId = null;

const peso = value => "₱" + Number(value).toLocaleString("en-PH", {minimumFractionDigits:2, maximumFractionDigits:2});
async function api(url, options = {}) {
  const response = await fetch(url, { headers: {"Content-Type":"application/json"}, ...options });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Something went wrong.");
  return data;
}
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message; toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2300);
}
async function loadDashboard() {
  try {
    products = await api("/api/products");
    const summary = await api("/api/summary");
    document.getElementById("totalProducts").textContent = summary.totalProducts;
    document.getElementById("totalStock").textContent = summary.totalStock;
    document.getElementById("inventoryValue").textContent = peso(summary.inventoryValue);
    renderProducts();
  } catch (error) { rows.innerHTML = `<tr><td colspan="5" class="empty">${escapeHtml(error.message)}</td></tr>`; }
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
}
function renderProducts() {
  const query = searchInput.value.toLowerCase().trim();
  const filtered = products.filter(p => p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query));
  document.getElementById("resultCount").textContent = `${filtered.length} item${filtered.length === 1 ? "" : "s"}`;
  if (!filtered.length) { rows.innerHTML = '<tr><td colspan="5" class="empty">No products found. Add your first product.</td></tr>'; return; }
  rows.innerHTML = filtered.map(p => `<tr>
    <td>${escapeHtml(p.name)}</td><td><span class="pill">${escapeHtml(p.category)}</span></td>
    <td>${p.quantity}</td><td>${peso(p.price)}</td>
    <td><div class="actions"><button class="action-btn" data-edit="${p.id}">Edit</button><button class="action-btn delete" data-delete="${p.id}">Delete</button></div></td>
  </tr>`).join("");
}
function openModal(product = null) {
  editingId = product?.id ?? null;
  document.getElementById("modalTitle").textContent = product ? "Edit Product" : "Add Product";
  document.getElementById("name").value = product?.name ?? "";
  document.getElementById("category").value = product?.category ?? "";
  document.getElementById("quantity").value = product?.quantity ?? 0;
  document.getElementById("price").value = product?.price ?? 0;
  document.getElementById("formError").textContent = "";
  modal.hidden = false;
  document.getElementById("name").focus();
}
function closeModal() { modal.hidden = true; form.reset(); }
document.getElementById("addButton").addEventListener("click", () => openModal());
document.getElementById("closeModal").addEventListener("click", closeModal);
document.getElementById("cancelButton").addEventListener("click", closeModal);
modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });
searchInput.addEventListener("input", renderProducts);

rows.addEventListener("click", async e => {
  const editButton = e.target.closest("[data-edit]");
  const deleteButton = e.target.closest("[data-delete]");
  if (editButton) {
    const product = products.find(p => p.id === Number(editButton.dataset.edit));
    if (product) openModal(product);
  }
  if (deleteButton) {
    const id = Number(deleteButton.dataset.delete);
    const product = products.find(p => p.id === id);
    if (!product || !confirm(`Delete "${product.name}"?`)) return;
    try { await api(`/api/products/${id}`, {method:"DELETE"}); showToast("Product deleted."); loadDashboard(); }
    catch (error) { showToast(error.message); }
  }
});
form.addEventListener("submit", async e => {
  e.preventDefault();
  const payload = {
    name: document.getElementById("name").value,
    category: document.getElementById("category").value,
    quantity: Number(document.getElementById("quantity").value),
    price: Number(document.getElementById("price").value)
  };
  try {
    await api(editingId ? `/api/products/${editingId}` : "/api/products", {
      method: editingId ? "PUT" : "POST", body: JSON.stringify(payload)
    });
    closeModal(); showToast(editingId ? "Product updated." : "Product added."); loadDashboard();
  } catch (error) { document.getElementById("formError").textContent = error.message; }
});
loadDashboard();
