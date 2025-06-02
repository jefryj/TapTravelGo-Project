import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react'
import Home from './pages/Home.jsx'
import Footer from './pages/Footer'
import Header from './pages/Header'
import Contact from './pages/Contact.jsx'
import AboutUs from './pages/AboutUs.jsx'
import LoginPage from './pages/LoginPage.jsx'
import SignUp from './pages/SignUp.jsx'


function App() {
  const [search, setSearch] = useState('');
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/home" element={
          <>
            <Header search={search} setSearch={setSearch} />
            <div id="home">
              <Home search={search} setSearch={setSearch} />
            </div>
            <div id="aboutus">
              <AboutUs/>
            </div>
            <div id="contact">
              <Contact/>
            </div>
            <Footer/>
          </>
        } />
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
