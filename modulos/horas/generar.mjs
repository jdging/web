#!/usr/bin/env node
/**
 * generar.mjs — Estimador de horas de trabajo a partir del git log.
 *
 * SOLO LECTURA del repo: lee `git log`, agrupa commits en sesiones de trabajo,
 * estima horas por tarea (commit) y escribe `horas/data.js` (consumido por index.html).
 *
 * Logica de estimacion (ver horas/README.md):
 *  - Cuenta commits de TODAS las ramas configuradas (main + v2), deduplicados por hash.
 *  - Commits ordenados del mas viejo al mas nuevo, --no-merges, desde la fecha de config.
 *  - Horas de un commit = tiempo desde el commit anterior, SI ese hueco <= umbralMin.
 *  - Si el hueco > umbralMin (o es el primero) => sesion nueva, horas = rampUpMin (arranque).
 *  - Los commits en `excluidos` (ajustes.json) se sacan ANTES de agrupar (la X del dashboard).
 *
 * Uso CLI:  node horas/generar.mjs
 * Uso modulo:  import { generar } from './generar.mjs'  (lo usa servidor.mjs)
 */

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const DIR = dirname(fileURLToPath(import.meta.url));
const US = '\x1f';
const RS = '\x1e';

export function leerConfig() {
  return JSON.parse(readFileSync(join(DIR, 'config.json'), 'utf8'));
}

export function leerAjustes() {
  const ajustes = { excluidos: [], overrides: {}, extra: [] };
  const p = join(DIR, 'ajustes.json');
  if (existsSync(p)) {
    try {
      const raw = JSON.parse(readFileSync(p, 'utf8'));
      ajustes.excluidos = Array.isArray(raw.excluidos) ? raw.excluidos : [];
      ajustes.overrides = raw.overrides || {};
      ajustes.extra = Array.isArray(raw.extra) ? raw.extra : [];
    } catch (e) {
      console.warn('[horas] ajustes.json invalido, se ignora:', e.message);
    }
  }
  return ajustes;
}

export function guardarAjustes(ajustes) {
  const out = {
    _ayuda:
      "Correcciones manuales sobre la estimacion automatica. La X del dashboard y el alta manual escriben aca solos (con el server). Tambien podes editar a mano y correr 'node horas/generar.mjs'.",
    excluidos: ajustes.excluidos || [],
    overrides: ajustes.overrides || {},
    extra: ajustes.extra || [],
  };
  writeFileSync(join(DIR, 'ajustes.json'), JSON.stringify(out, null, 2) + '\n', 'utf8');
}

