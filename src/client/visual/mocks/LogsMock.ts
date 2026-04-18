import { LogCategory } from "../../shared/types/LogCategory";

const logsMock: Log[] = [
  {
    time: "10:00",
    content: "Se realizó la configuración de VPN para BF VPN Gateway_2.",
    category: LogCategory.COMPLETADO,
  },
  {
    time: "10:05",
    content: "Se compró un BF VPN Gateway para Boilplate Corporate HQ (-$400).",
    category: LogCategory.INFORMACION,
  },
  {
    time: "10:10",
    content:
      "Hacker malicioso modificó Marketing Roadmap vía zombie computer en Internet.",
    category: LogCategory.ATAQUE,
  },
  {
    time: "10:15",
    content:
      "Se mitigó el ataque a Marketing Roadmap. Ataque mitigado: zombie computer.",
    category: LogCategory.COMPLETADO,
  },
  {
    time: "10:20",
    content:
      "Se detectó tráfico sospechoso en la red. Revisar configuración del firewall.",
    category: LogCategory.ADVERTENCIA,
  },
  {
    time: "10:25",
    content:
      "Firewall bloqueó tráfico no autorizado desde Internet hacia Server_1.",
    category: LogCategory.COMPLETADO,
  },
];
export default logsMock;
