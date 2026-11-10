# DiagramaDB

Editor web para estudiar bases de datos: **entidad-relación**, **esquema relacional** y **normalización** en un mismo sitio, sin instalar nada.

Web: https://gtalex1.github.io/BaseDeDatos/

## Qué se puede hacer

- Dibujar diagramas **entidad-relación**: entidades, relaciones, atributos (clave, alternativa, simple y multivalor), cardinalidades y notas.
- Dibujar el **esquema relacional**: tablas, campos, tipos, claves PK/FK/UQ y flechas 1:1, 1:N y N:M.
- Generar el relacional a partir del ER (nivel de ayuda «Automático»).
- Trabajar con cuatro niveles de ayuda: Práctica, Verificar, Pistas y Automático.
- Trabajar la pestaña de **normalización**.
- Deshacer y rehacer (Ctrl+Z / Ctrl+Y).
- **Exportar e importar** el diagrama completo en JSON.
- Generar **SQL** (`CREATE TABLE` y claves foráneas) desde el esquema relacional.
- Descargar la pestaña actual como **imagen SVG o PNG** (siempre con tema claro y recortada al contenido).
- Guardar los diagramas en el navegador o, con una cuenta, en la nube. La papelera, los favoritos y la caducidad automática de diagramas sin abrir funcionan solo en la nube.

## Cómo está organizado

Es una web estática (HTML, CSS y JavaScript sin compilar). El HTML, el CSS y el JS van en archivos separados.

| Archivo | Para qué sirve |
| --- | --- |
| `index.html`, `editor.html` | Portada con la lista de diagramas y página del editor |
| `styles.css`, `pages.css`, `editor.css`, `normalizacion.css` | Estilos (colores y tema claro/oscuro con variables CSS) |
| `app.js` | Núcleo del editor: estado `S`, dibujo del lienzo SVG, menús, deshacer, generar relacional y SQL |
| `store.js` | Almacén de diagramas: Supabase si hay sesión y `localStorage` si no |
| `editor-boot.js` | Carga el diagrama de la URL, arranca el editor y lo guarda solo |
| `exportar.js` | Importar/exportar JSON y SQL |
| `exportar-imagen.js` | Exportar SVG y PNG (se engancha al diálogo de `exportar.js`) |
| `lienzo.js` | Menú del lienzo vacío (borrar todo) |

`editor-boot.js` carga los demás módulos del editor en orden. Para añadir un módulo nuevo, créalo y añade una línea `await add('mi-modulo.js');` en esa lista.

## Base de datos (Supabase)

- Proyecto `diagramadb`. Los diagramas se guardan en la tabla `diagrams`; los perfiles de usuario, en `profiles`.
- La clave que aparece en `store.js` es la **clave `anon`**, pública por diseño. La seguridad la dan las políticas **RLS** de Supabase, no esconder la clave.
- Los proyectos gratuitos se pausan tras 7 días sin actividad. El flujo `.github/workflows/mantener-supabase.yml` hace una consulta ligera lunes y jueves para evitarlo.

## Probarlo en local

No hace falta compilar nada. Desde la carpeta del proyecto:

```
python -m http.server 8000
```

y abre http://localhost:8000. Con VS Code también sirve la extensión Live Server.

## Ideas pendientes

Las sugerencias y los fallos se apuntan en la pestaña **Issues** del repositorio.
