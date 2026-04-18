import AppLogo from '../../../common/components/AppLogo';
import UserMenu from './UserMenu';
import styles from '../styles/DocenteHeader.module.css';

export default function DocenteHeader() {
  return (
    <header className={styles.topBar}>
      <AppLogo size={32} />
      <UserMenu />
    </header>
  );
}
