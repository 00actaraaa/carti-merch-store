
import { useEffect, useMemo, useState } from "react";
import { Routes, Route, Link, useNavigate, useSearchParams } from "react-router-dom";

function money(n) {
  const v = Number(n || 0);
  return `$${v.toFixed(2)}`;
}

// Получить правильный путь к изображению с учетом base path для GitHub Pages
function getImagePath(path) {
  if (!path) return path;
  // Если путь начинается с /img/, добавляем base path
  if (path.startsWith('/img/')) {
    return '/carti-merch-store' + path;
  }
  // Если это внешний URL, возвращаем как есть
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  // Для относительных путей, начинающихся с /, добавляем base path
  if (path.startsWith('/')) {
    return '/carti-merch-store' + path;
  }
  return path;
}

function getRoleFromToken(t) {
  if (!t) return null;
  try {
    const payload = JSON.parse(atob(t.split(".")[1]));
    return payload?.role || null;
  } catch {
    return null;
  }
}

/** ---------- SHOP PAGE ---------- **/
function ShopPage({
  products,
  cart,
  setCart,
  cartOpen,
  setCartOpen,
  qtyById,
  setQtyById,
  token,
}) {
  const navigate = useNavigate();
  const isAdmin = useMemo(() => getRoleFromToken(token) === "admin", [token]);
  const [activeFilter, setActiveFilter] = useState(null); // null = все, 'music' = только music, 'merch' = только merch

  // Фильтруем товары по категории
  const filteredProducts = useMemo(() => {
    if (!activeFilter) return products;
    return products.filter(p => {
      // Если у товара нет категории, считаем его merch по умолчанию
      const productCategory = p.category || 'merch';
      return productCategory === activeFilter;
    });
  }, [products, activeFilter]);

  function getQty(id) {
    return qtyById[id] ?? 1;
  }
  function incQty(id) {
    setQtyById((prev) => ({ ...prev, [id]: getQty(id) + 1 }));
  }
  function decQty(id) {
    setQtyById((prev) => ({ ...prev, [id]: Math.max(1, getQty(id) - 1) }));
  }

  function addSelectedQty(p) {
    const qty = getQty(p.id);

    setCart((prev) => {
      const found = prev.find((i) => i.productId === p.id);
      if (found) {
        return prev.map((i) =>
          i.productId === p.id ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [
        ...prev,
        {
          productId: p.id,
          name: p.name,
          price: Number(p.price),
          qty,
          imageUrl: p.imageUrl || "",
        },
      ];
    });

    setQtyById((prev) => ({ ...prev, [p.id]: 1 }));
  }

  function inc(productId) {
    setCart((prev) =>
      prev.map((i) =>
        i.productId === productId ? { ...i, qty: i.qty + 1 } : i
      )
    );
  }
  function dec(productId) {
    setCart((prev) =>
      prev
        .map((i) =>
          i.productId === productId ? { ...i, qty: i.qty - 1 } : i
        )
        .filter((i) => i.qty > 0)
    );
  }
  function remove(productId) {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  }

  const cartCount = cart.reduce((s, i) => s + Number(i.qty || 0), 0);
  const subtotal = useMemo(
    () => cart.reduce((s, i) => s + Number(i.price) * Number(i.qty), 0),
    [cart]
  );

  return (
    <div className="page">
      <header className="topbar">
        <div className="leftNav">
          <button 
            className={`linkBtn ${activeFilter === 'music' ? 'active' : ''}`}
            onClick={() => {
              const newFilter = activeFilter === 'music' ? null : 'music';
              setActiveFilter(newFilter);
            }}
          >
            MUSIC ▾
          </button>
          <button 
            className={`linkBtn ${activeFilter === 'merch' ? 'active' : ''}`}
            onClick={() => {
              const newFilter = activeFilter === 'merch' ? null : 'merch';
              setActiveFilter(newFilter);
            }}
          >
            MERCH ▾
          </button>
        </div>

        <div className="logo" style={{ cursor: "pointer" }} onClick={() => navigate("/")}>
          MUSIC
        </div>

        <div className="rightNav">
          {isAdmin ? (
            <button className="linkBtn" onClick={() => navigate("/admin/products")}>
              ADMIN
            </button>
          ) : null}

          <button
            className="iconBtn"
            title="Account"
            onClick={() => navigate("/account")}
          >
            👤
          </button>

          <button className="iconBtn" title="Cart" onClick={() => setCartOpen(true)}>
            🛒
            {cartCount > 0 ? <span className="badge">{cartCount}</span> : null}
          </button>
        </div>
      </header>

      <main className="main">
        {filteredProducts.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center", opacity: 0.7 }}>
            {activeFilter 
              ? `No ${activeFilter === 'music' ? 'MUSIC' : 'MERCH'} products found` 
              : 'No products found'}
          </div>
        ) : (
          <div className="grid">
            {filteredProducts.map((p) => (
            <div key={p.id} className="card">
              <div className="imgPlaceholder">
                {p.imageUrl ? (
                  <img className="productImg" src={getImagePath(p.imageUrl)} alt={p.name} />
                ) : null}
              </div>

              <div className="title">{String(p.name || "").toUpperCase()}</div>
              <div className="price">{money(p.price)}</div>

              <div className="cardHover">
                <div className="qtyBlock">
                  <div className="qtyLabel">QUANTITY</div>
                  <div className="qtyControls">
                    <button
                      type="button"
                      className="qtyBtn"
                      onClick={(e) => {
                        e.stopPropagation();
                        decQty(p.id);
                      }}
                    >
                      –
                    </button>
                    <div className="qtyNum">{getQty(p.id)}</div>
                    <button
                      type="button"
                      className="qtyBtn"
                      onClick={(e) => {
                        e.stopPropagation();
                        incQty(p.id);
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  className="primary wide"
                  onClick={(e) => {
                    e.stopPropagation();
                    addSelectedQty(p);
                  }}
                >
                  ADD TO CART
                </button>
              </div>
            </div>
          ))}
          </div>
        )}
      </main>

      {/* Cart drawer */}
      <div
        className={`drawerOverlay ${cartOpen ? "open" : ""}`}
        onClick={() => setCartOpen(false)}
      />
      <aside className={`drawer ${cartOpen ? "open" : ""}`}>
        <div className="drawerHeader">
          <div>
            <div className="drawerTitle">YOUR CART</div>
            <div className="drawerSub">{cartCount} ITEM(S)</div>
          </div>
          <button className="iconBtn" onClick={() => setCartOpen(false)}>
            ✕
          </button>
        </div>

        <div className="drawerBody">
          {cart.length === 0 ? (
            <div className="muted">Cart is empty</div>
          ) : (
            <>
              <div className="cartList">
                {cart.map((i) => (
                  <div key={i.productId} className="cartRow">
                    <div className="thumb">
                      {i.imageUrl ? (
                        <img className="thumbImg" src={getImagePath(i.imageUrl)} alt={i.name} />
                      ) : null}
                    </div>

                    <div className="cartInfo">
                      <div className="cartName">{String(i.name || "").toUpperCase()}</div>
                      <div className="cartPrice">{money(i.price)}</div>

                      <div className="qtyRow">
                        <button className="qtyBtn" onClick={() => dec(i.productId)}>
                          –
                        </button>
                        <div className="qty">{i.qty}</div>
                        <button className="qtyBtn" onClick={() => inc(i.productId)}>
                          +
                        </button>
                        <button className="qtyBtn" onClick={() => remove(i.productId)}>
                          ×
                        </button>
                      </div>
                    </div>

                    <div className="cartTotal">{money(Number(i.price) * Number(i.qty))}</div>
                  </div>
                ))}
              </div>

              <div className="subtotal">
                <div className="subtotalLeft">
                  <div className="subtotalLabel">SUBTOTAL:</div>
                  <div className="subtotalHint">Shipping and taxes calculated at checkout</div>
                </div>
                <div className="subtotalRight">{money(subtotal)}</div>
              </div>

              <button
                className="primary wide"
                type="button"
                onClick={() => {
                  setCartOpen(false);
                  navigate("/checkout");
                }}
              >
                CHECKOUT
              </button>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}

/** ---------- CHECKOUT ---------- **/
function CheckoutPage({ cart, setCart, subtotal }) {
  const navigate = useNavigate();

  const [custName, setCustName] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [custAddress, setCustAddress] = useState("");

  function createOrder() {
    if (!cart || cart.length === 0) return alert("Cart is empty");

    if (!custName.trim()) return alert("Enter name");
    if (!custPhone.trim()) return alert("Enter phone");
    if (!custAddress.trim()) return alert("Enter address");

    fetch("http://localhost:3001/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cart,
        customer: { name: custName, phone: custPhone, address: custAddress },
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data?.message) return alert(data.message);
        setCart([]);
        navigate(`/success?orderId=${data.id}`);
      })
      .catch(() => alert("Server error"));
  }

  return (
    <div className="checkoutPage">
      <div className="checkoutGrid">
        <div className="checkoutLeft">
          <div className="checkoutLogo" style={{ cursor: "pointer" }} onClick={() => navigate("/")}>
            MUSIC
          </div>
          <div className="crumbs">
            Cart &gt; <span>Information</span> &gt; Shipping &amp; Handling &gt; Payment
          </div>

          <h2 className="checkoutH2">Shipping address</h2>

          <input
            placeholder="Full name"
            value={custName}
            onChange={(e) => setCustName(e.target.value)}
          />

          <input
            placeholder="Address"
            value={custAddress}
            onChange={(e) => setCustAddress(e.target.value)}
          />

          <input
            placeholder="Phone"
            value={custPhone}
            onChange={(e) => setCustPhone(e.target.value)}
          />

          <div className="checkoutActions">
            <button className="ghost" type="button" onClick={() => navigate("/")}>
              RETURN TO STORE
            </button>

            <button className="primary" type="button" onClick={createOrder}>
              CONTINUE
            </button>
          </div>
        </div>

        <div className="checkoutRight">
          {cart.map((i) => (
            <div key={i.productId} className="summaryRow">
              <div className="summaryThumb">
                {i.imageUrl ? (
                  <img className="summaryImg" src={getImagePath(i.imageUrl)} alt={i.name} />
                ) : null}
                <span className="summaryBadge">{i.qty}</span>
              </div>
              <div className="summaryName">{i.name}</div>
              <div className="summaryPrice">{money(Number(i.price) * Number(i.qty))}</div>
            </div>
          ))}

          <div className="sumLine">
            <div className="muted">Subtotal</div>
            <div>{money(subtotal)}</div>
          </div>

          <div className="sumLine">
            <div className="muted">Shipping & Handling</div>
            <div className="muted">—</div>
          </div>

          <div className="sumTotal">
            <div>Total</div>
            <div className="sumTotalRight">
              <span className="muted">USD</span> {money(subtotal)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** ---------- SUCCESS ---------- **/
function SuccessPage() {
  const [params] = useSearchParams();
  const orderId = params.get("orderId");

  return (
    <div className="successPage">
      <div className="successBox">
        <div className="successTitle">ORDER CONFIRMED</div>
        <div className="successText">{orderId ? `Order #${orderId}` : "Order created"}</div>
        <Link className="primary wide" to="/">
          RETURN TO STORE
        </Link>
      </div>
    </div>
  );
}

/** ---------- ACCOUNT (LOGIN) ---------- **/
function AccountPage({ token, setToken }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Загружаем данные пользователя при наличии токена
  useEffect(() => {
    if (token) {
      setLoading(true);
      const savedEmail = localStorage.getItem("userEmail");
      fetch("http://localhost:3001/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((d) => {
          if (d?.id) {
            const payload = JSON.parse(atob(token.split(".")[1]));
            setUserData({
              id: d.id,
              role: d.role || payload?.role || "user",
              email: payload?.email || savedEmail || "user@example.com",
            });
            if (payload?.email) setEmail(payload.email);
            else if (savedEmail) setEmail(savedEmail);
          }
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [token]);

  function login(e) {
    e.preventDefault();
    fetch("http://localhost:3001/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d?.message) return alert(d.message);
        localStorage.setItem("token", d.token);
        localStorage.setItem("userEmail", email); // Сохраняем email
        setToken(d.token);
        alert("Logged in");
        navigate("/");
      });
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    setToken(null);
    setUserData(null);
    navigate("/");
  }

  return (
    <div className="authPage">
      <header className="topbar" style={{ position: "relative", marginBottom: 0 }}>
        <div className="leftNav"></div>
        <div className="logo" style={{ cursor: "pointer" }} onClick={() => navigate("/")}>
          MUSIC
        </div>
        <div className="rightNav"></div>
      </header>

      <div className="authPageContent">
        <div className="authBox">
          {token ? (
            <>
              <div className="authTitle">ACCOUNT</div>
              
              {loading ? (
                <div className="muted" style={{ marginBottom: 20 }}>Loading...</div>
              ) : userData ? (
                <div className="accountInfo">
                  <div className="accountSection">
                    <div className="accountLabel">EMAIL</div>
                    <div className="accountValue">{email || userData.email || "N/A"}</div>
                  </div>
                  
                  <div className="accountSection">
                    <div className="accountLabel">ROLE</div>
                    <div className="accountValue">{userData.role.toUpperCase()}</div>
                  </div>
                  
                  <div className="accountSection">
                    <div className="accountLabel">USER ID</div>
                    <div className="accountValue">#{userData.id}</div>
                  </div>
                </div>
              ) : (
                <div className="muted" style={{ marginBottom: 20 }}>
                  Unable to load user data
                </div>
              )}

              <button className="primary wide" type="button" onClick={logout} style={{ marginTop: 24 }}>
                LOGOUT
              </button>
            </>
          ) : (
            <>
              <div className="authTitle">SIGN IN</div>
              <form onSubmit={login} className="authForm">
                <label>EMAIL</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
                <label>PASSWORD</label>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  type="password"
                />
                <button className="primary wide" type="submit">
                  SIGN IN
                </button>
              </form>

              <div className="authHint">
                Don&apos;t have an account? <Link to="/register">Create one</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/** ---------- REGISTER ---------- **/
function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function register(e) {
    e.preventDefault();
    fetch("http://localhost:3001/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d?.message) return alert(d.message);
        alert("Registered. Now sign in.");
        navigate("/account");
      });
  }

  return (
    <div className="authPage">
      <div className="authBox">
        <div className="authTitle">CREATE ACCOUNT</div>

        <form onSubmit={register} className="authForm">
          <label>EMAIL</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
          <label>PASSWORD</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
          />
          <button className="primary wide" type="submit">
            CREATE
          </button>
        </form>

        <div className="authHint">
          Already have an account? <Link to="/account">Sign in</Link>
        </div>
      </div>
    </div>
  );
}

/** ---------- ADMIN: PRODUCTS ---------- **/
function AdminProductsPage({ token }) {
  const navigate = useNavigate();
  const isAdmin = useMemo(() => getRoleFromToken(token) === "admin", [token]);

  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [category, setCategory] = useState("merch");

  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editCategory, setEditCategory] = useState("merch");

  // Список доступных изображений из папки public/img
  const availableImages = [
    "Antagonist-Eyes-Tour-T-Shirt-Front.webp",
    "Antagonist-Tour-2.0-Double-Zip-Hoodie-Front.webp",
    "AT2.0Flashlight_Secondary.webp",
    "cover_1000x1000_b4fd6aaa-1799-4585-99a5-402d45aa3a0b.webp",
    "DieLit2LP.webp",
    "PlayboiCarti1LP.webp",
    "VIEW_PBC_TOUR_2025_MASK_HOODIE_FRONT_1.webp",
    "WholeLottaRed_5YearAnniversaryEdition_D2CExcl._BlackVinyl.webp",
    "WholeLottaRed_5YearAnniversaryEdition_Standard_RainCloudWhiteOpaqueVinyl.webp",
    "WholeLottaRedStandardCD.webp",
    "YVLRedFoamFinger.webp",
  ];

  function selectImage(filename) {
    setImageUrl(`/carti-merch-store/img/${filename}`);
  }

  function selectEditImage(filename) {
    setEditImageUrl(`/carti-merch-store/img/${filename}`);
  }

  function load() {
    fetch("http://localhost:3001/products")
      .then((r) => r.json())
      .then((d) => setItems(Array.isArray(d) ? d : []));
  }

  useEffect(() => {
    load();
  }, []);

  function authHeaders() {
    if (!token) return null;
    return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  }

  function add(e) {
    e.preventDefault();
    setError("");

    if (!isAdmin) return setError("Not admin. Login as admin.");
    const h = authHeaders();

    fetch("http://localhost:3001/products", {
      method: "POST",
      headers: h,
      body: JSON.stringify({ name, price: Number(price), imageUrl, category }),
    })
      .then(async (r) => {
        const d = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(d?.message || "Add error");
        return d;
      })
      .then(() => {
        setName("");
        setPrice("");
        setImageUrl("");
        setCategory("merch");
        load();
      })
      .catch((e2) => setError(String(e2.message || e2)));
  }

  function startEdit(p) {
    setEditId(p.id);
    setEditName(p.name || "");
    setEditPrice(String(p.price ?? ""));
    setEditImageUrl(p.imageUrl || "");
    setEditCategory(p.category || "merch");
  }

  function cancelEdit() {
    setEditId(null);
    setEditName("");
    setEditPrice("");
    setEditImageUrl("");
    setEditCategory("merch");
  }

  function saveEdit() {
    setError("");

    if (!isAdmin) return setError("Not admin. Login as admin.");
    const h = authHeaders();

    fetch(`http://localhost:3001/products/${editId}`, {
      method: "PUT",
      headers: h,
      body: JSON.stringify({
        name: editName,
        price: Number(editPrice),
        imageUrl: editImageUrl,
        category: editCategory,
      }),
    })
      .then(async (r) => {
        const d = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(d?.message || "Edit error");
        return d;
      })
      .then(() => {
        cancelEdit();
        load();
      })
      .catch((e2) => setError(String(e2.message || e2)));
  }

  function del(id) {
    setError("");

    if (!isAdmin) return setError("Not admin. Login as admin.");
    const h = authHeaders();

    fetch(`http://localhost:3001/products/${id}`, {
      method: "DELETE",
      headers: h,
    })
      .then(async (r) => {
        const d = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(d?.message || "Delete error");
        return d;
      })
      .then(() => load())
      .catch((e2) => setError(String(e2.message || e2)));
  }

  return (
    <div className="adminPage">
      <div className="adminTop">
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div className="logo" style={{ cursor: "pointer", margin: 0 }} onClick={() => navigate("/")}>
            MUSIC
          </div>
          <div className="adminTitle">ADMIN / PRODUCTS</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="ghost" type="button" onClick={() => navigate("/admin/orders")}>
            ORDERS
          </button>
          <button className="ghost" type="button" onClick={() => navigate("/")}>
            BACK
          </button>
        </div>
      </div>

      {error ? <div className="muted">{error}</div> : null}

      <div className="adminCard">
        <div className="adminBlockTitle">Add product</div>
        <form onSubmit={add} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="row">
            <input placeholder="name" value={name} onChange={(e) => setName(e.target.value)} />
            <input placeholder="price" value={price} onChange={(e) => setPrice(e.target.value)} />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                padding: "10px 14px",
                background: "#000",
                color: "#fff",
                border: "1px solid #2a2a2a",
                outline: "none",
                fontSize: 14,
                cursor: "pointer",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              <option value="merch">MERCH</option>
              <option value="music">MUSIC</option>
            </select>
            <button className="primary" type="submit">
              ADD
            </button>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={{ fontSize: 12, opacity: 0.8, letterSpacing: 1 }}>IMAGE (optional)</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <select
                value=""
                onChange={(e) => {
                  if (e.target.value) selectImage(e.target.value);
                }}
                style={{
                  padding: "8px 12px",
                  background: "#000",
                  color: "#fff",
                  border: "1px solid #2a2a2a",
                  outline: "none",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                <option value="">Choose from gallery...</option>
                {availableImages.map((img) => (
                  <option key={img} value={img}>
                    {img}
                  </option>
                ))}
              </select>
              <span style={{ opacity: 0.6, fontSize: 12 }}>or</span>
              <input
                placeholder="Enter image URL"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                style={{ flex: 1, minWidth: 200 }}
              />
            </div>
            {imageUrl && (
              <div style={{ marginTop: 8, padding: 8, border: "1px solid #222", background: "#0b0b0b" }}>
                <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 6 }}>Preview:</div>
                <img
                  src={getImagePath(imageUrl)}
                  alt="Preview"
                  style={{
                    maxWidth: "100%",
                    maxHeight: 120,
                    objectFit: "contain",
                    display: "block",
                  }}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            )}
          </div>
        </form>
      </div>

      <div className="adminList">
        {items.length === 0 ? (
          <div className="muted">No products</div>
        ) : (
          items
            .slice()
            .reverse()
            .map((p) => (
              <div key={p.id} className="adminCard">
                {editId === p.id ? (
                  <>
                    <div className="adminRow">
                      <div className="adminOrderId">Edit #{p.id}</div>
                      <div style={{ display: "flex", gap: 10 }}>
                        <button className="primary" type="button" onClick={saveEdit}>
                          SAVE
                        </button>
                        <button className="ghost" type="button" onClick={cancelEdit}>
                          CANCEL
                        </button>
                      </div>
                    </div>

                    <div className="adminBlock">
                      <div className="row">
                        <input value={editName} onChange={(e) => setEditName(e.target.value)} />
                        <input value={editPrice} onChange={(e) => setEditPrice(e.target.value)} />
                        <select
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value)}
                          style={{
                            padding: "10px 14px",
                            background: "#000",
                            color: "#fff",
                            border: "1px solid #2a2a2a",
                            outline: "none",
                            fontSize: 14,
                            cursor: "pointer",
                            textTransform: "uppercase",
                            letterSpacing: 1,
                          }}
                        >
                          <option value="merch">MERCH</option>
                          <option value="music">MUSIC</option>
                        </select>
                      </div>
                      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                        <label style={{ fontSize: 12, opacity: 0.8, letterSpacing: 1 }}>IMAGE</label>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                          <select
                            value=""
                            onChange={(e) => {
                              if (e.target.value) selectEditImage(e.target.value);
                            }}
                            style={{
                              padding: "8px 12px",
                              background: "#000",
                              color: "#fff",
                              border: "1px solid #2a2a2a",
                              outline: "none",
                              fontSize: 12,
                              cursor: "pointer",
                            }}
                          >
                            <option value="">Choose from gallery...</option>
                            {availableImages.map((img) => (
                              <option key={img} value={img}>
                                {img}
                              </option>
                            ))}
                          </select>
                          <span style={{ opacity: 0.6, fontSize: 12 }}>or</span>
                          <input
                            value={editImageUrl}
                            onChange={(e) => setEditImageUrl(e.target.value)}
                            placeholder="Enter image URL"
                            style={{ flex: 1, minWidth: 200 }}
                          />
                        </div>
                        {editImageUrl && (
                          <div style={{ marginTop: 8, padding: 8, border: "1px solid #222", background: "#0b0b0b" }}>
                            <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 6 }}>Preview:</div>
                            <img
                              src={editImageUrl}
                              alt="Preview"
                              style={{
                                maxWidth: "100%",
                                maxHeight: 120,
                                objectFit: "contain",
                                display: "block",
                              }}
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="adminRow">
                      <div>
                        <div className="adminOrderId">{String(p.name || "").toUpperCase()}</div>
                        <div className="muted">
                          ${Number(p.price).toFixed(2)} • id {p.id} • {p.category ? p.category.toUpperCase() : 'MERCH'}
                        </div>
                        {p.imageUrl ? (
                          <div className="muted" style={{ marginTop: 6, wordBreak: "break-all" }}>
                            {p.imageUrl}
                          </div>
                        ) : null}
                      </div>

                      <div style={{ display: "flex", gap: 10 }}>
                        <button className="ghost" type="button" onClick={() => startEdit(p)}>
                          EDIT
                        </button>
                        <button className="ghost" type="button" onClick={() => del(p.id)}>
                          DELETE
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))
        )}
      </div>
    </div>
  );
}

/** ---------- ADMIN: ORDERS ---------- **/
function AdminOrdersPage({ token }) {
  const navigate = useNavigate();
  const isAdmin = useMemo(() => getRoleFromToken(token) === "admin", [token]);

  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("No token. Please sign in as admin.");
      return;
    }
    if (!isAdmin) {
      setError("Not admin.");
      return;
    }

    // try /admin/orders first, fallback to /orders
    const tryAdmin = () =>
      fetch("http://localhost:3001/admin/orders", {
        headers: { Authorization: `Bearer ${token}` },
      }).then(async (r) => {
        if (r.ok) return r.json();
        throw new Error("fallback");
      });

    const tryPublic = () =>
      fetch("http://localhost:3001/orders").then((r) => r.json());

    tryAdmin()
      .catch(() => tryPublic())
      .then((d) => setOrders(Array.isArray(d) ? d : []))
      .catch((e) => setError(String(e.message || e)));
  }, [token, isAdmin]);

  return (
    <div className="adminPage">
      <div className="adminTop">
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div className="logo" style={{ cursor: "pointer", margin: 0 }} onClick={() => navigate("/")}>
            MUSIC
          </div>
          <div className="adminTitle">ADMIN / ORDERS</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="ghost" type="button" onClick={() => navigate("/admin/products")}>
            PRODUCTS
          </button>
          <button className="ghost" type="button" onClick={() => navigate("/")}>
            BACK
          </button>
        </div>
      </div>

      {error ? (
        <div className="muted">{error}</div>
      ) : (
        <div className="adminList">
          {orders.length === 0 ? (
            <div className="muted">No orders</div>
          ) : (
            orders
              .slice()
              .reverse()
              .map((o) => (
                <div key={o.id} className="adminCard">
                  <div className="adminRow">
                    <div>
                      <div className="adminOrderId">Order #{o.id}</div>
                      <div className="muted">{o.createdAt}</div>
                    </div>
                    <div className="adminStatus">{o.status || "new"}</div>
                  </div>

                  <div className="adminBlock">
                    <div className="adminBlockTitle">Customer</div>
                    <div className="muted">
                      {o.customer?.name} • {o.customer?.phone}
                      <br />
                      {o.customer?.address}
                    </div>
                  </div>

                  <div className="adminBlock">
                    <div className="adminBlockTitle">Items</div>
                    <div className="muted">
                      {(o.items || []).map((it, idx) => (
                        <div key={idx}>
                          {it.name} — {it.qty} × ${Number(it.price).toFixed(2)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      )}
    </div>
  );
}

/** ---------- APP ---------- **/
export default function App() {
  const [products, setProducts] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [qtyById, setQtyById] = useState({});
  const [token, setToken] = useState(localStorage.getItem("token"));

  function loadProducts() {
    fetch("http://localhost:3001/products")
      .then((r) => r.json())
      .then((d) => setProducts(Array.isArray(d) ? d : []))
      .catch(() => setProducts([]));
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const subtotal = useMemo(() => {
    return cart.reduce((s, i) => s + Number(i.price) * Number(i.qty), 0);
  }, [cart]);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <ShopPage
            products={products}
            cart={cart}
            setCart={setCart}
            cartOpen={cartOpen}
            setCartOpen={setCartOpen}
            qtyById={qtyById}
            setQtyById={setQtyById}
            token={token}
          />
        }
      />

      <Route
        path="/checkout"
        element={<CheckoutPage cart={cart} setCart={setCart} subtotal={subtotal} />}
      />

      <Route path="/success" element={<SuccessPage />} />

      <Route path="/account" element={<AccountPage token={token} setToken={setToken} />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/admin/products" element={<AdminProductsPage token={token} />} />
      <Route path="/admin/orders" element={<AdminOrdersPage token={token} />} />

      <Route
        path="*"
        element={
          <div style={{ padding: 24 }}>
            <div style={{ marginBottom: 12 }}>Not found</div>
            <Link to="/">Go home</Link>
          </div>
        }
      />
    </Routes>
  );
}
