import { GITHUB_URL } from '../data/projects';
import { company } from '../data/site';
import { Ext } from './ui';

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer__row">
        <p>© {new Date().getFullYear()} David Muumbi Mbuvi · David Mbuvi · Mbuvi Tech</p>
        <p className="mono-label">BUILT WITH REACT · TYPESCRIPT · MERMAID</p>
        <Ext href={GITHUB_URL}>github.com/cheekydavy</Ext>
        <p>
          Founder, <Ext href={company.url}>{company.name}</Ext>
        </p>
      </div>
    </footer>
  );
}
