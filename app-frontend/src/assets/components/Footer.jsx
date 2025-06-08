import '../../assets/styles/Footer.css';
import { TEXTS } from '../data/texts';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-left">
          <iframe
            src={TEXTS.FOOTER.MAP_SRC}
            width="100%"
            height="200"
            allowFullScreen=""
            loading="lazy"
            style={{ border: 0, borderRadius: "12px" }}
            referrerPolicy="no-referrer-when-downgrade"
            title={TEXTS.FOOTER.MAP_TITLE}
          ></iframe>
          <a
            className="footer-address"
            href={TEXTS.FOOTER.ADDRESS_LINK}
            target="_blank"
            rel="noopener noreferrer"
          >
            {TEXTS.FOOTER.ADDRESS_TEXT}
          </a>
        </div>

        <div className="footer-right">
          <p id="footer-title">{TEXTS.FOOTER.BRAND_NAME}</p>
          <p id="footer-email">{TEXTS.FOOTER.EMAIL}</p>
          <p id="footer-phone">{TEXTS.FOOTER.PHONE}</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          &copy; {new Date().getFullYear()} {TEXTS.FOOTER.BRAND_NAME}. {TEXTS.FOOTER.RIGHTS}
        </p>
      </div>
    </footer>
  );
}

export default Footer;
