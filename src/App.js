
import ChangeTable from './components/ChangeTable';
import './App.css';
import blogIcon from './blog.svg';
import linkedinIcon from './linkedin.svg';
import youtubeIcon from './youtube.svg';
import xIcon from './x.svg';

const socials = [
  {
    href: 'https://ourcloudnetwork.com/',
    label: 'Blog',
    icon: <img src={blogIcon} alt="Blog" width="24" height="24" />,
  },
  {
    href: 'https://www.linkedin.com/in/danielbradley2/',
    label: 'LinkedIn',
    icon: <img src={linkedinIcon} alt="LinkedIn" width="24" height="24" />,
  },
  {
    href: 'https://www.youtube.com/@ourcloudnetwork',
    label: 'YouTube',
    icon: <img src={youtubeIcon} alt="YouTube" width="24" height="24" />,
  },
  {
    href: 'https://x.com/DanielatOCN',
    label: 'X',
    icon: <img src={xIcon} alt="X" width="24" height="24" />,
  },
];


function App() {
  return (
    <div className="App">
      <header className="ed-header">
        <div className="ed-header-content">
          <img src={process.env.PUBLIC_URL + '/logo.png'} className="ed-logo" alt="EntraDocsTracker Logo" />
          <h1 className="ed-title">EntraDocsTracker</h1>
        </div>
      </header>
      <div className="ed-creator-bar">
        <span className="ed-creator-text">Made by Daniel Bradley</span>
        <span className="ed-socials">
          {socials.map(s => (
            <a key={s.href} href={s.href} className="ed-social-link" target="_blank" rel="noopener noreferrer" title={s.label} aria-label={s.label}>
              {s.icon}
            </a>
          ))}
        </span>
      </div>
      <main className="ed-main">
        <ChangeTable />
      </main>
      <footer className="ed-footer">
        <span>Copyright © {new Date().getFullYear()} EntraDocsTracker | Powered by <a href="https://ourcloudnetwork.com/" target="_blank" rel="noopener noreferrer">ourcloudnetwork.com</a></span>
      </footer>
    </div>
  );
}

export default App;
