import React from 'react';
import styles from './screen.module.scss';

const Screen = ({ children }) => (
  <div className={styles.screen}>
    {children}
  </div>
)

export default Screen;
