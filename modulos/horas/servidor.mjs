#!/usr/bin/env node
/**
 * servidor.mjs — Server local del dashboard de horas.
 *
 * Sirve horas/ en http://localhost:PUERTO y expone una API para que la X (excluir)
 * y el alta manual escriban en ajustes.json y regeneren data.js al instante.
 * Solo escucha en 127.0.0.1 (no se expone a la red). NO se deploya.
 *
 * Uso:  node horas/servidor.mjs
 */

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname, normalize } from 'node:path';
import { generar, leerAjustes, guardarAjustes, leerConfig } from './generar.mjs';

const DIR = dirname(fileURLToPath(import.meta.url));
const cfg = leerConfig();
const PORT = cfg.puerto || 8765;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
};

function json(res, code, obj) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(obj));
}

function leerBody(req) {
  return new Promise((resolve) => {
    let b = '';
    req.on('data', (c) => (b += c));
    req.on('end', () => {
      try { resolve(b ? JSON.parse(b) : {}); } catch { resolve({}); }
    });
  });
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://localhost:${PORT}`);

    // ── API ──
    if (url.pathname.startsWith('/api/')) {
      if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'usar POST' });
      const body = await leerBody(req);
      const ajustes = leerAjustes();

      if (url.pathname === '/api/excluir') {
        const h = String(body.hash || '').trim();
        if (!h) return json(res, 400, { ok: false, error: 'falta hash' });
        if (!ajustes.excluidos.includes(h)) ajustes.excluidos.push(h);
        guardarAjustes(ajustes);
        return json(res, 200, { ok: true, data: generar() });
      }

      if (url.pathname === '/api/incluir') {
        const h = String(body.hash || '').trim();
        ajustes.excluidos = ajustes.excluidos.filter((x) => x !== h && x.slice(0, 7) !== h && h.slice(0, 7) !== x);
        guardarAjustes(ajustes);
        return json(res, 200, { ok: true, data: generar() });
      }

      if (url.pathname === '/api/agregar') {
        const horas = parseFloat(body.horas);
        const tarea = String(body.tarea || '').trim();
        const fecha = String(body.fecha || '').trim() || new Date().toISOString().slice(0, 10);
        if (!(horas > 0)) return json(res, 400, { ok: false, error: 'horas debe ser > 0' });
        if (!tarea) return json(res, 400, { ok: false, error: 'falta la descripcion' });
        ajustes.extra.push({ id: 'm' + Date.now(), fecha, tarea, horas, incluir: true });
        guardarAjustes(ajustes);
        return json(res, 200, { ok: true, data: generar() });
      }

      if (url.pathname === '/api/borrar-extra') {
        const id = String(body.id || '');
        ajustes.extra = ajustes.extra.filter((e) => (e.id || '') !== id);
        guardarAjustes(ajustes);
        return json(res, 200, { ok: true, data: generar() });
      }

      if (url.pathname === '/api/ping') return json(res, 200, { ok: true });
      return json(res, 404, { ok: false, error: 'ruta desconocida' });
    }

    // ── estaticos ──
    let rel = decodeURIComponent(url.pathname);
    if (rel === '/' || rel === '') rel = '/index.html';
    const filePath = normalize(join(DIR, rel));
    if (!filePath.startsWith(DIR)) { res.writeHead(403); return res.end('prohibido'); }
    try {
      const buf = await readFile(filePath);
      res.writeHead(200, { 'Content-Type': MIME[extname(filePath)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      res.end(buf);
    } catch {
      res.writeHead(404); res.end('no encontrado');
    }
  } catch (e) {
    json(res, 500, { ok: false, error: e.message });
  }
});

// regenerar al arrancar para que data.js este fresco
try { generar(); } catch (e) { console.warn('[horas] aviso al generar:', e.message); }

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[horas] dashboard en http://localhost:${PORT}  (Ctrl+C para cortar)`);
});
