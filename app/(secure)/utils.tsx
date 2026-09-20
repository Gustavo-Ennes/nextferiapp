import { dissoc, isEmpty, prop, uniqBy } from "ramda";
import type { Entity } from "../types";
import type { FetchAllParam, LocalStorageData, SearchParams } from "./types";
import type { RowFlag, ListPageRowFlags } from "./components/types";
import type { BossDTO, DepartmentDTO, FuelingBatchDTO, WorkerDTO } from "@/dto";
import { capitalizeFirstLetter, capitalizeName } from "../utils";
import { PersonPin } from "@mui/icons-material";
import { prepareFuelingBatchPayload } from "./fuelingBatch/utils";

export const deleteFuelingBatch = async (id: string) => {
  const url = `/api/fuelingBatch/${id}`;
  const res = await fetch(url, {
    method: "delete",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const { data: fuelingBatch } = await res.json();

  return fuelingBatch;
};

export const updateFuelingBatch = async (
  payload: FuelingBatchDTO,
): Promise<FuelingBatchDTO> => {
  const url = `/api/fuelingBatch/${payload._id}`;
  const preparedPayload = prepareFuelingBatchPayload(payload);
  const res = await fetch(url, {
    method: "put",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ payload: preparedPayload }),
  });
  const { data: batch } = (await res.json()) as { data: FuelingBatchDTO };

  return batch;
};

export const createFuelingBatch = async (
  payload: Omit<FuelingBatchDTO, "_id" | "createdAt" | "updatedAt">,
): Promise<FuelingBatchDTO> => {
  const url = `/api/fuelingBatch`;
  const preparedPayload = prepareFuelingBatchPayload(payload);
  const res = await fetch(url, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ payload: preparedPayload }),
  });
  const { data: batch } = (await res.json()) as { data: FuelingBatchDTO };

  return batch;
};

// FD: Form Data
export const fetchAll = async <E extends Entity, FD>(
  params: FetchAllParam<E, FD>,
): Promise<E[]> => {
  const entities: E[] = [];
  const { repository, entityType, ...otherParams } = params;

  let pageNumber = otherParams?.page ?? 1;
  let hasNext = false;

  try {
    do {
      const { data: entityPageResults, hasNextPage } = await repository.find({
        ...otherParams,
        page: pageNumber++,
      });

      entities.push(...entityPageResults);
      hasNext = hasNextPage;
    } while (hasNext);
  } catch (err: unknown) {
    console.error(
      `Erro at fetching all for ${entityType}: ${(err as Error).message}.`,
    );
  }

  return uniqBy(prop("_id"), entities);
};

export const concatSearchParams = ({
  baseUrl,
  params,
}: {
  baseUrl: string;
  params?: SearchParams;
}): string => {
  if (params && !isEmpty(params)) {
    const spreadedTimeParams = params?.time
      ? { ...dissoc("time", params), ...params.time }
      : params;
    const url = "?".concat(
      Object.entries(spreadedTimeParams)
        .map(
          ([key, value]) =>
            `${key}=${
              key === "to" || key === "from"
                ? (value as Date).toISOString()
                : value
            }`,
        )
        .join("&"),
    );

    return baseUrl.concat(url);
  }
  return baseUrl;
};

export const limitText = (text: string): string =>
  text.length < 25 ? text : `${text.slice(0, 22)}...`;

export const getWorkersInCharge = ({
  bosses,
  departments,
}: {
  bosses: BossDTO[];
  departments: DepartmentDTO[];
}): ListPageRowFlags => {
  const returnMap: ListPageRowFlags = new Map<string, RowFlag[]>();
  const workerHeadsXDepartments = new Map<string, DepartmentDTO[]>();
  const icon = <PersonPin color="primary" />;

  departments.forEach((department) => {
    const { _id, responsible, name } = department;
    const castedWorker = bosses.find(
      (b) => b._id === (responsible as BossDTO)._id,
    )?.worker as WorkerDTO;
    const departmentName = capitalizeName(name.toLowerCase());

    if (!castedWorker)
      throw new Error(
        `None active worker is heading department ${departmentName}(department._id = ${_id})`,
      );

    const workerName = capitalizeName(castedWorker.name.toLowerCase());

    if (returnMap.has(castedWorker._id)) {
      const workerDepartments = Array.from(
        workerHeadsXDepartments.get(castedWorker._id)?.values() ?? [],
      );
      const dept1Name = capitalizeFirstLetter(
        workerDepartments[0].name.toLowerCase(),
      );
      const dept2Name = workerDepartments[1]
        ? capitalizeFirstLetter(workerDepartments[1].name.toLowerCase())
        : "";
      const dept3Name = workerDepartments[2]
        ? capitalizeFirstLetter(workerDepartments[2].name.toLowerCase())
        : "";

      const message = dept3Name
        ? `Servidor chefia ${workerDepartments.length} departamentos, incluindo ${dept1Name}, ${dept2Name} e ${dept3Name}.`
        : `Servidor chefia ${workerDepartments.length} departamentos, incluindo ${dept1Name}${dept2Name ? ` e ${dept2Name}` : ""}.`;

      returnMap.set(castedWorker._id, [
        {
          icon,
          message,
        },
      ]);
      workerHeadsXDepartments.set(castedWorker._id, [
        ...workerDepartments,
        department,
      ]);
      return;
    } else {
      const message = `${workerName} chefia o departamento de ${departmentName}`;

      workerHeadsXDepartments.set(castedWorker._id, [department]);
      returnMap.set(castedWorker._id, [{ icon, message }]);
    }
  });

  return returnMap;
};

export const setLocalStorageData = ({
  data,
  dispatch,
}: {
  data: LocalStorageData;
  dispatch?: boolean;
}) => {
  localStorage.setItem("pfdDataUpdate", JSON.stringify(data));
  if (dispatch) dispatchEvent(new Event("pfdDataUpdate"));
};

export const getLocalStorageData = async (): Promise<LocalStorageData> => {
  const rawData = localStorage.getItem("pfdDataUpdate") as string;
  const emptyData: LocalStorageData = {
    pdfData: { items: [], opened: false },
  };
  const data: LocalStorageData = rawData
    ? await JSON.parse(rawData)
    : emptyData;
  return data;
};

// USE TO GENERATE RANDOM DATA(config in mock.ts)
// (ERASE LOCALHOST TO GENERATE NEW MOCKED DATA)
// const mockedData = mockedTabsData();
// const localData = rawData
//   ? await JSON.parse(rawData)
//   : {
//       data: mockedData,
//       activeTab: Math.floor(Math.random() * mockedData.length),
//       pdfData: {
//         items: [{ data: mockedData, type: "fuelingBatch" }],
//         opened: false,
//       },
//     };

// return localData;
