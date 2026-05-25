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
import { useEffect, useState } from "react";
import type { SearchProps, SearchParams } from "./types";
import { defineIsExternal, defineSearchPropsDefault } from "./utils";

export const Search = ({
  handleSearchAction,
  routePrefix,
  enabledProps,
  isExternal,
}: SearchParams) => {
  const [term, setTerm] = useState("");
  const [searchProps, setSearchProps] = useState<SearchProps>(
    defineSearchPropsDefault({ isExternal, time: enabledProps.time }),
  );

  const handleChangeExternality = (externability: boolean) =>
    setSearchProps((prev) => ({ ...prev, external: externability }));

  const handleChangeInternability = (internability: boolean) =>
    setSearchProps((prev) => ({ ...prev, internal: internability }));

  const handleChangeTerm = (newTerm: string) => setTerm(newTerm);

  const handleChangePast = (past: boolean) =>
    setSearchProps((prev) => ({ ...prev, time: { ...prev.time, past } }));
  const handleChangeFuture = (future: boolean) =>
    setSearchProps((prev) => ({ ...prev, time: { ...prev.time, future } }));
  const handleChangeNow = (now: boolean) =>
    setSearchProps((prev) => ({ ...prev, time: { ...prev.time, now } }));

  useEffect(() => {
    handleSearchAction({
      term,
      isExternal: defineIsExternal(searchProps),
      ...searchProps?.time,
    });
  }, [term, searchProps]);

  return (
    <Stack direction="row" spacing={2} justifyContent="end">
      {enabledProps.time?.past && (
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={Boolean(searchProps.time?.past)}
                onChange={(e) => handleChangePast(e.target.checked)}
              />
            }
            slotProps={{ typography: { fontSize: 12 } }}
            label="Passadas?"
          />
        </FormGroup>
      )}
      {enabledProps.time?.future && (
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={Boolean(searchProps.time?.future)}
                onChange={(e) => handleChangeFuture(e.target.checked)}
              />
            }
            slotProps={{ typography: { fontSize: 12 } }}
            label="Futuras?"
          />
        </FormGroup>
      )}
      {enabledProps.time?.now && (
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={Boolean(searchProps.time?.now)}
                onChange={(e) => handleChangeNow(e.target.checked)}
              />
            }
            slotProps={{ typography: { fontSize: 12 } }}
            label="Acontecendo?"
          />
        </FormGroup>
      )}
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
