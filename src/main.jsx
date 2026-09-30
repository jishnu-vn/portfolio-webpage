import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';
import './scene.css';
import ChipScene from './components/ChipScene';
import Header from './components/Header';
import Home from './components/Home';
import Projects from './components/Projects';
import Skills from './components/Skills';
import Contact from './components/Contact';

function App() {
  const [view, setView] = useState('home');
  useEffect(() => {
    document.title = `${view === 'home' ? 'Jishnu VN' : view[0].toUpperCase() + view.slice(1)} | Portfolio`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [view]);
  return <><ChipScene /><Header view={view} setView={setView} /><main>{view === 'home' && <Home setView={setView} />}{view === 'projects' && <Projects />}{view === 'skills' && <Skills />}{view === 'contact' && <Contact />}</main><footer>© 2026 Jishnu VN · Built with ReactJS</footer></>;
}

createRoot(document.getElementById('root')).render(<App />);
