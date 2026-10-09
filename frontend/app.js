const API_BASE = (window.NOVACART_API_URL || "http://localhost:5000").replace(/\/$/, "");
let products = [];
let cart = JSON.parse(localStorage.getItem("novacart-cart") || "[]");

const $ = id => document.getElementById(id);
const money = n => "₹" + Number(n).toLocaleString("en-IN");

async function loadProducts(category = "All", search = "") {
  const url = `/api/products?category=${encodeURIComponent(category)}&search=${encodeURIComponent(search)}`;
  try {
    const res = await fetch(`${API_BASE}${url}`);
    products = await res.json();
    renderProducts();
  } catch {
    $("products").innerHTML = `<div class="empty">Backend is not running. Start the Node.js server.</div>`;
  }
}

function renderProducts() {
  $("resultInfo").textContent = `${products.length} products`;
  $("products").innerHTML = products.map(p => `
    <article class="product">
      <div class="product-img">
        <img src="${p.image}" alt="${p.name}">
        <span class="badge">${p.badge || "Featured"}</span>
        <button class="heart" onclick="favorite(this)">♡</button>
      </div>
      <div class="product-info">
        <div class="eyebrow">${p.category}</div>
        <h3>${p.name}</h3>
        <p>${p.description}</p>
        <div class="rating">★ ${p.rating} · ${p.stock} left</div>
        <div class="price-row">
          <div class="price">${money(p.price)} <span class="old">${money(p.oldPrice)}</span></div>
          <button class="add" onclick="addToCart('${p._id}')">+ Cart</button>
        </div>
      </div>
    </article>`).join("") || `<div class="empty">No products found.</div>`;
}

function addToCart(id) {
  const p = products.find(x => x._id === id);
  if (!p) return;
  const found = cart.find(x => x.productId === id);
  if (found) found.quantity++;
  else cart.push({productId:p._id,name:p.name,price:p.price,image:p.image,quantity:1});
  saveCart();
  showToast(`${p.name} added to cart`);
  openCart();
}

function saveCart() {
  localStorage.setItem("novacart-cart", JSON.stringify(cart));
  renderCart();
}

function renderCart() {
  $("cartCount").textContent = cart.reduce((s,x)=>s+x.quantity,0);
  const total = cart.reduce((s,x)=>s+x.price*x.quantity,0);
  $("cartTotal").textContent = money(total);
  $("formTotal").textContent = money(total);

  $("cartItems").innerHTML = cart.length ? cart.map((x,i)=>`
    <div class="cart-item">
      <img src="${x.image}" alt="">
      <div><h4>${x.name}</h4><small>${money(x.price)}</small><div class="qty">
        <button onclick="changeQty(${i},-1)">−</button> ${x.quantity} <button onclick="changeQty(${i},1)">+</button>
      </div></div>
      <button class="icon-btn" onclick="removeItem(${i})">×</button>
    </div>`).join("") : `<p style="color:var(--muted);padding-top:30px">Your cart is waiting for its first discovery.</p>`;
  $("checkoutBtn").disabled = !cart.length;
}

function changeQty(i,delta) {
  cart[i].quantity += delta;
  if (cart[i].quantity <= 0) cart.splice(i,1);
  saveCart();
}
function removeItem(i) { cart.splice(i,1); saveCart(); }

function openCart() {
  $("drawerOverlay").classList.remove("hidden");
  $("cartDrawer").classList.add("open");
}
function closeCart() {
  $("drawerOverlay").classList.add("hidden");
  $("cartDrawer").classList.remove("open");
}

function showToast(msg) {
  const t = $("toast"); t.textContent = msg; t.classList.add("show");
  clearTimeout(window.toastTimer); window.toastTimer=setTimeout(()=>t.classList.remove("show"),2200);
}
function favorite(btn) {
  btn.textContent = btn.textContent === "♡" ? "♥" : "♡";
  showToast(btn.textContent === "♥" ? "Saved to your favorites" : "Removed from favorites");
}

document.querySelectorAll(".category").forEach(btn => btn.addEventListener("click", () => {
  document.querySelectorAll(".category").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active");
  loadProducts(btn.dataset.category, $("search").value);
}));

$("searchBtn").onclick = () => {
  const active = document.querySelector(".category.active").dataset.category;
  loadProducts(active, $("search").value);
};
$("search").addEventListener("keydown", e => { if(e.key==="Enter") $("searchBtn").click(); });
$("cartBtn").onclick=openCart; $("closeCart").onclick=closeCart; $("drawerOverlay").onclick=closeCart;

$("themeBtn").onclick=()=>{
  document.body.classList.toggle("dark");
  localStorage.setItem("novacart-theme",document.body.classList.contains("dark")?"dark":"light");
};
if(localStorage.getItem("novacart-theme")==="dark") document.body.classList.add("dark");

$("checkoutBtn").onclick=()=>{
  if(!cart.length) return showToast("Your cart is empty");
  $("checkoutModal").classList.remove("hidden");
};
function closeModal(){ $("checkoutModal").classList.add("hidden"); }

$("checkoutForm").onsubmit = async e => {
  e.preventDefault();
  const form = new FormData(e.target);
  const customer = Object.fromEntries(form.entries());
  const total = cart.reduce((s,x)=>s+x.price*x.quantity,0);
  const res = await fetch(`${API_BASE}/api/orders`, {
    method:"POST", headers:{"Content-Type":"application/json"},
    body:JSON.stringify({customer,items:cart,total})
  });
  const data = await res.json();
  if(!res.ok) return showToast(data.message || "Could not place order");
  localStorage.setItem("novacart-last-email",customer.email);
  cart=[]; saveCart(); e.target.reset(); closeModal(); closeCart();
  showToast(`Order ${String(data.orderId).slice(-6).toUpperCase()} placed successfully`);
};

$("ordersBtn").onclick=()=>{$("ordersModal").classList.remove("hidden");$("orderEmail").value=localStorage.getItem("novacart-last-email")||""};
function closeOrders(){ $("ordersModal").classList.add("hidden"); }
async function loadOrders(){
  const email=$("orderEmail").value.trim();
  if(!email) return showToast("Enter your order email");
  const res=await fetch(`${API_BASE}/api/orders/${encodeURIComponent(email)}`);
  const orders=await res.json();
  $("ordersList").innerHTML=orders.length?orders.map(o=>`
    <div class="order-card">
      <strong>Order #${String(o._id).slice(-6).toUpperCase()}</strong>
      <span class="status">${o.status}</span>
      <p>${new Date(o.createdAt).toLocaleString()} · ${money(o.total)}</p>
      <small>${o.items.map(i=>`${i.name} × ${i.quantity}`).join(", ")}</small>
    </div>`).join(""):`<p style="color:var(--muted);margin-top:20px">No orders found for this email.</p>`;
}

let seconds=3*60*60+42*60+18;
setInterval(()=>{seconds=Math.max(0,seconds-1);const h=String(Math.floor(seconds/3600)).padStart(2,"0"),m=String(Math.floor(seconds%3600/60)).padStart(2,"0"),s=String(seconds%60).padStart(2,"0");$("countdown").textContent=`${h}:${m}:${s}`},1000);

renderCart();
loadProducts();