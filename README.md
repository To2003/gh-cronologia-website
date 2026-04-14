# GH Generación Dorada — Tracker

Página web minimalista para seguir los movimientos de participantes en Gran Hermano Generación Dorada.

## Archivos

```
index.html   →  la página web (no tocar)
data.json    →  acá se editan todos los datos
```

---

## Cómo actualizar

Solo editás `data.json`. La página lee ese archivo cada vez que alguien la abre.

### Campos de `data.json`

**`ultima_actualizacion`** — fecha en formato `YYYY-MM-DD`

**`placa`** — array con los participantes en placa esta semana:
```json
{ "nombre": "Nombre Apellido", "razon": "votada" }
```
Valores posibles para `razon`:
- `"votada"` → placa por votación del público
- `"fulminado"` → placa directa por decisión de la casa o líder
- `"incumplimiento"` → placa por romper las normas

**`eventos`** — historial de movimientos, del más nuevo al más viejo:
```json
{ "tipo": "eliminado", "nombre": "Nombre Apellido", "detalle": "descripción corta", "fecha": "2025-04-13" }
```
Valores posibles para `tipo`:
- `"eliminado"` → salió por votación del público
- `"ingreso"` → entró a la casa
- `"abandono"` → se fue solo/a voluntariamente o por salud/personales

---

## Cómo publicarla gratis

### Opción A — GitHub Pages (recomendado)
1. Creá una cuenta en [github.com](https://github.com) si no tenés
2. Creá un repositorio nuevo (público)
3. Subí los dos archivos (`index.html` y `data.json`)
4. En Settings → Pages → Source: seleccioná `main` branch
5. Tu página queda en: `https://tu-usuario.github.io/nombre-del-repo`

Para actualizar los datos: editá `data.json` directamente desde GitHub en el navegador → botón "Commit changes" → la página se actualiza en segundos.

### Opción B — Netlify Drop
1. Andá a [netlify.com/drop](https://app.netlify.com/drop)
2. Arrastrá la carpeta con los dos archivos
3. Queda publicada al instante con una URL

Para actualizar: volvé a arrastrar la carpeta con el `data.json` modificado.

---

## Estructura de colores por tipo

| Tipo | Color |
|------|-------|
| Eliminado | Rojo |
| Ingreso | Verde |
| Abandono | Ámbar |
| Placa votada | Azul |
| Placa fulminado | Rojo |
| Placa incumplimiento | Ámbar |