import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Spectacles } from './pages/Spectacles';
import { Medias } from './pages/Medias';
import { Actualites } from './pages/Actualites';
import { ActualiteDetail } from './pages/ActualiteDetail';
import { APropos } from './pages/APropos';
import { Contact } from './pages/Contact';
import { AdminSpectacles } from './pages/AdminSpectacles';
import { AdminMedias } from './pages/AdminMedias';
import { AdminActualites } from './pages/AdminActualites';
import { AdminMessages } from './pages/AdminMessages';
import { AdminLogin } from './pages/AdminLogin';
import { AdminLayout } from './pages/AdminLayout';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col" style={{ fontFamily: 'var(--font-sans)' }}>
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/spectacles" element={<Spectacles />} />
            <Route path="/medias" element={<Medias />} />
            <Route path="/actualites" element={<Actualites />} />
            <Route path="/actualites/:id" element={<ActualiteDetail />} />
            <Route path="/a-propos" element={<APropos />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="spectacles" element={<AdminSpectacles />} />
              <Route path="medias" element={<AdminMedias />} />
              <Route path="actualites" element={<AdminActualites />} />
              <Route path="messages" element={<AdminMessages />} />
            </Route>
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
