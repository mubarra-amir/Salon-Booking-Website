import { BrowserRouter, Routes, Route, NavLink, Link } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Book from './pages/Book.jsx';
import MyBookings from './pages/MyBookings.jsx';
import Admin from './pages/Admin.jsx';

function Nav() {
  return (
    <nav className="nav">
      <div className="wrap nav-inner">
        <Link to="/" className="brand">Velvet <em>Glow</em></Link>
        <div className="nav-links">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/book">Book Now</NavLink>
          <NavLink to="/my-bookings">My Bookings</NavLink>
          <NavLink to="/admin">Admin</NavLink>
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <h4>Velvet Glow</h4>
          <p>Salon &amp; Spa — where Lahore comes to unwind. Premium treatments, honest prices, zero waiting.</p>
        </div>
        <div>
          <h4>Visit us</h4>
          <p>14-B Main Boulevard<br />DHA Phase 5, Lahore<br />Mon – Sat, 10:00 AM – 8:00 PM</p>
        </div>
        <div>
          <h4>Contact</h4>
          <p>0300 123 4567<br />hello@velvetglow.pk<br />@velvetglow.lahore</p>
        </div>
      </div>
      <div className="footer-bottom">© 2026 Velvet Glow Salon &amp; Spa · Demo project</div>
    </footer>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/book" element={<Book />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}
