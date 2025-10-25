import { LogCategory } from "../../types/LogCategory";

const logsMock: Log[] = [
  {
    time: "10:00",
    content: "Se realizó la configuración de VPN para BF VPN Gateway_2.",
    category: LogCategory.INFO,
  },
  {
    time: "10:05",
    content: "Se compró un BF VPN Gateway para Boilplate Corporate HQ (-$400).",
    category: LogCategory.COMPRA,
  },
  {
    time: "10:10",
    content:
      "Hacker malicioso modificó Marketing Roadmap  vía zombie computer en Internet. ",
    category: LogCategory.ATAQUE,
  },
  {
    time: "10:15",
    content:
      "Hacker malicioso modificó Marketing Roadmap  vía zombie computer en Internet. ",
    category: LogCategory.INFO,
  },
  {
    time: "10:15",
    content:
      "Hacker malicioso modificó Marketing Roadmap  vía zombie computer en Internet. ",
    category: LogCategory.INFO,
  },
  {
    time: "10:15",
    content:
      "Hacker malicioso modificó Marketing Roadmap  vía zombie computer en Internet. ",
    category: LogCategory.COMPRA,
  },
];
export default logsMock;
