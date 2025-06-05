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
  price: Number,
  detailedDescription: { type: String, required: true },
  images: [String],
  day1: { type: String, required: true },
  day2: { type: String, required: true },
  day3: { type: String, required: true },
  day4: { type: String, required: true },
  day5: { type: String, required: true }
});
const Package = mongoose.model('Package', packageSchema, 'packages');

// Admin schema and model
const adminSchema = new mongoose.Schema({
  username: String,
  password: String
});
const Admin = mongoose.model('Admin', adminSchema, 'admin');

// Message schema and model
const messageSchema = new mongoose.Schema({
  name: String,
  email: String,
  subject: String,
  message: String,
  createdAt: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', messageSchema, 'messages');

// Booking schema and model
const bookingSchema = new mongoose.Schema({
  email: String,
  name: String,
  destination: String,
  passengers: Number,
  boarding: String,
  bill: Number,
  createdAt: { type: Date, default: Date.now }
});
const Booking = mongoose.model('Booking', bookingSchema, 'booking');

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

// Add a package (detailedDescription, images, and day1-day5 required)
app.post('/api/packages', async (req, res) => {
  const {
    name, image, price, description, detailedDescription,
    images, day1, day2, day3, day4, day5
  } = req.body;

  // Debug log to verify incoming data
  console.log('Add package request:', req.body);

  if (
    !name ||
    !image ||
    !price ||
    !description ||
    !detailedDescription ||
    !images ||
    !Array.isArray(images) ||
    images.length !== 3 ||
    images.some(img => !img) ||
    !day1 || !day2 || !day3 || !day4 || !day5
  ) {
    return res.status(400).json({ error: 'All fields, 3 images, and 5 days are required' });
  }
  try {
    const pkg = new Package({
      name,
      image,
      price,
      description,
      detailedDescription,
      images,
      day1,
      day2,
      day3,
      day4,
      day5
    });
    await pkg.save();
    res.json({ success: true, package: pkg });
  } catch (err) {
    console.error('Failed to add package:', err);
    res.status(500).json({ error: 'Failed to add package' });
  }
});

// Get a single package by ID
app.get('/api/packages/:id', async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) return res.status(404).json({ error: 'Package not found' });
    res.json(pkg);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch package' });
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

// Update a package
app.put('/api/packages/:id', async (req, res) => {
  const {
    name, image, price, description, detailedDescription,
    images, day1, day2, day3, day4, day5
  } = req.body;
  if (
    !name ||
    !image ||
    !price ||
    !description ||
    !detailedDescription ||
    !images ||
    !Array.isArray(images) ||
    images.length !== 3 ||
    images.some(img => !img) ||
    !day1 || !day2 || !day3 || !day4 || !day5
  ) {
    return res.status(400).json({ error: 'All fields, 3 images, and 5 days are required' });
  }
  try {
    const pkg = await Package.findByIdAndUpdate(
      req.params.id,
      {
        name,
        image,
        price,
        description,
        detailedDescription,
        images,
        day1,
        day2,
        day3,
        day4,
        day5
      },
      { new: true }
    );
    if (!pkg) return res.status(404).json({ error: 'Package not found' });
    res.json({ success: true, package: pkg });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update package' });
  }
});

// Contact message route
app.post('/api/messages', async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  try {
    const msg = new Message({ name, email, subject, message });
    await msg.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get all messages (for admin notifications)
app.get('/api/messages', async (req, res) => {
  try {
    const messages = await Message.find({}).sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Add booking route
app.post('/api/booking', async (req, res) => {
  const { email, name, destination, passengers, boarding, bill } = req.body;
  // Fix: allow bill=0 and passengers=0 only if explicitly set, but not undefined/null/empty
  if (
    !email ||
    !name ||
    !destination ||
    typeof passengers !== 'number' ||
    passengers < 1 ||
    !boarding ||
    typeof bill !== 'number'
  ) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  try {
    const booking = new Booking({ email, name, destination, passengers, boarding, bill });
    await booking.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save booking' });
  }
});

// Get all bookings for a user
app.get('/api/mytrips', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.json([]);
  try {
    const trips = await Booking.find({ email }).sort({ createdAt: -1 });
    res.json(trips);
  } catch {
    res.json([]);
  }
});

app.listen(5000, () => console.log('Server running on port 5000'));

