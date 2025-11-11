import { useState } from "react";
import ComboBox from "../../../common/components/ComboBox";
import styles from "../styles/ModalVPN.module.css";
import { TipoProteccionVPN } from "../../../../types/DeviceEnums";

type OptionItem = { label: string; value: string };

const OPCIONES_LAN_LOCAL = [
    { label: "LAN 1", value: "lan1" },
    { label: "LAN 2", value: "lan2" },
    { label: "LAN 3", value: "lan3" },
]

const HOST_LOCAL_OPCIONES = [
    { label: "PC Local 1", value: "host_local1" },
    { label: "PC Local 2", value: "host_local2" },
    { label: "PC Local 3", value: "host_local3" },
]

const DOMINIO_REMOTO_OPCIONES = [
    { label: "dominio1.com", value: "dominio1.com" },
    { label: "dominio2.com", value: "dominio2.com" },
    { label: "dominio3.com", value: "dominio3.com" },
]

const HOST_REMOTO_OPCIONES = [
    { label: "PC Remota 1", value: "host1" },
    { label: "PC Remota 2", value: "host2" },
    { label: "PC Remota 3", value: "host3" },
]

// No cambiar estos valores, deben coincidir con 
// el enum TipoProteccionVPN
const OPCIONES_PROTECCION = [
    { label: "EA", value: TipoProteccionVPN.EA },
    { label: "A", value: TipoProteccionVPN.A },
    { label: "N", value: TipoProteccionVPN.N },
    { label: "B", value: TipoProteccionVPN.B },
]

export default function ModalVPN() {
  const [lanLocal, setLanLocal] = useState<OptionItem | null>(null);
  const [lanRemota, setLanRemota] = useState<OptionItem | null>(null);
  const [proteccion, setProteccion] = useState<OptionItem | null>(null);
  const [dominioRemoto, setDominioRemoto] = useState<OptionItem | null>(null);
  const [hostRemoto, setHostRemoto] = useState<OptionItem | null>(null);

  return (
    <div className={styles.modalVPNContainer}>

      <h2>Configuración de VPN</h2>
      <div className={styles.formContainer}>
        <div className={styles.primeraParte}>
            <div className={styles.inputGroup} >
            <p className={styles.label}>LAN Local</p>
                <ComboBox 
              items={OPCIONES_LAN_LOCAL} 
              value={lanLocal} 
              onChange={setLanLocal}
              getKey={(item) => item.value}
              getLabel={(item) => item.label}
            />
        </div >
        <div className={styles.inputGroup} >
            <p className={styles.label}>LAN Remota</p>
            <div >
                <ComboBox 
              items={HOST_LOCAL_OPCIONES} 
              value={lanRemota} 
              onChange={setLanRemota}
              getKey={(item) => item.value}
              getLabel={(item) => item.label}
            />
            </div>
        </div>
        </div>
        <div className={styles.segundaParte}>
        <div className={styles.inputGroup} >
            <p className={styles.label}>Proteccion</p>
            <div >
               <ComboBox 
              items={OPCIONES_PROTECCION} 
              placeholder="Protección" 
              value={proteccion} 
              onChange={setProteccion}
              getKey={(item) => item.value}
              getLabel={(item) => item.label}
            />  
            </div>
           
        </div>
        <div className={styles.inputGroup} >
            <p className={styles.label}>Dominio remoto</p>
           <div >
             <ComboBox 
              items={DOMINIO_REMOTO_OPCIONES} 
              placeholder="Dominio remoto" 
              value={dominioRemoto} 
              onChange={setDominioRemoto}
              getKey={(item) => item.value}
              getLabel={(item) => item.label}
            />
           </div>
        </div>
        <div className={styles.inputGroup} >
            <p className={styles.label}>Host remoto</p>
            <div >  
                <ComboBox 
                items={HOST_REMOTO_OPCIONES} 
                placeholder="Host remoto" 
                value={hostRemoto} 
                onChange={setHostRemoto}
                getKey={(item) => item.value}
                getLabel={(item) => item.label}
                />
            </div>
        </div>
        </div>
      </div>
    </div>
  );
}