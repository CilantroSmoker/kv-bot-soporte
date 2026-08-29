import { Mail, MessageCircle, ExternalLink } from 'lucide-react'; 
import styles from '../styles/Footer.module.css'; 
import { Link } from 'react-router-dom'; 

export default function Footer() { 
  const currentYear = new Date().getFullYear(); 

  return ( 
    <footer className={styles.footer}> 
      <div className={styles.footerContent}> 
        {/* Sección Principal */} 
        <div className={styles.footerMain}> 
          <div className={styles.footerBrand}> 
            <h3>Koshi Village</h3> 
            <p>Tienda oficial del servidor Minecraft</p> 
          </div> 

          {/* Links Legales */} 
          <div className={styles.footerSection}> 
            <h4>Legal</h4> 
            <ul> 
              <li> 
                <Link to="/terms" className={styles.footerLink}> 
                  Términos y Condiciones 
                </Link> 
              </li> 
              <li> 
                <Link to="/privacy" className={styles.footerLink}> 
                  Política de Privacidad 
                </Link> 
              </li> 
              <li> 
                <a href="mailto:koshivillage@gmail.com" className={styles.footerLink}> 
                  <Mail size={14} /> 
                  Soporte 
                </a> 
              </li> 
            </ul> 
          </div> 

          {/* Community */} 
          <div className={styles.footerSection}> 
            <h4>Comunidad</h4> 
            <ul> 
              <li> 
                <a href="https://discord.gg/H4PjDACv7D" className={styles.footerLink} target="_blank" rel="noopener noreferrer"> 
                  <MessageCircle size={14} /> 
                  Discord 
                </a> 
              </li> 
              <li> 
                <a href="#" className={styles.footerLink} target="_blank" rel="noopener noreferrer"> 
                  <ExternalLink size={14} /> 
                  Web Principal 
                </a> 
              </li> 
              <li> 
                <a href="mailtokoshivillage@gmial.com:soporte@dreamsgamers.net" className={styles.footerLink}> 
                  Contacto 
                </a> 
              </li> 
            </ul> 
          </div> 
        </div> 

        {/* Divider */} 
        <div className={styles.footerDivider}></div> 

        {/* Copyright */} 
        <div className={styles.footerBottom}> 
          <p className={styles.copyright}> 
            © {currentYear} Koshi Village. All rights reserved. 
          </p> 
          <p className={styles.disclaimer}> 
            Minecraft es una marca registrada de Mojang Studios. 
          </p> 
        </div> 
      </div> 
    </footer> 
  ); 
}
