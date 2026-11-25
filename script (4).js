/* ==========================================================
   1) CONFIGURACIÓN — EDITA ESTA PARTE CON TUS DATOS REALES
   ========================================================== */

const CONFIG = {
  tuNombre: "TU NOMBRE",             // cómo quieres que aparezca tu nombre
  mezclarPreguntas: true,            // true = orden aleatorio cada partida
};

// Cada pregunta: texto, 4 opciones y el número de la respuesta correcta
// (0 = primera opción, 1 = segunda, 2 = tercera, 3 = cuarta).
const PREGUNTAS = [
  {
    texto: "¿Cuál es mi comida favorita?",
    opciones: ["Pizza", "Sushi", "Arepas", "Hamburguesa"],
    correcta: 0,
  },
  {
    texto: "¿Qué hago en mi tiempo libre?",
    opciones: ["Jugar videojuegos", "Programar", "Ver series", "Hacer deporte"],
    correcta: 1,
  },
  {
    texto: "¿Cuál es mi color favorito?",
    opciones: ["Azul", "Rojo", "Verde", "Negro"],
    correcta: 0,
  },
  {
    texto: "¿A dónde me gustaría viajar?",
    opciones: ["Japón", "España", "Estados Unidos", "Italia"],
    correcta: 0,
  },
  {
    texto: "¿Qué tipo de música escucho más?",
    opciones: ["Reguetón", "Rock", "Pop", "Salsa"],
    correcta: 2,
  },
];

// Mensajes según el porcentaje de aciertos (de mayor a menor).
const RESULTADOS = [
  { minimo: 100, titulo: "¡Me conoces perfecto!",   mensaje: "Ni yo lo habría hecho mejor. Eres de mis personas favoritas." },
  { minimo: 70,  titulo: "Me conoces muy bien",      mensaje: "Fallaste poquito. Se nota que prestas atención." },
  { minimo: 40,  titulo: "Me conoces a medias",      mensaje: "Hay que pasar más tiempo juntos para mejorar ese puntaje." },
  { minimo: 0,   titulo: "Todavía no me conoces",    mensaje: "No pasa nada: ¡toca que nos pongamos al día!" },
];

/* ==========================================================
   2) LÓGICA DEL QUIZ — no necesitas tocar nada de aquí abajo
   ========================================================== */

const $ = (id) => document.getElementById(id);

const pantallas = {
  inicio: $("pantalla-inicio"),
  quiz: $("pantalla-quiz"),
  final: $("pantalla-final"),
};

let preguntas = [];
let indice = 0;
let aciertos = 0;
let nombreJugador = "";

const CLAVE_MEJOR = "quiz-sobre-mi:mejor";

function mostrar(nombre) {
  Object.values(pantallas).forEach((p) => p.classList.remove("activa"));
  pantallas[nombre].classList.add("activa");
}

function mezclar(lista) {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

function leerMejor() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_MEJOR));
  } catch {
    return null;
  }
}

function guardarMejor(puntaje) {
  try {
    localStorage.setItem(CLAVE_MEJOR, JSON.stringify(puntaje));
  } catch {
    /* si el navegador bloquea el almacenamiento, simplemente no se guarda */
  }
}

function mostrarMejor() {
  const mejor = leerMejor();
  const el = $("mejor-puntaje");
  if (mejor && mejor.total === PREGUNTAS.length) {
    el.textContent = `Mejor resultado en este dispositivo: ${mejor.nombre}, ${mejor.aciertos} de ${mejor.total}`;
    el.hidden = false;
  } else {
    el.hidden = true;
  }
}

function iniciar() {
  nombreJugador = $("nombre-jugador").value.trim() || "Visitante";
  preguntas = CONFIG.mezclarPreguntas ? mezclar(PREGUNTAS) : [...PREGUNTAS];
  indice = 0;
  aciertos = 0;
  mostrar("quiz");
  mostrarPregunta();
}

function mostrarPregunta() {
  const p = preguntas[indice];
  $("contador").textContent = `Pregunta ${indice + 1} de ${preguntas.length}`;
  $("barra").style.width = `${(indice / preguntas.length) * 100}%`;
  $("pregunta").textContent = p.texto;
  $("feedback").textContent = "";
  $("btn-siguiente").hidden = true;

  const contenedor = $("opciones");
  contenedor.innerHTML = "";
  p.opciones.forEach((texto, i) => {
    const boton = document.createElement("button");
    boton.className = "opcion";
    boton.type = "button";
    boton.textContent = texto;
    boton.addEventListener("click", () => responder(i, boton));
    contenedor.appendChild(boton);
  });
}

function responder(elegida, botonElegido) {
  const p = preguntas[indice];
  const botones = [...$("opciones").children];
  botones.forEach((b) => (b.disabled = true));

  if (elegida === p.correcta) {
    aciertos++;
    botonElegido.classList.add("correcta");
    $("feedback").textContent = "¡Correcto!";
  } else {
    botonElegido.classList.add("incorrecta");
    botones[p.correcta].classList.add("correcta");
    $("feedback").textContent = `Casi. La respuesta era: ${p.opciones[p.correcta]}`;
  }

  const ultima = indice === preguntas.length - 1;
  $("btn-siguiente").textContent = ultima ? "Ver mi resultado" : "Siguiente pregunta";
  $("btn-siguiente").hidden = false;
  $("btn-siguiente").focus();
}

function siguiente() {
  indice++;
  if (indice < preguntas.length) {
    mostrarPregunta();
  } else {
    terminar();
  }
}

function terminar() {
  const total = preguntas.length;
  const porcentaje = (aciertos / total) * 100;
  const resultado = RESULTADOS.find((r) => porcentaje >= r.minimo);

  $("final-nombre").textContent = nombreJugador;
  $("final-aciertos").textContent = aciertos;
  $("final-total").textContent = `/ ${total}`;
  $("final-titulo").textContent = resultado.titulo;
  $("final-mensaje").textContent = resultado.mensaje;

  const mejor = leerMejor();
  if (!mejor || mejor.total !== total || aciertos > mejor.aciertos) {
    guardarMejor({ nombre: nombreJugador, aciertos, total });
  }

  mostrar("final");
}

function reiniciar() {
  mostrarMejor();
  mostrar("inicio");
}

// Textos iniciales a partir de la configuración
$("titulo").textContent = `¿Cuánto sabes de ${CONFIG.tuNombre}?`;
$("intro").textContent = `${PREGUNTAS.length} preguntas para comprobar qué tan bien conoces a ${CONFIG.tuNombre}.`;
document.title = `¿Cuánto sabes de ${CONFIG.tuNombre}?`;

$("btn-empezar").addEventListener("click", iniciar);
$("nombre-jugador").addEventListener("keydown", (e) => {
  if (e.key === "Enter") iniciar();
});
$("btn-siguiente").addEventListener("click", siguiente);
$("btn-reiniciar").addEventListener("click", reiniciar);

mostrarMejor();
