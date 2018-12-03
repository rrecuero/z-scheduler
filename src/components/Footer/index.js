import React from 'react';
import styles from './footer.module.scss';
import logo from './logo-red.png'
import mail from './mail.svg';
import pencil from './pencil.svg';
import twitter from './twitter.svg';
import github from './github.svg';

const Footer = () => (
  <footer className={styles.footer}>
    <div className={styles.brand}>
      <img src={logo} alt="logo" />
      <a href="/" className={styles.link}> Dapis</a>
      <span>
        Created by <a href="https://www.ramonrecuero.com" rel="noopener noreferrer" target="_blank">
        Ramón Recuero</a>
      </span>
    </div>
    <div className={styles.links}>
      <a href="mailto:ramon@dapis.io" target="_blank" rel="noopener noreferrer">
        <img src={mail} alt="email" />
      </a>
      <a href="https://medium.com/@rrecuero/building-dapps-people-want-d133e8904b8" rel="noopener noreferrer" target="_blank">
        <img src={pencil} alt="medium" />
      </a>
      <a href="https://twitter.com/ramonrecuero" rel="noopener noreferrer" target="_blank">
        <img src={twitter} alt="twitter" />
      </a>
      <a href="https://github.com/rrecuero" rel="noopener noreferrer" target="_blank">
        <img src={github} alt="github" />
      </a>
    </div>
  </footer>
)

export default Footer;
