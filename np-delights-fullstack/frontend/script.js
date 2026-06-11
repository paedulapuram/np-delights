const API_URL = "https://np-delights.onrender.com/api";

let products = [];
let cart = [];
let token = localStorage.getItem("np_token") || "";

const productImagesByName = {
  "dark chocolate": "assets/images/dark-chocolate.svg",
  "milk chocolate": "assets/images/milk-chocolate.svg",
  "white chocolate": "assets/images/white-chocolate.svg",
  "hazelnut chocolate": "assets/images/hazelnut-chocolate.svg",
  "caramel chocolate": "assets/images/caramel-chocolate.svg",
  "assorted chocolate box": "assets/images/gift-box.svg",
  "almond crunch chocolate": "assets/images/almond-crunch.svg",
  "premium dark truffles": "assets/images/truffles.svg"
};

const fallbackImages = {
  "dark": "assets/images/dark-chocolate.svg",
  "milk": "assets/images/milk-chocolate.svg",
  "white": "assets/images/white-chocolate.svg",
  "nuts": "assets/images/hazelnut-chocolate.svg",
  "gift": "assets/images/gift-box.svg"
};

const productGrid = document.getElementById("productGrid");
const searchInput = document.getElementById("searchInput");
const categoryDropdown = document.getElementById("categoryDropdown");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const totalPrice = document.getElementById("totalPrice");

function getProductImage(product) {
  const nameKey = product.name.toLowerCase();
  return productImagesByName[nameKey] || fallbackImages[product.category] || "assets/images/dark-chocolate.svg";
}

function authHeaders() {
  return token ? { "Authorization": `Bearer ${token}` } : {};
}

async function loadProducts() {
  try {
    const res = await fetch(`${API_URL}/products`);
    products = await res.json();
    filterProducts();
  } catch (error) {
    productGrid.innerHTML = "<p class='error'>Unable to load products. Please check backend connection.</p>";
  }
}

function displayProducts(list) {
  productGrid.innerHTML = "";
  if (!list.length) {
    productGrid.innerHTML = "<p>No chocolates found.</p>";
    return;
  }

  list.forEach(product => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img class="product-img" src="${getProductImage(product)}" alt="${product.name}">
      <span class="category-pill">${product.category}</span>
      <h3>${product.name}</h3>
      <p>${product.description}</p>
      <p class="price">$${Number(product.price).toFixed(2)}</p>
      <button onclick="addToCart(${product.id})">Add to Cart</button>
    `;
    productGrid.appendChild(card);
  });
}

function filterProducts() {
  const keyword = searchInput.value.toLowerCase();
  const selectedCategory = categoryDropdown.value;
  const filtered = products.filter(product => {
    const matchesSearch =
      product.name.toLowerCase().includes(keyword) ||
      product.description.toLowerCase().includes(keyword) ||
      product.category.toLowerCase().includes(keyword);
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  displayProducts(filtered);
}

function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  const existing = cart.find(i => i.id === productId);
  existing ? existing.quantity++ : cart.push({ ...product, quantity: 1 });
  updateCart();
}

function increaseQuantity(productId) {
  const item = cart.find(i => i.id === productId);
  item.quantity++;
  updateCart();
}

function decreaseQuantity(productId) {
  const item = cart.find(i => i.id === productId);
  if (item.quantity > 1) item.quantity--;
  else cart = cart.filter(i => i.id !== productId);
  updateCart();
}

function updateCart() {
  cartItems.innerHTML = cart.length ? "" : "<p>Your cart is empty.</p>";
  let total = 0, count = 0;

  cart.forEach(item => {
    total += item.price * item.quantity;
    count += item.quantity;
    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <div><strong>${item.name}</strong><br>$${Number(item.price).toFixed(2)} x ${item.quantity}</div>
      <div>
        <button onclick="decreaseQuantity(${item.id})">-</button>
        <button onclick="increaseQuantity(${item.id})">+</button>
      </div>
    `;
    cartItems.appendChild(row);
  });

  cartCount.textContent = count;
  totalPrice.textContent = total.toFixed(2);
}

