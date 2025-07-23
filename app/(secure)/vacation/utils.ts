export const getTypeLabel = (type: string) => {
  switch (type) {
    case "normal":
      return "Férias";
    case "license":
      return "Licença-Prêmio";
    case "dayOff":
      return "Abonada";
    default:
      return "Tipo Desconhecido";
  }
};
