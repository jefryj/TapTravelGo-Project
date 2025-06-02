const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/taptravelgo');

// Check MongoDB connection status on server start
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
const User = mongoose.model('User', userSchema);

// Package schema and model
const packageSchema = new mongoose.Schema({
  name: String,
  image: String,
  description: String,
  price: Number
});
const Package = mongoose.model('Package', packageSchema, 'packages');

// Signup route
app.post('/api/signup', async (req, res) => {
  const { name, email, phone, password } = req.body;
  try {
    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, phone, password: hashed });
    await user.save();
    console.log('User created:', { name, email, phone }); // <-- This log confirms data is saved
    res.json({ success: true });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login route
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    // Only authenticate users that exist in the database (created via signup)
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    // Compare the hashed password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: 'Invalid credentials' });

    res.json({ success: true, user: { name: user.name, email: user.email } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
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

app.listen(5000, () => console.log('Server running on port 5000'));

// This is your Express server backend file.
// It handles API requests for login and signup from your React frontend.
// It listens on port 5000 and uses MongoDB to store users.
// You can POST to /api/signup and /api/login from your frontend to register and authenticate users.
// MongoDB must be running for the server to connect to the database.

// How to set up MongoDB connection for your login/signup server

// 1. **Install MongoDB Community Edition**  
//    - Download and install from: https://www.mongodb.com/try/download/community
//    - Follow the installation instructions for your OS.

// 2. **Start MongoDB server**  
//    - Open a terminal or Command Prompt.
//    - Run:
//      ```
//      mongod
//      ```
//    - Leave this terminal open. You should see "waiting for connections on port 27017".

// 3. **Install Node.js dependencies (if not done already)**  
//    - In your project folder, run:
//      ```
//      npm install express cors mongoose bcryptjs
//      ```

// 4. **Start your Express server**  
//    - In a new terminal, run:
//      ```
//      node index.js
//      ```
//    - You should see "Server running on port 5000".

// 5. **Check MongoDB Compass (optional)**  
//    - Open MongoDB Compass.
//    - Connect to `mongodb://localhost:27017`.
//    - You will see the `taptravelgo` database and `users` collection after a user signs up.

// 6. **Your React frontend can now POST to `/api/signup` and `/api/login`**  
//    - The backend will store and check users in MongoDB.

// ---

// **Summary:**  
// - Start MongoDB with `mongod`.
// - Start your server with `node index.js`.
// - Your backend will connect to MongoDB at `mongodb://localhost:27017/taptravelgo`.

// How to use MongoDB Compass from scratch

// 1. **Download and Install MongoDB Compass**
//    - Go to: https://www.mongodb.com/try/download/compass
//    - Download and install for your operating system.

// 2. **Start your MongoDB server**
//    - Open a terminal or Command Prompt.
//    - Run:
//      ```
//      mongod
//      ```
//    - Leave this window open. You should see "waiting for connections on port 27017".

// 3. **Open MongoDB Compass**
//    - Launch the MongoDB Compass application.

// 4. **Connect to your local MongoDB**
//    - In the "New Connection" window, enter this URI:
//      ```
//      mongodb://localhost:27017
//      ```
//    - Click the green "Connect" button.

// 5. **View your database and users**
//    - After you sign up a user from your app, you will see a database called `taptravelgo` in the left sidebar.
//    - Click on `taptravelgo`.
//    - Click on the `users` collection.
//    - You will see all registered users as documents.

// 6. **What you can do in Compass**
//    - **View**: See all users and their details.
//    - **Edit**: Click on a document to edit user info.
//    - **Delete**: Select a document and click "Delete".
//    - **Add**: Click "ADD DATA" > "Insert Document" to add a user manually (for testing).

// 7. **You do NOT need to create the database or collection manually**
//    - Your backend will create them automatically when a user signs up.

// ---

// **Summary:**  
// - Use Compass to view/manage your data visually.
// - Connect to `mongodb://localhost:27017`.
// - Your app will create the `taptravelgo` database and `users` collection automatically.

// Fix: `'mongod' is not recognized as an internal or external command`

//This means MongoDB is **not installed** or its `bin` folder is **not added to your PATH**.

// Steps to fix:

//1. **Download and Install MongoDB Community Edition**
   //- Go to: https://www.mongodb.com/try/download/community
   //- Download the installer for Windows.
   //- Run the installer and follow the instructions.
   //- Make sure to select "Complete" setup and check "Install MongoDB as a Service" if you want it to start automatically.

//2. **Add MongoDB to your PATH (if not already)**
   //- Find where MongoDB is installed, e.g., `C:\Program Files\MongoDB\Server\6.0\bin`
   //- Copy this path.
   //- Open Start Menu, search for "Environment Variables", and open "Edit the system environment variables".
   //- Click "Environment Variables".
   //- Under "System variables", find and select `Path`, then click "Edit".
   //- Click "New" and paste the MongoDB `bin` path.
   //- Click OK on all dialogs.

//3. **Open a new Command Prompt and run:**
  // ```
  // mongod
 //  ```
 ///  - You should now see MongoDB starting and "waiting for connections on port 27017".

//4. **If you installed as a service, you can also start it with:**
  // ```
  // net start MongoDB
  // ```
 //  - Or use "Services" in Windows to start/stop MongoDB.

//---

//**Summary:**  
////- Install MongoDB Community Edition.
//- Add the `bin` folder to your PATH.
//- Open a new terminal and run `mongod`.

/*
What to do in MongoDB Compass:

1. Open MongoDB Compass.
2. Connect to your local MongoDB server:
   - In the "New Connection" window, enter this URI:
     mongodb://localhost:27017
   - Click the green "Connect" button.

3. That's it!
   - After a user signs up from your app, the `taptravelgo` database and `users` collection will be created automatically by your backend.
   - You can then click on `taptravelgo` in the left sidebar, and then on `users` to view the data.

Summary:
- Just connect to `mongodb://localhost:27017` in Compass.
- Do NOT create the database or collection manually.
- Your Express/Mongoose backend will handle creation when you use the app.
*/

// MongoDB database structure (as seen in Compass):
//
// taptravelgo (database)
// └── users (collection)
//     ├── { _id, name, email, phone, password }   // Each document is a user
//
// Example user document:
// {
//   _id: ObjectId("..."),
//   name: "Jefry Joseph",
//   email: "jefry@example.com",
//   phone: "9876543210",
//   password: "<hashed_password>"
// }
//
// The database and collection are created automatically by Mongoose when a user signs up.
// You do NOT need to create them manually.

// Your MongoDB server is **not starting** because the default data directory does not exist.

// **Error:**
  //NonExistentPath: Data directory \data\db not found. Create the missing directory or specify another path using (1) the --dbpath command line option, or (2) by adding the 'storage.dbPath' option in the configuration file.

// ---

// **How to fix:**

// 1. **Create the data directory:**
   // - Open Command Prompt as Administrator.
   // - Run:
     // ```
     // mkdir \data\db
     // ```
   // - Or, if you want to use your user directory:
     // ```
     // mkdir C:\data\db
     // ```

 // 2. **Start MongoDB again:**
   // - Run:
     // ```
     // mongod
     // ```
   // - You should now see "waiting for connections on port 27017".

// ---

// **Summary:**  
// - MongoDB needs a folder at `C:\data\db` (or `\data\db`) to store its data.
// - Create this folder, then start `mongod` again.

// If you want to move this server file back to c:\Users\Jefry.Joseph\Desktop\project\server\index.js,
// update the static file serving path (if you use it) like this:

// const path = require('path');
// app.use(express.static(path.join(__dirname, '../taptravelgo/dist')));
// app.get(/^\/(?!api\/).*/, (req, res) => {
//   res.sendFile(path.join(__dirname, '../taptravelgo/dist/index.html'));
// });

// If you are NOT serving the React build from Express, you can remove the above static serving code entirely.
