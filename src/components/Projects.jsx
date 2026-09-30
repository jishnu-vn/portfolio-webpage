import { useMemo, useState } from 'react';

const projects = [
  { name: 'COMPRESSO', type: 'Python application', description: 'A file compression application built using Python with a Streamlit interface.', tech: ['Python', 'Streamlit', 'zlib', 'LZMA'], features: ['File compression', 'Multithreaded compression'] },
  { name: 'μSHAKTHIOS', type: 'Embedded systems', description: 'A lightweight embedded RTOS project for ESP32 with a graphical interface.', tech: ['ESP32', 'FreeRTOS', 'LVGL', 'SPIFFS'], features: [] },
  { name: 'MONAD CANVAS', type: 'Hackathon team project', description: 'An on-chain, 64×64 collaborative pixel canvas built on Monad Testnet with a Gemini-backed semantic engine.', tech: ['JavaScript', 'Monad Testnet', 'Gemini API'], features: ['Team: Ronav JS Gop, Sayandeep Dutta', 'My role: TODO — add your contribution'], github: 'https://github.com/jishnu-vn/monad-canvas', original: 'https://github.com/redhatsam09/monad-canvas' },
];

export default function Projects() {
  const [query, setQuery] = useState(''); const [filter, setFilter] = useState('All');
  const types = ['All', ...new Set(projects.map(p => p.type))];
  const shown = useMemo(() => projects.filter(p => (filter === 'All' || p.type === filter) && `${p.name} ${p.description} ${p.tech.join(' ')}`.toLowerCase().includes(query.toLowerCase())), [query, filter]);
  return <section className="content-section" id="projects"><p className="eyebrow">02 / PROJECTS</p><h2>Projects I’ve built and contributed to.</h2><div className="project-tools"><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search technologies or projects" aria-label="Search projects" /><select value={filter} onChange={e => setFilter(e.target.value)} aria-label="Filter projects">{types.map(type => <option key={type}>{type}</option>)}</select></div><div className="project-grid">{shown.map(project => <article className="project-card" key={project.name}><p className="project-type">{project.type}</p><h3>{project.name}</h3><p>{project.description}</p><div className="tags">{project.tech.map(t => <span key={t}>{t}</span>)}</div>{project.features.length > 0 && <ul>{project.features.map(f => <li key={f}>{f}</li>)}</ul>}{project.github && <p className="links"><a href={project.github} target="_blank" rel="noreferrer">GitHub ↗</a><a href={project.original} target="_blank" rel="noreferrer">Original repo ↗</a></p>}</article>)}</div>{shown.length === 0 && <p className="empty">No projects match that search.</p>}</section>;
}
