import '../../assets/styles/Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-left">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2849.1122360917707!2d26.049884011824954!3d44.430859901667844!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40b201d02342fff3%3A0xe08b3cde2ed03b06!2sAFI%20Cotroceni!5e0!3m2!1sen!2sro!4v1748708036493!5m2!1sen!2sro"
            width="100%"
            height="200"
            allowFullScreen=""
            loading="lazy"
            style={{ border: 0, borderRadius: "12px" }}
            referrerPolicy="no-referrer-when-downgrade"
            title="Harta Smashly"
          ></iframe>
          <a
            className="footer-address"
            href="https://www.google.com/maps?q=AFI+Cotroceni+Bucuresti"
            target="_blank"
            rel="noopener noreferrer"
          >
            Blvd General Paul Teodorescu 4, AFI Cotroceni, București, Romania
          </a>
        </div>

        <div className="footer-right">
          <p id="footer-title">SMASHLY</p>
          <p id="footer-email">smashly@gmail.com</p>
          <p id="footer-phone">0759 999 999</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} SMASHLY. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