export function generar() {
  const cfg = leerConfig();
  const ajustes = leerAjustes();
  const umbralMs = cfg.umbralMin * 60_000;
  const rampUpH = cfg.rampUpMin / 60;
  const desdeDate = new Date(cfg.desde.replace(' ', 'T'));
  const ramas = Array.isArray(cfg.ramas) ? cfg.ramas : [cfg.rama || 'v2'];
  const excluidosSet = new Set(ajustes.excluidos);

  // ── leer git log (union de ramas, deduplicado por hash) ──
  const fmt = `%H${US}%aI${US}%an${US}%s${RS}`;
  let salida;
  try {
    salida = execSync(
      `git log --no-merges --since="${cfg.desde}" ${ramas.join(' ')} --pretty=format:"${fmt}"`,
      { cwd: join(DIR, '..'), encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 }
    );
  } catch (e) {
    throw new Error('no se pudo leer git log: ' + e.message);
  }

  let commits = salida
    .split(RS)
    .map((r) => r.trim())
    .filter(Boolean)
    .map((r) => {
      const [hash, fechaIso, autor, mensaje] = r.split(US);
      return { hash, hashCorto: hash.slice(0, 7), fecha: new Date(fechaIso), autor, mensaje };
    })
    .filter((c) => c.fecha >= desdeDate)
    .sort((a, b) => a.fecha - b.fecha);

  // ── separar excluidos (la X) ──
  const esExcluido = (c) => excluidosSet.has(c.hash) || excluidosSet.has(c.hashCorto);
  const excluidosOut = commits.filter(esExcluido).map((c) => ({
    hash: c.hashCorto,
    fechaHora: c.fecha.toISOString(),
    mensaje: c.mensaje,
  }));
  commits = commits.filter((c) => !esExcluido(c));

  // ── overrides de texto ──
  const ovDe = (c) => ajustes.overrides[c.hash] || ajustes.overrides[c.hashCorto];
  for (const c of commits) {
    const ov = ovDe(c);
    if (ov && typeof ov.tarea === 'string' && ov.tarea.trim()) c.mensaje = ov.tarea.trim();
  }

  // ── clustering en sesiones + horas por tarea ──
  const sesiones = [];
  let sesion = null;
  let prev = null;
  for (const c of commits) {
    const gap = prev ? c.fecha - prev.fecha : Infinity;
    let horas;
    if (gap <= umbralMs) {
      horas = gap / 3_600_000;
    } else {
      horas = rampUpH;
      sesion = { inicio: c.fecha, fin: c.fecha, tareas: [] };
      sesiones.push(sesion);
    }
    const ov = ovDe(c);
    if (ov && typeof ov.horas === 'number') horas = ov.horas;
    c.horas = horas;
    c.tipo = ov ? 'ajustado' : 'commit';
    sesion.tareas.push(c);
    sesion.fin = c.fecha;
    prev = c;
  }

  // ── horas "extra" (trabajo sin commit) ──
  for (const ex of ajustes.extra) {
    if (ex.incluir === false) continue;
    if (typeof ex.horas !== 'number' || ex.horas <= 0) continue;
    const fechaEx = new Date((ex.fecha || cfg.desde).replace(' ', 'T'));
    let destino = sesiones.find((s) => fmtDia(s.inicio) === fmtDia(fechaEx));
    if (!destino) {
      destino = { inicio: fechaEx, fin: fechaEx, tareas: [] };
      sesiones.push(destino);
    }
    destino.tareas.push({
      hash: '', hashCorto: 'manual', fecha: fechaEx, autor: '', tipo: 'extra',
      mensaje: ex.tarea || 'Trabajo sin commit', horas: ex.horas, id: ex.id || '',
    });
  }
  sesiones.sort((a, b) => a.inicio - b.inicio);

  // ── serializar ──
  const round = (n) => Math.round(n * 100) / 100;
  const sesionesOut = sesiones.map((s) => {
    const tareas = s.tareas
      .slice()
      .sort((a, b) => a.fecha - b.fecha)
      .map((t) => ({
        hash: t.hashCorto,
        fechaHora: t.fecha.toISOString(),
        horas: round(t.horas),
        mensaje: t.mensaje,
        tipo: t.tipo,
        id: t.id || '',
      }));
    const horas = tareas.reduce((acc, t) => acc + t.horas, 0);
    return { inicio: s.inicio.toISOString(), fin: s.fin.toISOString(), horas: round(horas), tareas };
  });

  const totalHoras = sesionesOut.reduce((acc, s) => acc + s.horas, 0);
  const totalTareas = sesionesOut.reduce((acc, s) => acc + s.tareas.length, 0);

  const data = {
    generadoEn: new Date().toISOString(),
    config: {
      tarifaUsd: cfg.tarifaUsd,
      moneda: cfg.moneda,
      ramas,
      desde: cfg.desde,
      umbralMin: cfg.umbralMin,
      rampUpMin: cfg.rampUpMin,
    },
    totales: {
      horas: round(totalHoras),
      tareas: totalTareas,
      sesiones: sesionesOut.length,
      usd: round(totalHoras * cfg.tarifaUsd),
      excluidos: excluidosOut.length,
    },
    sesiones: sesionesOut,
    excluidos: excluidosOut,
  };

  const banner =
    '// ARCHIVO GENERADO por horas/generar.mjs — NO editar a mano.\n' +
    '// Para corregir horas, excluir commits o sumar trabajo sin commit, edita horas/ajustes.json\n' +
    '// (o usa la X / "agregar" del dashboard con el server corriendo).\n';
  writeFileSync(
    join(DIR, 'data.js'),
    banner + 'window.HORAS_DATA = ' + JSON.stringify(data, null, 2) + ';\n',
    'utf8'
  );
  return data;
}

function fmtDia(d) {
  return d.toISOString().slice(0, 10);
}

// ── ejecutar si se corre directo (CLI) ──
const esMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (esMain) {
  try {
    const d = generar();
    console.log(
      `[horas] OK — ${d.totales.sesiones} sesiones, ${d.totales.tareas} tareas, ` +
        `${d.totales.horas} h, US$ ${d.totales.usd} (tarifa US$${d.config.tarifaUsd}/h)` +
        (d.totales.excluidos ? `, ${d.totales.excluidos} excluidos` : '')
    );
  } catch (e) {
    console.error('[horas] ' + e.message);
    process.exit(1);
  }
}
