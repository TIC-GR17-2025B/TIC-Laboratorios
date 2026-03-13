import { Outlet } from 'react-router';
import DocenteHeader from './DocenteHeader';
import styles from '../styles/DocenteLayout.module.css';

export default function DocenteLayout() {
  return (
    <div className={styles.page}>
      <DocenteHeader />
      <Outlet />
    </div>
  );
}
