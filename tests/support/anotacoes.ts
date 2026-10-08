import { test } from '@playwright/test';

/** Liga o teste a um bug do docs/bugs.md; aparece no relatório HTML. */
export function marcarBug(id: string, detalhe = '') {
  test.info().annotations.push({ type: 'bug', description: detalhe ? `${id} | ${detalhe}` : id });
}
