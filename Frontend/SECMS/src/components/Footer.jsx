import './Footer.css';

const footerColumns = [
  {
    heading: 'CATEGORIES',
    links: ['Men', 'Women', 'Shop'],
  },
  {
    heading: 'ABOUT',
    links: ['Account', 'Help', 'Contact', 'Track your Order'],
  },
  {
    heading: 'Shipping',
    links: [
      'My Orders',
      'Size Guide',
      'Accessibility Statement',
      'Cookie Policy',
      'Privacy Policy',
      'Sitemap',
    ],
  },
  {
    heading: null,
    links: [
      'Community Events',
      'Terms and Conditions',
      'Website term of use',
      'FAQ',
      'Return Policy',
      'AI Usage',
    ],
  },
];

const socials = ['Facebook', 'TikTok', 'Instagram', 'X'];

function Footer() {
  return (
    <footer className="footer">
      {/* ── Link columns ── */}
      <div className="footer__columns">
        {footerColumns.map((col, i) => (
          <div key={i} className="footer__col">
            {col.heading && (
              <span className="footer__col-heading">{col.heading}</span>
            )}
            <ul className="footer__col-list">
              {col.links.map((link) => (
                <li key={link}>
                  <a href="#" className="footer__link">{link}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* ── Bottom bar ── */}
      <div className="footer__bar">
        <div className="footer__socials">
          {socials.map((s) => (
            <a key={s} href="#" className="footer__social-link">{s}</a>
          ))}
        </div>
        <span className="footer__copyright">Copyright 2026 @ANYWEAR</span>
        <div className="footer__legal">
          <a href="#" className="footer__social-link">Privacy Policy</a>
          <a href="#" className="footer__social-link">Terms and Conditions</a>
        </div>
      </div>

      {/* ── Giant brand ── */}
      <div className="footer__brand">ANYWEAR</div>
    </footer>
  );
}

export default Footer;
