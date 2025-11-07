import ComputadoraIcon from '../../../common/icons/ComputadoraIcon';
import { RouterIcon } from '../../../common/icons/RouterIcon';
import ServidorIcon from '../../../common/icons/ServidorIcon';
import styles from '../styles/VistaTopologica.module.css';
import { TipoDispositivo } from "../../../../types/DeviceEnums";

function ZonaTopologia({children, nombre}: {children: React.ReactNode, nombre: string}) {
    return <div>
        <div className={styles.zonaTopologiaNombre}>{nombre}</div>
        <div className={styles.zonaTopologia}>
            {children}
        </div>
    </div>
}
function getIconoNodo(option : string) {
    switch(option){
        case TipoDispositivo.WORKSTATION:
            return <ComputadoraIcon size={16} />;
        case TipoDispositivo.SERVER:
            return <ServidorIcon size={16} />;
        case TipoDispositivo.ROUTER:
            return <RouterIcon size={16} />;
        case "Internet":
            return <RouterIcon size={16} />;
        default:
            return null;
    }
}

function NodoTopologia({nombre, tipo, conectado = false}: {nombre: string, tipo: string, conectado?: boolean}) {
    return <div className={styles.contenedorNodo}>
        <div className={styles.nodo}>
        {getIconoNodo(tipo)}
        {conectado ? <div className={styles.indicadorConectado} /> : null}
        </div>
        <div className={styles.nombreNodo}>
            {nombre}
        </div>
    </div>
}

const topologiaPrueba = {
    zonas: [
        {
            nombre: "Zona 1",
            nodos: [
                { nombre: "Nodo 1", tipo: TipoDispositivo.WORKSTATION, conectado: true },
                { nombre: "Nodo 2", tipo: TipoDispositivo.SERVER, conectado: true }
            ]
        },
        {
            nombre: "Zona 2",
            nodos: [
                { nombre: "Nodo 3", tipo: TipoDispositivo.ROUTER, conectado: true }
            ]
        }
    ],
    internet: [
        { nombre: "Internet", tipo: "Internet" as const, conectado: true },
        { nombre: "Internet", tipo: "Internet" as const, conectado: true }
    ]
};

export default function VistaTopologica() {
    return <div className={styles.vistaTopologica}>
       <div className={styles.zonas}>
        {topologiaPrueba.zonas.map((zona, index) => (
            <ZonaTopologia key={index} nombre={zona.nombre}>
                {zona.nodos.map((nodo, nodoIndex) => (
                    <NodoTopologia 
                        key={nodoIndex}
                        nombre={nodo.nombre} 
                        tipo={nodo.tipo} 
                        conectado={nodo.conectado} 
                    />
                ))}
            </ZonaTopologia>
        ))}
       </div>
       <div className={styles.internet}>
        {topologiaPrueba.internet.map((nodo, index) => (
            <div key={index}>
                <NodoTopologia 
                    nombre={nodo.nombre} 
                    tipo={nodo.tipo} 
                    conectado={nodo.conectado} 
                />
            </div>
        ))}
       </div>
    </div>
}
