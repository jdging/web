# Arquitectura SOLID para planillas de cálculo y herramientas técnicas standalone

- **Origen:** /x (diseño interno, sin proyecto de origen), 2026-07-23 — validación planificada
  contra `planillas-de-calculo/work/301-18/alma-variable`.
- **Qué resuelve:** Cómo separar dominio, aplicación, presentación, infraestructura y
  configuración en una planilla HTML+JS standalone, aplicando SOLID de forma pragmática y sin
  sobrearquitectura, preservando los resultados numéricos durante un refactor.
- **Cuándo aplica:** Planillas de cálculo o herramientas técnicas nuevas que vayan a crecer más
  allá de un único script; y refactor de planillas existentes que mezclan cálculo, DOM y
  exportación, cuando haga falta testear el cálculo sin navegador o cambiar exportador/
  persistencia sin tocar fórmulas. No aplica a scripts de un solo uso sin expectativa de
  mantenimiento.

## Arquitectura y límites de responsabilidad

La arquitectura separa cinco capas y usa `main/` como composition root:

- `config/`: concentra la configuración que necesitan las capas, como defaults, etiquetas o
  unidades. No importa de ningún otro módulo.
- `dominio/`: contiene cálculo, validación y unidades como funciones puras y síncronas. Puede
  importar `config/`, pero no conoce `document`, `window`, `fetch` ni la infraestructura.
- `aplicación/`: expresa los casos de uso y coordina el dominio con puertos o adapters recibidos
  por parámetro. Importa `dominio/` y `config/`, nunca `infraestructura/` directamente.
- `presentación/`: se ocupa del DOM, renderizado, helpers de UI y listeners. Solo importa
  `config/` para etiquetas o unidades; expone `montarUI(dependencias)` y recibe los casos de uso
  resueltos en runtime.
- `infraestructura/`: implementa guardado, exportación y persistencia. Importa `config/`, pero
  no conoce la aplicación ni el dominio.
- `main/`: es el composition root. Ensambla aplicación, infraestructura, presentación y
  configuración; es el único módulo que conoce las cinco piezas a la vez.

## Mapa de dependencias permitidas

La matriz de imports permitidos es:

| Módulo | Puede importar de |
|---|---|
| `config/` | nada |
| `dominio/` | `config/` |
| `aplicación/` | `dominio/`, `config/` |
| `infraestructura/` | `config/` |
| `presentación/` | `config/` (solo etiquetas/unidades de UI) |
| `main/` (composition root) | `aplicación/`, `infraestructura/`, `presentación/`, `config/` |

`presentación/` nunca importa `aplicación/` estáticamente: expone `montarUI(dependencias)` y
recibe los casos de uso ya resueltos como parámetro en runtime, inyectados por `main/`.
`aplicación/` nunca importa `infraestructura/` directo: recibe adapters/puertos por parámetro
(factories). La referencia visual y de marca es el [INSTRUCTIVO_PLANILLAS.md](../modulos/marca/planillas/INSTRUCTIVO_PLANILLAS.md);
este patrón no duplica su contenido.

## Manifiesto de ensamblado

El manifiesto mapea el orden exigido por el [INSTRUCTIVO_PLANILLAS.md](../modulos/marca/planillas/INSTRUCTIVO_PLANILLAS.md):

| # | Slot del instructivo | Capa/origen real |
|---|---|---|
| 1 | Constantes y tablas normativas | `config/` |
| 2 | `SAVED_STATE` | escrito a mano en la plantilla base (Etapa 1); leído/normalizado por `main/` al arrancar |
| 3 | Helpers generales (`$`, `fmt`) | `presentación/` |
| 4 | Funciones de cálculo puras | `dominio/` |
| 4.5 (slot nuevo, aditivo) | casos de uso | `aplicación/` — entre cálculo puro (4) y renderizado (5) |
| 5 | Funciones de renderizado | `presentación/` |
| 6 | Tema | `presentación/` |
| 7 | Estado y guardado standalone | `infraestructura/` (`guardarStandalone`) |
| 8 | Exportaciones | `infraestructura/` (`exportarWord`, `exportarPdf`, registro por `formato`) |
| 9 | Carga inicial y listeners | `main/` ensambla; `presentación/` registra listeners |

La incorporación del slot 4.5 no contradice el orden ya exigido por `INSTRUCTIVO_PLANILLAS.md`:
mantiene su orden macro y hace explícito dónde vive la orquestación que antes quedaba implícita.

## Reglas SOLID aplicadas a JavaScript

