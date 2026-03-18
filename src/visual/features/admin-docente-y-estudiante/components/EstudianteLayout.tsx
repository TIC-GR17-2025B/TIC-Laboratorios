import { Outlet, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import AppLogo from '../../../common/components/AppLogo';
import UserMenu from './UserMenu';
import styles from '../styles/DocenteLayout.module.css';
import headerStyles from '../styles/DocenteHeader.module.css';

export default function EstudianteLayout() {
  const navigate = useNavigate();

  return (
    <motion.div
      className={styles.page}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      <header className={headerStyles.topBar}>
        <AppLogo size={32} />
        <UserMenu items={[
          { icon: <User size={16} />, label: 'Mi Perfil', onClick: () => navigate('/perfil') }
        ]} />
      </header>
      <Outlet />
    </motion.div>
  );
}
