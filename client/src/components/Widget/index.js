import React from 'react';
import styles from './Widget.module.scss';

const Widget = ({ children, title }) => (
  <div className={styles.widget}>
    <div className={styles.title}>
      <h4>{title}</h4>
    </div>
    <div className={styles.widgetbody}>
      {children}
    </div>
  </div>
)

export default Widget;
