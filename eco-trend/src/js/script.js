// Cart + Theme script (localStorage)
// Key names
const CART_KEY = 'ecotrend_cart_v1';
const THEME_KEY = 'ecotrend_theme_v1';

// Utilities
function readCart(){
  try{
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch(e){
    console.error('Erro lendo cart', e);
    return [];
  }
}
function writeCart(cart){
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}

// Add product (object with id, name, price, img)
function addToCartFromButton(btn){
  const id = btn.dataset.id;
  const name = btn.dataset.name;
  const price = parseFloat(btn.dataset.price);
  const img = btn.dataset.img || '';
  addToCart({id, name, price, img});
}
function addToCart(prod){
  const cart = readCart();
  const existing = cart.find(p => p.id === prod.id);
  if(existing){
    existing.qty = (existing.qty || 1) + 1;
  } else {
    cart.push({...prod, qty:1});
  }
  writeCart(cart);
  // feedback
  showToast(`${prod.name} adicionado ao carrinho`);
}

// Remove from cart by id
function removeFromCart(id){
  let cart = readCart();
  cart = cart.filter(p => p.id !== id);
  writeCart(cart);
  renderCartPage();
}

// Clear cart
function clearCart(){
  localStorage.removeItem(CART_KEY);
  updateCartCount();
  renderCartPage();
}

// Update badge
function updateCartCount(){
  const cart = readCart();
  const totalQty = cart.reduce((s,p)=>s + (p.qty || 0), 0);
  document.querySelectorAll('#cartCount').forEach(el=>{
    el.textContent = totalQty;
  });
}

// Render cart page (if on cart)
function renderCartPage(){
  const cartList = document.getElementById('cartList');
  const cartEmpty = document.getElementById('cartEmpty');
  const cartTotalEl = document.getElementById('cartTotal');
  if(!cartList) return;
  const cart = readCart();
  if(cart.length === 0){
    cartList.innerHTML = '';
    cartEmpty.style.display = 'block';
    cartTotalEl.textContent = '0.00';
    return;
  }
  cartEmpty.style.display = 'none';
  cartList.innerHTML = '';
  let total = 0;
  cart.forEach(item=>{
    const itemTotal = (item.price * (item.qty||1));
    total += itemTotal;
    const div = document.createElement('div');
    div.className = 'list-group-item d-flex align-items-center';
    div.innerHTML = `
      <img src="${item.img}" alt="${item.name}" style="width:90px;height:70px;object-fit:cover" class="me-3 rounded">
      <div class="flex-fill">
        <div class="d-flex justify-content-between">
          <div>
            <h6 class="mb-1">${item.name}</h6>
            <small class="text-muted">R$ ${item.price.toFixed(2)} x ${item.qty}</small>
          </div>
          <div class="text-end">
            <strong>R$ ${itemTotal.toFixed(2)}</strong>
            <div class="mt-2">
              <button class="btn btn-sm btn-outline-danger remove-item" data-id="${item.id}">Remover</button>
            </div>
          </div>
        </div>
      </div>
    `;
    cartList.appendChild(div);
  });
  cartTotalEl.textContent = total.toFixed(2);
  // attach remove handlers
  document.querySelectorAll('.remove-item').forEach(btn=>{
    btn.addEventListener('click', e=>{
      const id = btn.dataset.id;
      removeFromCart(id);
    });
  });
}

// Simple toast feedback
function showToast(msg){
  // small simple toast using alert role
  const el = document.createElement('div');
  el.className = 'toast-custom';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(()=> el.classList.add('visible'), 10);
  setTimeout(()=> el.classList.remove('visible'), 1800);
  setTimeout(()=> el.remove(), 2200);
}

// Theme functions
function applySavedTheme(){
  const t = localStorage.getItem(THEME_KEY) || 'light';
  if(t === 'dark'){
    document.body.classList.add('theme-dark');
    document.querySelectorAll('#themeToggle').forEach(b=> b.textContent = '☀️');
  } else {
    document.body.classList.remove('theme-dark');
    document.querySelectorAll('#themeToggle').forEach(b=> b.textContent = '🌙');
  }
}
function toggleTheme(){
  const isDark = document.body.classList.toggle('theme-dark');
  localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
  document.querySelectorAll('#themeToggle').forEach(b=> b.textContent = isDark ? '☀️' : '🌙');
}

// On DOM ready
document.addEventListener('DOMContentLoaded', function(){
  // wire add-to-cart buttons
  document.querySelectorAll('.add-to-cart').forEach(btn=>{
    btn.addEventListener('click', function(){
      addToCartFromButton(btn);
    });
  });
  // theme toggle buttons
  document.querySelectorAll('#themeToggle').forEach(btn=>{
    btn.addEventListener('click', toggleTheme);
  });
  applySavedTheme();
  updateCartCount();
  // If on cart page, render it
  renderCartPage();
  // clear cart button on cart page
  const clearBtn = document.getElementById('clearCartBtn');
  if(clearBtn){
    clearBtn.addEventListener('click', function(){
      if(confirm('Deseja realmente limpar o carrinho?')){
        clearCart();
      }
    });
  }

  // contact form demo validation
  var forms = document.querySelectorAll('.needs-validation')
  Array.prototype.slice.call(forms).forEach(function(form){
    form.addEventListener('submit', function(event){
      if (!form.checkValidity()){
        event.preventDefault()
        event.stopPropagation()
      } else {
        event.preventDefault()
        alert('Mensagem enviada — (demo). Obrigado!')
        form.reset()
      }
      form.classList.add('was-validated')
    }, false)
  });

});

// expose for debugging
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.clearCart = clearCart;
window.toggleTheme = toggleTheme;
