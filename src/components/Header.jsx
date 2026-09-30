export default function Header({ view, setView }) {
  const links = [['home', 'About'], ['projects', 'Projects'], ['skills', 'Skills'], ['contact', 'Contact']];
  return <header><a className="brand" onClick={() => setView('home')} href="#home"><img src="/jishnu.jpg" alt="Jishnu VN" />Jishnu VN <small>SRMIST · CSE</small></a><nav>{links.map(([key, label]) => <button className={view === key ? 'active' : ''} onClick={() => setView(key)} key={key}>{label}</button>)}</nav><a className="contact-top" href="mailto:jishnuravi66@gmail.com">Get in touch</a></header>;
}
