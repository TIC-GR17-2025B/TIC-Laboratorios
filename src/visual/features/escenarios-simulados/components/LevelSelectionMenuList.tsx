import { NivelController } from "../../../../ecs/controllers/NivelController";
import type { EscenarioPreview } from "../../../../types/EscenarioTypes";
import styles from "../styles/VistaSeleccionNiveles.module.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useSelectedLevel } from "../../../common/contexts/SelectedLevelContext";
import type { Escenario } from "../../../../types/EscenarioTypes";

export default function LevelSelectionMenuList() {
    const [escenarios, setEscenarios] = useState<EscenarioPreview[]>([]);
    const navigate = useNavigate();
    const { setSelectedEscenario } = useSelectedLevel();
    const nivelController = new NivelController();

    useEffect(() => {
        const escenariosData = nivelController.getEscenarios();
        if (escenariosData) {
            setEscenarios(escenariosData);
        }
    }, []);

    const handleSelectLevel = (escenarioId: number) => {
        const escenarioCompleto = nivelController.cargarEscenario(escenarioId) as Escenario;
        if (escenarioCompleto) {
            setSelectedEscenario(escenarioCompleto);
            navigate('/');
        }
    };

    return <div className={styles.menuList}>
        {escenarios.map((escenario) => (
            <LevelSelectionMenuItem 
                key={escenario.id}
                escenario={escenario}
                imagen={escenario.imagenPreview || "https://i.pinimg.com/1200x/53/14/cd/5314cd391bb3df2875d5f9b0d8818586.jpg"}
                completado={false}
                onSelect={() => handleSelectLevel(escenario.id)}
            />
        ))}
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