import {
  Computer,
  Handyman,
  MedicalServices,
  LocalGasStation,
  TireRepair,
  EventSeat,
  ElectricCar,
  CarRepair,
  LocalCarWash,
  DirectionsBus,
  Badge,
} from "@mui/icons-material";
import type { SxProps } from "@mui/material";

const iconStyles: SxProps = {
  fontSize: "22px",
  pl: "5px",
  color: "success.main",
};

const roleIconMap = {
  "agente administrativa": Computer,
  "agente administrativo": Computer,
  "agente de serviços 1": Handyman,
  "auxiliar de enfermagem": MedicalServices,
  "auxiliar de frota": LocalGasStation,
  borracheiro: TireRepair,
  "diretor de transporte": EventSeat,
  "eletricista de autos": ElectricCar,
  funileiro: CarRepair,
  lavador: LocalCarWash,
  lubrificador: LocalCarWash,
  mecânico: CarRepair,
  motorista: DirectionsBus,
} as const;

type RoleName = keyof typeof roleIconMap;

export const RoleIcon = ({ role }: { role: string }) => {
  const Icon = roleIconMap[role as RoleName] ?? Badge;
  return <Icon sx={iconStyles} />;
};
