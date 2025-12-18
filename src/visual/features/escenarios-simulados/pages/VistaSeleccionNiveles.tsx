import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../admin-docente-y-estudiante/hooks/useAuth";
import ModalUnirseGrupo from "../../admin-docente-y-estudiante/components/ModalUnirseGrupo";
import LevelSelectionMenuList from "../components/LevelSelectionMenuList";
import styles from "../styles/VistaSeleccionNiveles.module.css";
import { API_BASE_URL } from "../../../common/utils/apiConfig";

const API_URL = API_BASE_URL;

export default function VistaSeleccionNiveles() {
    const navigate = useNavigate();
    const { logout, getUser, getUserRole } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const user = getUser();
    const role = getUserRole();
    const idEstudiante = role === 'estudiante' && user ? (user as { id_estudiante: number }).id_estudiante : null;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleJoinGroup = async (codigo: string): Promise<{ success: boolean; error?: string }> => {
        if (!idEstudiante) {
            return { success: false, error: 'No se pudo identificar al estudiante' };
        }

        try {
            const response = await fetch(`${API_URL}/groups/join`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ codigo_acceso: codigo, id_estudiante: idEstudiante }),
            });

            if (!response.ok) {
                const result = await response.json();
                const errorMessage = result.error || 'Error al unirse al grupo';

                // Mensajes específicos según el error
                if (errorMessage.includes('ya está matriculado') || errorMessage.includes('ya pertenece')) {
                    return { success: false, error: 'Ya perteneces a este grupo' };
                } else if (errorMessage.includes('código') || errorMessage.includes('no encontrado')) {
                    return { success: false, error: 'Código inválido o grupo no encontrado' };
                } else if (errorMessage.includes('expirado')) {
                    return { success: false, error: 'El código de invitación ha expirado' };
                }

                return { success: false, error: errorMessage };
            }

            return { success: true };
        } catch {
            return { success: false, error: 'Error de conexión. Inténtalo nuevamente' };
        }
    };

    return <div className={styles.container}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h1>Selección de Escenarios</h1>
            <div style={{ display: "flex", gap: "0.75rem" }}>
                <button
                    style={{ display: "flex", alignItems: "center", gap: "0.5rem", border: "1px solid var(--border-primary)" }}
                    onClick={() => setIsModalOpen(true)}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 12.75c1.63 0 3.07.39 4.24.9 1.08.48 1.76 1.56 1.76 2.73V18H6v-1.61c0-1.18.68-2.26 1.76-2.73 1.17-.52 2.61-.91 4.24-.91zM4 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm1.13 1.1c-.37-.06-.74-.1-1.13-.1-.99 0-1.93.21-2.78.58A2.01 2.01 0 000 16.43V18h4.5v-1.61c0-.83.23-1.61.63-2.29zM20 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm4 3.43c0-.81-.48-1.53-1.22-1.85-.85-.37-1.79-.58-2.78-.58-.39 0-.76.04-1.13.1.4.68.63 1.46.63 2.29V18H24v-1.57zM12 6c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z" />
                    </svg>
                    Unirse a Grupo
                </button>
                <button style={{ display: "flex", alignItems: "center", gap: "0.5rem", border: "1px solid var(--border-primary)" }} onClick={handleLogout}>
                    Cerrar sesión
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1">
                        <path d="M10 8V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2v-2" /><path d="M15 12H3l3-3m0 6l-3-3" /></g></svg>
                </button>
            </div>
        </div>
        <LevelSelectionMenuList />

        <ModalUnirseGrupo
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onJoin={handleJoinGroup}
        />
    </div>
}