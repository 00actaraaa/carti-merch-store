const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'secret123';

const app = express();
app.use(express.json());
app.use(cors());

const products = [];
const users = [];
users.push({
  id: 1,
  email: "admin@test.com",
  password: "admin123",
  role: "admin",
});

const orders = [];

function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Нет токена' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Нет токена' });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: 'Неверный токен' });
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin only" });
  }
  next();
}

app.get('/', (req, res) => {
  res.send('Backend работает');
});

// PRODUCTS
app.get('/products', (req, res) => {
  // Убеждаемся, что у всех товаров есть категория (по умолчанию 'merch')
  const productsWithCategory = products.map(p => ({
    ...p,
    category: p.category || 'merch'
  }));
  res.json(productsWithCategory);
});

app.get('/products/:id', (req, res) => {
  const id = Number(req.params.id);
  const product = products.find(p => p.id === id);
  if (!product) return res.status(404).json({ message: 'Товар не найден' });
  // Убеждаемся, что у товара есть категория
  res.json({
    ...product,
    category: product.category || 'merch'
  });
});

app.post('/products', auth, requireAdmin, (req, res) => {


    const { name, price, imageUrl, category } = req.body;

  if (!name || price === undefined) {
    return res.status(400).json({ message: 'name и price обязательны' });
  }

  const product = {
    id: Date.now(),
    name,
    price: Number(price),
    imageUrl: typeof imageUrl === 'string' ? imageUrl.trim() : '',
    category: category === 'music' || category === 'merch' ? category : 'merch'
  };

  products.push(product);
  res.status(201).json(product);
});

app.put('/products/:id', auth, requireAdmin, (req, res) => {


  const id = Number(req.params.id);
  const { name, price, imageUrl, category } = req.body;

  const product = products.find(p => p.id === id);
  if (!product) return res.status(404).json({ message: 'Товар не найден' });

  if (name !== undefined) product.name = name;
  if (price !== undefined) product.price = Number(price);
  if (imageUrl !== undefined) product.imageUrl = typeof imageUrl === 'string' ? imageUrl.trim() : '';
  if (category !== undefined) product.category = category === 'music' || category === 'merch' ? category : (product.category || 'merch');

  res.json(product);
});
app.delete('/products/:id', auth, requireAdmin, (req, res) => {


  const id = Number(req.params.id);
  const index = products.findIndex(p => p.id === id);
  if (index === -1) return res.status(404).json({ message: 'Товар не найден' });

  products.splice(index, 1);
  res.json({ message: 'Товар удалён' });
});

// AUTH
app.post('/auth/register', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'email и password обязательны' });
  }

  const exists = users.find(u => u.email === email);
  if (exists) {
    return res.status(400).json({ message: 'Пользователь уже существует' });
  }

  const user = {
    id: Date.now(),
    email,
    password,
    role: 'user'
  };

  users.push(user);
  res.status(201).json(user);
});

app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'email и password обязательны' });
  }

  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ message: 'Неверные данные' });

  const token = jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  res.json({ token });
});

app.get('/me', auth, (req, res) => {
  res.json(req.user);
});

// ORDERS (public)
app.post('/orders', (req, res) => {
  const { items, customer } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'items обязателен' });
  }
  if (!customer || !customer.name || !customer.phone || !customer.address) {
    return res.status(400).json({ message: 'customer.name, phone, address обязательны' });
  }

  const order = {
    id: Date.now(),
    items,
    customer,
    createdAt: new Date().toISOString()
  };

  orders.push(order);
  res.status(201).json(order);
});

app.get('/orders', (req, res) => {
  res.json(orders);
});

app.get("/admin/orders", auth, requireAdmin, (req, res) => {
  res.json(orders);
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log('Сервер запущен на http://localhost:' + PORT);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Порт ${PORT} уже занят. Попробуйте другой порт.`);
  } else {
    console.error('Ошибка запуска сервера:', err);
  }
  process.exit(1);
});