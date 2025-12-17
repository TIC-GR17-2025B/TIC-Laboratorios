import { useState, useRef, useEffect } from 'react';
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
                <svg
                    className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <path d="M6 9l6 6 6-6" />
                </svg>
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
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                        Mi Perfil
                    </button>

                    <div className={styles.dropdownDivider} />

                    <button className={styles.dropdownItem} onClick={handleLogout}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        Cerrar Sesión
                    </button>
                </div>
            )}
        </div>
    );
}
