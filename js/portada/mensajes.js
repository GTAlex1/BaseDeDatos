/* Errores de Supabase traducidos al español (inicio de sesión, registro y avisos). */
const trMsg=(()=>{const T=[
 [/rate limit/i,'Se han enviado demasiados correos en la última hora. Espera un rato, entra con Google o inténtalo más tarde.'],
 [/not authorized/i,'Este correo todavía no se puede registrar con contraseña. Prueba a entrar con Google.'],
 [/provider is not enabled|unsupported provider/i,'El inicio de sesión con Google aún no está activado.'],
 [/at least 6 char/i,'La contraseña debe tener al menos 6 caracteres.'],
 [/password should contain|weak|pwned|leaked|easy to guess/i,'Esa contraseña no es lo bastante segura. Elige otra.'],
 [/invalid format|valid email|invalid email/i,'El correo no es válido.'],
 [/valid password|password.*required/i,'Escribe una contraseña válida.'],
 [/once every \d+ seconds|for security purposes/i,'Espera un minuto antes de volver a intentarlo.'],
 [/already registered|already been registered/i,'Ese correo ya tiene cuenta.'],
 [/invalid login/i,'Correo o contraseña incorrectos.'],
 [/not confirmed/i,'Debes confirmar tu correo antes de entrar.'],
 [/suggestions.*(check constraint|violates)/i,'La sugerencia debe tener entre 3 y 1000 caracteres.'],
 [/jwt expired|session.*(expired|missing)/i,'Tu sesión ha caducado. Vuelve a iniciar sesión.'],
 [/failed to fetch|networkerror|network request failed/i,'No hay conexión con el servidor. Revisa tu internet.']];
 return s=>{if(typeof s!='string')return;for(const[r,t]of T)if(r.test(s))return t}})();
/* La ventana de inicio de sesión busca el texto en ERR: se le da un respaldo que traduce */
Object.setPrototypeOf(ERR,new Proxy(Object.prototype,{get(t,k,r){const v=trMsg(k);return v!==undefined?v:Reflect.get(t,k,r)}}));
/* Los avisos emergentes también se traducen si llegan en inglés */
const toast0=toast;toast=function(m){toast0(trMsg(m)||m)};