document.getElementById("signupForm").addEventListener("submit", async e => {
  e.preventDefault();
  const body = {
    name: document.getElementById("signupName").value,
    email: document.getElementById("signupEmail").value,
    password: document.getElementById("signupPassword").value
  };

  const res = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  document.getElementById("signupMessage").textContent = data.message;
  document.getElementById("signupMessage").className = res.ok ? "success" : "error";
});

document.getElementById("signinForm").addEventListener("submit", async e => {
  e.preventDefault();
  const body = {
    email: document.getElementById("signinEmail").value,
    password: document.getElementById("signinPassword").value
  };

  const res = await fetch(`${API_URL}/auth/signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const data = await res.json();

  if (res.ok) {
    token = data.token;
    localStorage.setItem("np_token", token);
    document.getElementById("signinMessage").textContent = `Signed in as ${data.user.name} (${data.user.role})`;
    document.getElementById("signinMessage").className = "success";
    loadProfile();
  } else {
    document.getElementById("signinMessage").textContent = data.message;
    document.getElementById("signinMessage").className = "error";
  }
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  token = "";
  localStorage.removeItem("np_token");
  document.getElementById("profileBox").textContent = "Please sign in to view your profile.";
  document.getElementById("signinMessage").textContent = "Logged out.";
});

async function loadProfile() {
  if (!token) return;
  const res = await fetch(`${API_URL}/auth/profile`, { headers: authHeaders() });
  const data = await res.json();
  if (res.ok) {
    document.getElementById("profileBox").textContent =
      `Name: ${data.name}\nEmail: ${data.email}\nRole: ${data.role}`;
  }
}

document.getElementById("orderForm").addEventListener("submit", async e => {
  e.preventDefault();
  const msg = document.getElementById("orderMessage");

  if (!token) {
    msg.textContent = "Please sign in before placing order.";
    msg.className = "error";
    return;
  }

  if (!cart.length) {
    msg.textContent = "Please add at least one item.";
    msg.className = "error";
    return;
  }

  const body = {
    customerName: document.getElementById("customerName").value,
    phone: document.getElementById("customerPhone").value,
    address: document.getElementById("customerAddress").value,
    items: cart.map(i => ({ productId: i.id, quantity: i.quantity }))
  };

  const res = await fetch(`${API_URL}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  msg.textContent = data.message;
  msg.className = res.ok ? "success" : "error";
  if (res.ok) {
    cart = [];
    updateCart();
    e.target.reset();
  }
});

document.getElementById("loadOrdersBtn").addEventListener("click", async () => {
  const box = document.getElementById("ordersBox");
  const res = await fetch(`${API_URL}/orders/my`, { headers: authHeaders() });
  const data = await res.json();

  if (!res.ok) {
    box.textContent = data.message;
    return;
  }

  box.textContent = data.length
    ? data.map(o => `Order #${o.id} | $${o.total_amount} | ${o.status} | ${o.created_at}`).join("\n")
    : "No orders yet.";
});

document.getElementById("adminProductForm").addEventListener("submit", async e => {
  e.preventDefault();
  const body = {
    name: document.getElementById("adminProductName").value,
    category: document.getElementById("adminProductCategory").value,
    description: document.getElementById("adminProductDescription").value,
    price: Number(document.getElementById("adminProductPrice").value),
    image: "assets/images/dark-chocolate.svg"
  };

  const res = await fetch(`${API_URL}/admin/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  document.getElementById("adminBox").textContent = data.message;
  if (res.ok) {
    e.target.reset();
    loadProducts();
  }
});

document.getElementById("loadAdminOrdersBtn").addEventListener("click", async () => {
  const res = await fetch(`${API_URL}/admin/orders`, { headers: authHeaders() });
  const data = await res.json();
  document.getElementById("adminBox").textContent = res.ok
    ? data.map(o => `Order #${o.id} | ${o.customer_name} | $${o.total_amount} | ${o.status}`).join("\n")
    : data.message;
});

searchInput.addEventListener("input", filterProducts);
categoryDropdown.addEventListener("change", filterProducts);
loadProducts();
loadProfile();
updateCart();
