import type { SearchProps } from "./types";

export const defineSearchPropsDefault = (isExternal?: boolean): SearchProps => {
  const searchProps: SearchProps = {
    external: false,
    internal: false,
    active: true,
  };

  if (isExternal === null || isExternal === undefined) return searchProps;

  if (isExternal === false) searchProps.internal = true;
  else searchProps.external = true;

  return searchProps;
};

export const defineIsExternal = ({
  internal,
  external,
}: SearchProps): boolean | undefined => {
  let isExternal: boolean | undefined;
  
  if ((internal && external) || (!internal && !external))
    isExternal = undefined;
  else if (internal && !external) isExternal = false;
  else if (!internal && external) isExternal = true;
  
  return isExternal;
};

export const parseBool = (str?: string | null): boolean | undefined => {
  if (str === "false") return false;
  if (str === "true") return true;
  return undefined;
};
