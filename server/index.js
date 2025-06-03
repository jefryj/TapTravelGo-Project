const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/taptravelgo', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.on('connected', () => {
  console.log('MongoDB connection established successfully!');
});
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err.message);
});

// User schema and model
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  phone: String,
  password: String
});
const User = mongoose.model('User', userSchema, 'users'); // <-- specify 'users' collection

// Package schema and model
const packageSchema = new mongoose.Schema({
  name: String,
  image: String,
  description: String,
  price: Number
});
const Package = mongoose.model('Package', packageSchema, 'packages');

// Admin schema and model
const adminSchema = new mongoose.Schema({
  username: String,
  password: String
});
const Admin = mongoose.model('Admin', adminSchema, 'admin');

// Signup route
app.post('/api/signup', async (req, res) => {
  const { name, email, phone, password } = req.body;
  // Add validation
  if (!name || !email || !phone || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  try {
    console.log('Signup request:', req.body);
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, phone, password: hashed });
    await user.save();
    console.log('User created:', { name, email, phone });
    res.json({ success: true });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login route
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  // Add validation
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  try {
    console.log('Login request:', req.body);
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: 'Invalid credentials' });

    res.json({ success: true, user: { name: user.name, email: user.email } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin login route
app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;
  // Add validation
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }
  try {
    const admin = await Admin.findOne({ username });
    if (!admin || admin.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    res.json({ success: true, admin: { username: admin.username } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add this route to handle GET / (move it BEFORE all other routes)
app.get('/', (req, res) => {
  res.send('TapTravelGo backend is running.');
});

// Add a health check route for MongoDB connection
app.get('/api/db-status', async (req, res) => {
  try {
    // This will throw if not connected
    await mongoose.connection.db.admin().ping();
    res.json({ connected: true });
  } catch (err) {
    res.status(500).json({ connected: false, error: err.message });
  }
});

// Add this route to get all packages
app.get('/api/packages', async (req, res) => {
  try {
    const packages = await Package.find({});
    // Map backend fields to frontend expected fields
    const mapped = packages.map(pkg => ({
      _id: pkg._id,
      name: pkg.name,
      img: pkg.image, // use 'image' from DB
      desc: pkg.description, // use 'description' from DB
      rate: pkg.price !== undefined && pkg.price !== null ? `₹${pkg.price.toLocaleString()}` : '' // use 'price' from DB
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch packages' });
  }
});

// Add a package
app.post('/api/packages', async (req, res) => {
  const { name, image, price, description } = req.body;
  if (!name || !image || !price || !description) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  try {
    const pkg = new Package({ name, image, price, description });
    await pkg.save();
    res.json({ success: true, package: pkg });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add package' });
  }
});

// Delete a package
app.delete('/api/packages/:id', async (req, res) => {
  try {
    await Package.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete package' });
  }
});

app.listen(5000, () => console.log('Server running on port 5000'));

