import LevelSelectionMenuList from "../components/LevelSelectionMenuList";
import Leaderboard from "../components/Leaderboard";
import { useLeaderboard } from "../hooks/useLeaderboard";
import styles from "../styles/VistaSeleccionNiveles.module.css";
import AgentMalvadoUI from "../../agent-malvado/presentation/components/AgentMalvadoUI";

function getStudentId(): number | null {
    try {
        const userStr = localStorage.getItem("user");
        if (!userStr) return null;
        const user = JSON.parse(userStr);
        return user.id_estudiante ?? null;
    } catch {
        return null;
    }
}

export default function VistaSeleccionNiveles() {
    const idEstudiante = getStudentId();
    const { entries, groupName, loading, error } = useLeaderboard(idEstudiante);

    return (
        <div className={styles.main}>
            <div className={styles.path}>
                <LevelSelectionMenuList />
            </div>
            <div className={styles.sidebar}>
                <Leaderboard
                    entries={entries}
                    groupName={groupName}
                    loading={loading}
                    error={error}
                    currentStudentId={idEstudiante}
                />
                <AgentMalvadoUI />
            </div>
        </div>
    );
}
