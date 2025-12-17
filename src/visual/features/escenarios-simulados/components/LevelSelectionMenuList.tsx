import { NivelController } from "../../../../ecs/controllers/NivelController";
import type { EscenarioPreview } from "../../../../types/EscenarioTypes";
import styles from "../styles/VistaSeleccionNiveles.module.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useSelectedLevel } from "../../../common/contexts/SelectedLevelContext";
import type { Escenario } from "../../../../types/EscenarioTypes";

interface Progreso {
    id_progreso: number;
    id_estudiante: number;
    id_escenario: number;
    nombre_escenario: string;
    terminado: boolean;
    tiempo: number | null;
}

export default function LevelSelectionMenuList() {
    const [escenarios, setEscenarios] = useState<EscenarioPreview[]>([]);
    const [progresos, setProgresos] = useState<Progreso[]>([]);
    const navigate = useNavigate();
    const { setSelectedEscenario } = useSelectedLevel();
    const nivelController = new NivelController();

    useEffect(() => {
        const escenariosData = nivelController.getEscenarios();
        if (escenariosData) {
            setEscenarios(escenariosData);
        }

        // Obtener progreso del estudiante
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            const idEstudiante = user.id_estudiante;
            if (idEstudiante) {
                fetch(`/api/progreso/estudiante/${idEstudiante}`)
                    .then(res => res.json())
                    .then(result => {
                        if (result.success && result.data) {
                            setProgresos(result.data);
                        }
                    })
                    .catch(err => console.error('Error al obtener progresos:', err));
            }
        }
    }, []);

    const handleSelectLevel = (escenarioId: number) => {
        const escenarioCompleto = nivelController.cargarEscenario(escenarioId) as Escenario;
        if (escenarioCompleto) {
            setSelectedEscenario(escenarioCompleto);
            navigate('/');
        }
    };

    const isEscenarioCompletado = (escenarioTitulo: string): boolean => {
        // Buscar progresos que coincidan con el escenario
        const progresosEscenario = progresos.filter(p => {
            return p.nombre_escenario === escenarioTitulo ||
                p.nombre_escenario.toLowerCase() === escenarioTitulo.toLowerCase() ||
                p.nombre_escenario.toLowerCase().includes(escenarioTitulo.toLowerCase()) ||
                escenarioTitulo.toLowerCase().includes(p.nombre_escenario.toLowerCase());
        });

        // Está completado si hay al menos un progreso con terminado === true
        return progresosEscenario.some(p => p.terminado);
    };
    return <div className={styles.menuList}>
        {escenarios.map((escenario) => {
            const completado = isEscenarioCompletado(escenario.titulo);

            return (
                <LevelSelectionMenuItem
                    key={escenario.id}
                    escenario={escenario}
                    imagen={escenario.imagenPreview || "https://i.pinimg.com/1200x/53/14/cd/5314cd391bb3df2875d5f9b0d8818586.jpg"}
                    completado={completado}
                    onSelect={() => handleSelectLevel(escenario.id)}
                />
            );
        })}
    </div>
}

interface LevelSelectionMenuItemProps {
    escenario: EscenarioPreview;
    imagen: string;
    completado: boolean;
    onSelect: () => void;
}

function LevelSelectionMenuItem({ escenario, imagen, completado, onSelect }: LevelSelectionMenuItemProps) {
    return <div className={styles.menuItem} onClick={onSelect}>
        <img src={imagen} className={styles.backgroundImage} alt={escenario.titulo} />
        <div className={styles.gradient}></div>
        <div className={styles.content}>
            <h2>{escenario.titulo}</h2>
            <p className={styles.description}>{escenario.descripcion}</p>
            <div className={styles.statusBadge}>
                {completado ? (
                    <span className={styles.locked}>Completado</span>
                ) : (
                    <>
                        <span className={styles.unlocked}>Pendiente</span>
                    </>
                )}
            </div>
        </div>
    </div>
};