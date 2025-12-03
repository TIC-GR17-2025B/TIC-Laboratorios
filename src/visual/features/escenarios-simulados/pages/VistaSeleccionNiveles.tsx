import { useNavigate } from "react-router";
import { useAuth } from "../../admin-docente-y-estudiante/hooks/useAuth";
import LevelSelectionMenuList from "../components/LevelSelectionMenuList";
import styles from "../styles/VistaSeleccionNiveles.module.css";

export default function VistaSeleccionNiveles() {
    const navigate = useNavigate();

    const { logout } = useAuth();
    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    return <div className={styles.container}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h1>Selección de Escenarios</h1>
            <button style={{ display: "flex", alignItems: "center", gap: "0.5rem", border: "1px solid var(--border-primary)" }} onClick={handleLogout}>
                Cerrar sesión
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1">
                    <path d="M10 8V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2v-2" /><path d="M15 12H3l3-3m0 6l-3-3" /></g></svg>
            </button>
        </div>
        <LevelSelectionMenuList />
    </div>
}