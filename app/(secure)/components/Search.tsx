"use client";

import { translateEntityKey } from "@/app/translate";
import {
  Checkbox,
  FormControlLabel,
  FormGroup,
  InputAdornment,
  Stack,
  TextField,
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import type { EntityType } from "@/app/types";
import { useEffect, useState } from "react";
import type { SearchProps } from "./types";
import { defineIsExternal, defineSearchPropsDefault } from "./utils";

export const Search = ({
  handleSearch,
  routePrefix,
  enabledProps,
  isExternal,
}: {
  handleSearch: (term: string, isExternal?: boolean) => void;
  routePrefix: EntityType;
  enabledProps: SearchProps;
  isExternal?: boolean;
}) => {
  const [term, setTerm] = useState("");
  const [searchProps, setSearchProps] = useState<SearchProps>(
    defineSearchPropsDefault(isExternal)
  );

  const handleChangeExternality = (externability: boolean) =>
    setSearchProps((prev) => ({ ...prev, external: externability }));

  const handleChangeInternability = (internability: boolean) =>
    setSearchProps((prev) => ({ ...prev, internal: internability }));

  const handleChangeTerm = (newTerm: string) => setTerm(newTerm);

  useEffect(() => {
    handleSearch(term, defineIsExternal(searchProps));
  }, [term, searchProps]);

  return (
    <Stack direction="row" spacing={2} justifyContent="end">
      {enabledProps.external && (
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={searchProps.external}
                onChange={(e) => handleChangeExternality(e.target.checked)}
              />
            }
            slotProps={{ typography: { fontSize: 12 } }}
            label="Externo?"
          />
        </FormGroup>
      )}

      {enabledProps.internal && (
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={searchProps.internal}
                onChange={(e) => handleChangeInternability(e.target.checked)}
              />
            }
            slotProps={{ typography: { fontSize: 12 } }}
            label="Interno?"
          />
        </FormGroup>
      )}

      {enabledProps.active && (
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={searchProps.active}
                onChange={() => undefined}
                disabled
              />
            }
            slotProps={{ typography: { fontSize: 12 } }}
            label="Ativo?"
          />
        </FormGroup>
      )}

      <FormGroup>
        <TextField
          size="small"
          value={term}
          onChange={(e) => handleChangeTerm(e.target.value)}
          sx={{ pb: 2, alignSelf: "right" }}
          placeholder={`Buscar um(a) ${translateEntityKey({
            entity: routePrefix,
            key: "translated",
          })}`}
          fullWidth
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="primary" />
                </InputAdornment>
              ),
            },
          }}
        />
      </FormGroup>
    </Stack>
  );
};
