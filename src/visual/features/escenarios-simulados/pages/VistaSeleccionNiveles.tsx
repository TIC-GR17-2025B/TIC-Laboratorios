import LevelSelectionMenuList from "../components/LevelSelectionMenuList";
import Leaderboard from "../components/Leaderboard";
import { useLeaderboard } from "../hooks/useLeaderboard";
import styles from "../styles/VistaSeleccionNiveles.module.css";

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
            <LevelSelectionMenuList />
            <Leaderboard
                entries={entries}
                groupName={groupName}
                loading={loading}
                error={error}
                currentStudentId={idEstudiante}
            />
        </div>
    );
}