- **SRP:** un módulo cohesivo tiene una razón de cambio; no significa “un archivo = un verbo”.
  Por ejemplo, el cálculo puede cambiar por una regla del dominio, mientras que el exportador
  cambia por el formato de salida.
- **OCP:** la extensión se acota a extension points reales, registrados en `main/`. Agregar una
  implementación nueva sí puede tocar ese registro; eso no es una violación, porque el registro
  es el punto explícito de composición. Un formato nuevo agrega su adapter y una línea en el
  registro.
- **LSP:** cualquier función con la forma “exportador” es intercambiable con otra que cumpla el
  mismo contrato. Un test de contrato compartido puede verificar que cada implementación acepte
  el DTO y devuelva el resultado esperado del contrato uniforme.
- **ISP:** los contratos son chicos y corresponden a cada capa. La aplicación recibe solo los
  puertos que necesita, en vez de depender de una interfaz grande de DOM, guardado y exportación.
- **DIP:** la aplicación depende de la forma de una función de infraestructura, nunca de su
  implementación concreta. Por ejemplo, recibe `ahoraIso` y los adapters por parámetro desde
  `main/`, sin leer `Date` global ni construir un exportador específico.

## Antipatrones y señales de responsabilidades mezcladas

Checklist de señales:

- ¿El cálculo recibe DOM/eventos o solo datos planos?
- ¿Hay constantes normativas hardcodeadas dentro de funciones de cálculo?
- ¿El exportador recalcula o solo formatea?
- ¿El guardado toca DOM más allá de serializar estado?
- ¿Corre en Node sin jsdom?
- ¿Agregar un exportador tocaría el cálculo?
- ¿Cambiar persistencia tocaría dominio/presentación?

Hay un antipatrón conocido documentado y no corregido acá: el footgun de serialización sin
escapar del patrón de guardado de [INSTRUCTIVO_PLANILLAS.md](../modulos/marca/planillas/INSTRUCTIVO_PLANILLAS.md),
descripto en la sección 2.5 del tracker. Es una limitación heredada: el reemplazo directo sobre
`JSON.stringify(estado)` no escapa `</script>`, los centinelas ni las secuencias `$`. La
recomendación futura es usar un callback de reemplazo y escapar `</script>`/centinelas/secuencias
`$`, con un test de round-trip. **No se modifica el instructivo en esta iniciativa.**

## Contratos mínimos

- El cálculo es síncrono y puro: recibe datos planos, no usa `document`/`window`/`fetch` y usa
  `Number.isFinite`. La validación es síncrona y pura y, ante errores esperados de usuario, nunca
  hace `throw`: devuelve `{ok, errores}`.
- `DEFAULT_STATE` contiene los defaults de fábrica y `SAVED_STATE` contiene el último guardado
  embebido. `main/` normaliza `SAVED_STATE` contra `DEFAULT_STATE` al arrancar, clonando y
  completando claves faltantes; nunca renombra ni transforma. Un cambio de shape persistido es
  una migración aparte.
- Limpiar resetea datos y resultado a `DEFAULT_STATE`, pero conserva el tema vigente en pantalla:
  el tema es una preferencia de UI, no un dato de cálculo.
- La exportación es un único caso de uso con selector `formato` (`"word"|"pdf"|...`) contra un
  registro de adapters en `main/`. Construye un DTO único y clonado con `structuredClone`.
- El reloj `ahoraIso` es una dependencia explícita inyectada; `aplicación/` nunca lee `Date`
  global directamente. El guard `resultado == null` se evalúa antes de invocar el reloj.
- Todo exportador cumple el contrato uniforme `(dto) => Blob`. Agregar uno nuevo significa un
  módulo nuevo y una línea en el registro de `main/`, sin tocar `aplicación/` ni `dominio/`.

## Ejemplo antes/después

El “antes” mezcla lectura de DOM, cálculo y renderizado en un mismo bloque:

```js
function actualizar() {
  const a = Number(document.getElementById("a").value);
  const b = Number(document.getElementById("b").value);
  const factor = Number(document.getElementById("factor").value);
  const valor = a * b * factor;
  document.getElementById("resultado").textContent = String(valor);
}
```

No puede testearse sin navegador y no separa sus responsabilidades. El “después” conserva el
contrato en una función de dominio, mientras las demás capas reciben datos o dependencias:

```js
// dominio/
function calcularEjemplo({ a, b, factor }) {
  return { valor: a * b * factor, unidades: "u" };
}

// aplicación/
function ejecutarEjemplo(entrada, { calcular }) {
  return calcular(entrada);
}

// presentación/
function renderizarEjemplo(resultado, elemento) {
  elemento.textContent = String(resultado.valor);
}

// infraestructura/
function exportadorEjemplo(dto) {
  return new Blob([JSON.stringify(dto)]);
}
```

