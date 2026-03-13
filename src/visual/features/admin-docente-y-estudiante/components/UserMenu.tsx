import { useState, useRef, useEffect, type ReactNode } from 'react';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import styles from '../styles/UserMenu.module.css';

export interface UserMenuItem {
    icon: ReactNode;
    label: string;
    onClick: () => void;
}

interface UserMenuProps {
    items?: UserMenuItem[];
}

export default function UserMenu({ items = [] }: UserMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const { logout, getUser } = useAuth();

    const user = getUser();
    const userName = user?.primernombre || user?.nombre_completo || 'Usuario';
    const userEmail = user?.correo_electronico || user?.email || '';
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

    return (
        <div className={styles.container} ref={menuRef}>
            <button
                className={styles.trigger}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Menú de usuario"
            >
                <div className={styles.avatar}>
                    {userInitial}
                </div>
            </button>

            {isOpen && (
                <div className={styles.dropdown}>
                    {userEmail && (
                        <>
                            <span className={styles.email}>{userEmail}</span>
                            <div className={styles.divider} />
                        </>
                    )}

                    {items.map((item, i) => (
                        <button
                            key={i}
                            className={styles.item}
                            onClick={() => { setIsOpen(false); item.onClick(); }}
                        >
                            {item.icon}
                            {item.label}
                        </button>
                    ))}

                    <button style={{ color: "#fd525b" }} className={`${styles.item} ${styles.itemDanger}`} onClick={handleLogout}>
                        <LogOut size={16} />
                        Cerrar sesión
                    </button>
                </div>
            )}
        </div>
    );
}
