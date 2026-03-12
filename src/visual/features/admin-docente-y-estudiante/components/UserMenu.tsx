import { useState, useRef, useEffect } from 'react';
import { ChevronDown, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import styles from '../styles/UserMenu.module.css';

export default function UserMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const { logout, getUser } = useAuth();

    const user = getUser();
    const userName = user?.primernombre || 'Usuario';
    const userInitial = userName.charAt(0).toUpperCase();

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleProfile = () => {
        setIsOpen(false);
        navigate('/perfil');
    };

    return (
        <div className={styles.userMenuContainer} ref={menuRef}>
            <button
                className={styles.userButton}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Menú de usuario"
            >
                <div className={styles.avatar}>
                    {userInitial}
                </div>
                <span className={styles.userName}>{userName}</span>
                <ChevronDown
                    size={16}
                    className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
                />
            </button>

            {isOpen && (
                <div className={styles.dropdown}>
                    <div className={styles.dropdownHeader}>
                        <div className={styles.avatarLarge}>
                            {userInitial}
                        </div>
                        <div className={styles.userInfo}>
                            <span className={styles.userNameLarge}>
                                {user?.primernombre} {user?.primer_apellido}
                            </span>
                            <span className={styles.userEmail}>
                                {user?.correo_electronico}
                            </span>
                        </div>
                    </div>

                    <div className={styles.dropdownDivider} />

                    <button className={styles.dropdownItem} onClick={handleProfile}>
                        <User size={18} />
                        Mi Perfil
                    </button>

                    <div className={styles.dropdownDivider} />

                    <button className={styles.dropdownItem} onClick={handleLogout}>
                        <LogOut size={18} />
                        Cerrar Sesión
                    </button>
                </div>
            )}
        </div>
    );
}