En `calcularEjemplo({a,b,factor}) -> {valor: a*b*factor, unidades:"u"}`, `u` es una unidad
placeholder explícitamente sin significado físico.

> **Nota:** el código de este ejemplo es **pseudocódigo ilustrativo** para mostrar la
> separación de capas y los contratos de la sección "Contratos mínimos". No se ejecuta ni se
> testea en esta etapa. Casos de comportamiento en runtime — como qué ocurre si la entrada
> cambia entre un cálculo exitoso y una exportación posterior (transición entrada/resultado),
> o cómo se persiste un resultado no finito (`Infinity`/`NaN`) en `SAVED_STATE` — se resuelven
> y se prueban recién en el spec de Etapa 2 (ejemplo runnable con tests de caracterización
> reales).

## Estrategia de tests de caracterización y equivalencia numérica

El proceso de goldens es:

1. Capturar la salida actual de la planilla real tal cual está.
2. Congelar esa salida como fixture.
3. Refactorizar sin tocar las fórmulas.
4. Comparar la salida refactorizada con el fixture.

El comparador exacto trata los resultados finitos con tolerancia relativa `1e-9`, usando tolerancia
absoluta `1e-12` si el esperado es `0`. Los valores no finitos se comparan con `Object.is`, lo que
cubre `NaN` y `±Infinity`. `-0` y `0` se consideran equivalentes.

## Checklist para evaluar una planilla existente

Aplicar esta lista accionable a la planilla real:

- [ ] Verificar si el cálculo recibe DOM/eventos o solo datos planos.
- [ ] Buscar constantes normativas hardcodeadas dentro de funciones de cálculo.
- [ ] Comprobar que el exportador solo formatea y no recalcula.
- [ ] Comprobar que el guardado no toca DOM más allá de serializar estado.
- [ ] Verificar que corre en Node sin jsdom.
- [ ] Evaluar si agregar un exportador tocaría el cálculo.
- [ ] Evaluar si cambiar persistencia tocaría dominio/presentación.

## Procedimiento para llevar el patrón a otro repositorio

1. Correr el checklist de evaluación sobre la planilla real.
2. Capturar goldens con el proceso de la sección “Estrategia de tests de caracterización y
   equivalencia numérica” antes de tocar nada.
3. Extraer `dominio/` primero —fórmulas, validaciones y unidades— sin cambiar su contenido, solo
   moviéndolo.
4. Separar `aplicación/`, `presentación/` e `infraestructura/` siguiendo la matriz de
   dependencias.
5. Verificar los goldens contra el resultado refactorizado con el comparador exacto.
6. Hacer QA humano de cobertura normativa de los casos.
7. Recién entonces evaluar qué parte del patrón resultó realmente reutilizable para capturar de
   vuelta en `/x` (ver “Qué se captura en /x vs qué queda en el proyecto específico”).

## Qué se captura en /x vs qué queda en el proyecto específico

En `/x` solo va el patrón general: capas, contratos, checklist y estrategia de tests. En el
proyecto quedan las fórmulas, tablas normativas, datos de la norma concreta y cualquier decisión
específica de esa norma. Nunca se copian decisiones normativas de un proyecto a `/x`.

## Criterios de madurez y camino de evolución

Hoy es una idea conceptual en `ideas/`, todavía sin validar contra un caso real. El camino de
evolución es:

- Validar contra al menos un caso real (`planillas-de-calculo/work/301-18/alma-variable`), fuera
  de este orquestador, vía `CHANGE_REQUEST` separado.
- Si el patrón se sostiene sin cambios mayores en dos o más casos reales, evaluar promoción. El
  destino final —módulo instalable en `modulos/` o un procedimiento más guiado tipo
  skill/orquestador de refactor— se decide recién en ese momento, no ahora.
- Mientras tanto, queda en `ideas/` como referencia consultable.

## Doble propósito

Este patrón sirve tanto para diseñar una planilla nueva desde cero como para refactorizar una
existente que mezcló todo en un único script. Ambos casos comparten el mismo checklist y la misma
estrategia de tests de caracterización.

## Referencia de origen

- `modulos/marca/planillas/INSTRUCTIVO_PLANILLAS.md` — presentación, marca, guardado
  standalone y orden del `<script>` final (no se modifica ni se duplica acá).
- `ARQUITECTURA-SOLID-PLANILLAS.md` (raíz de `/x`) — orquestador de esta iniciativa, con el
  detalle de las decisiones congeladas y su historial de revisión.
