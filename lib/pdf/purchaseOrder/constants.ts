const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN_X = 50;
const HEADER_HEIGHT = 60; // espaço reservado para o header
const FOOTER_HEIGHT = 40; // espaço reservado para o footer
const SAFE_TOP = PAGE_HEIGHT - HEADER_HEIGHT - 30;
const SAFE_BOTTOM = FOOTER_HEIGHT + 10;
const LINE_HEIGHT = 16;
const SECTION_GAP = 14;
const ITEM_INDENT = 20;

const DEPTS_WITH_NOTE = ['Educação 2', 'Transporte'];
const EDUCACAO_NOTE = `Não esquecer os dizeres do convênio: Convênio SEDUC ...`;
const TRANSPORTE_NOTE = "Converter para valor de R$3,89/BD2 na nota.";

export {
  PAGE_WIDTH,
  PAGE_HEIGHT,
  MARGIN_X,
  HEADER_HEIGHT,
  FOOTER_HEIGHT,
  SAFE_TOP,
  SAFE_BOTTOM,
  LINE_HEIGHT,
  SECTION_GAP,
  ITEM_INDENT,
  EDUCACAO_NOTE,
  TRANSPORTE_NOTE,
  DEPTS_WITH_NOTE
};
