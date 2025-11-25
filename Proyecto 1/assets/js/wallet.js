// ***********************************************
// CONFIGURACION DE LOCALSTORAGE Y FUNCIONES BASE
// ***********************************************

// Clave para guardar el saldo en localStorage
const LS_BALANCE_KEY = "wallet_balance";
// Clave para guardar la lista de transacciones
const LS_TX_KEY = "wallet_transactions";
// Saldo inicial de prueba para la cuenta
const SALDO_INICIAL = 80000;

// Funcion que inicializa el saldo si aun no existe en localStorage
function initBalance() {
  if (localStorage.getItem(LS_BALANCE_KEY) === null) {
    localStorage.setItem(LS_BALANCE_KEY, String(SALDO_INICIAL));
  }
}

// Devuelve el saldo actual como numero
function getBalance() {
  initBalance();
  return Number(localStorage.getItem(LS_BALANCE_KEY)) || 0;
}

// Guarda un nuevo saldo en localStorage
function setBalance(nuevoSaldo) {
  localStorage.setItem(LS_BALANCE_KEY, String(nuevoSaldo));
}

// Formatea un numero como dinero CLP (solo para mostrar)
function formatMoney(valor) {
  return valor.toLocaleString("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  });
}

// Obtiene la lista de transacciones desde localStorage
function getTransactions() {
  const raw = localStorage.getItem(LS_TX_KEY);
  // Si no hay transacciones guardadas, devolvemos un arreglo vacio
  return raw ? JSON.parse(raw) : [];
}

// Agrega una nueva transaccion a la lista
// tipo puede ser: "deposito", "envio", "compra", "transferencia"
function addTransaction(tipo, monto, detalle) {
  const transacciones = getTransactions();

  // Agregamos al inicio del arreglo la nueva transaccion
  transacciones.unshift({
    fecha: new Date().toLocaleString("es-CL"),
    tipo: tipo,
    monto: monto,
    detalle: detalle,
  });

  // Guardamos la lista actualizada
  localStorage.setItem(LS_TX_KEY, JSON.stringify(transacciones));
}

// Devuelve un texto legible para cada tipo de transaccion
function getTipoTransaccion(tipo) {
  switch (tipo) {
    case "deposito":
      return "Deposito";
    case "envio":
      return "Envio de dinero";
    case "compra":
      return "Compra";
    case "transferencia":
      return "Transferencia recibida";
    default:
      return "Movimiento";
  }
}

// ***********************************************
// CODIGO PRINCIPAL: SE EJECUTA CON JQUERY
// ***********************************************

// $(function () { ... }) es equivalente a "cuando el documento esta listo"
$(function () {
  // --------------------------------------------
  // LOGIN (index.html)
  // --------------------------------------------
  if ($("#loginForm").length) {
    // Inicializamos el saldo por si es la primera vez que entra
    initBalance();

    // Manejamos el envio del formulario de login
    $("#loginForm").on("submit", function (e) {
      // Evitamos que el formulario recargue la pagina
      e.preventDefault();

      // Obtenemos los valores desde los inputs usando jQuery
      const emailIngresado = $("#email").val().trim();
      const passwordIngresado = $("#password").val().trim();

      // Credenciales de prueba (simulan un usuario registrado)
      const emailCorrecto = "oscar.pezoa.sanchez@gmail.com";
      const passCorrecta = "12345678";

      const $loginMessage = $("#loginMessage");
      // Limpiamos mensajes anteriores
      $loginMessage.empty();

      // Validamos las credenciales ingresadas
      if (emailIngresado === emailCorrecto && passwordIngresado === passCorrecta) {
        // Creamos una alerta de exito usando clases de Bootstrap
        $loginMessage.html(`
          <div class="alert alert-success" role="alert">
            Inicio de sesion exitoso. Redirigiendo al menu...
          </div>
        `);

        // Redirigimos al menu principal despues de 1 segundo
        setTimeout(function () {
          window.location.href = "menu.html";
        }, 1000);
      } else {
        // Si los datos no coinciden, mostramos un mensaje de error
        $loginMessage.html(`
          <div class="alert alert-danger" role="alert">
            Correo o clave incorrectos.
          </div>
        `);
      }
    });
  }

  // --------------------------------------------
  // MENU PRINCIPAL (menu.html)
  // --------------------------------------------
  if ($("#balanceAmount").length) {
    // Mostramos el saldo actual en el elemento con id balanceAmount
    $("#balanceAmount").text(formatMoney(getBalance()));

    // Boton "Depositar" redirige a la pantalla de deposito
    $("#btnDepositar").on("click", function () {
      $("#menuMensaje").text("Redirigiendo a deposito...");
      setTimeout(function () {
        window.location.href = "deposito.html";
      }, 700);
    });

    // Boton "Enviar dinero" redirige a envios.html
    $("#btnEnviar").on("click", function () {
      $("#menuMensaje").text("Redirigiendo a enviar dinero...");
      setTimeout(function () {
        window.location.href = "envios.html";
      }, 700);
    });

    // Boton "Ultimos movimientos" redirige a transacciones.html
    $("#btnMovimientos").on("click", function () {
      $("#menuMensaje").text("Redirigiendo a ultimos movimientos...");
      setTimeout(function () {
        window.location.href = "transacciones.html";
      }, 700);
    });
  }

  // --------------------------------------------
  // DEPOSITO (deposito.html)
  // --------------------------------------------
  if ($("#formDeposito").length) {
    // Mostramos el saldo actual encima del formulario
    $("#saldoActual").text(formatMoney(getBalance()));

    // Manejamos el envio del formulario de deposito
    $("#formDeposito").on("submit", function (e) {
      e.preventDefault();

      const monto = Number($("#montoDeposito").val());
      const $alertContainer = $("#alert-container");
      // Limpiamos mensajes previos
      $alertContainer.empty();

      // Validamos que el monto sea mayor que cero
      if (!monto || monto <= 0) {
        $alertContainer.html(`
          <div class="alert alert-danger" role="alert">
            Ingresa un monto valido mayor que 0.
          </div>
        `);
        return;
      }

      // Obtenemos el saldo actual y sumamos el monto
      const saldoActual = getBalance();
      const nuevoSaldo = saldoActual + monto;
      setBalance(nuevoSaldo);

      // Registramos la transaccion en el historial
      addTransaction("deposito", monto, "Deposito en cuenta");

      // Mensaje de exito con el nuevo saldo
      $alertContainer.html(`
        <div class="alert alert-success" role="alert">
          Deposito realizado por ${formatMoney(monto)}.
          Nuevo saldo: ${formatMoney(nuevoSaldo)}.
          Redirigiendo al menu...
        </div>
      `);

      // Redirigimos al menu luego de 2 segundos
      setTimeout(function () {
        window.location.href = "menu.html";
      }, 2000);
    });
  }

  // --------------------------------------------
  // ENVIOS (envios.html)
  // --------------------------------------------
  if ($("#contactList").length) {
    const $contactList = $("#contactList");
    const $btnEnviarDinero = $("#btnEnviarDinero");
    const $mensajeEnvio = $("#mensajeEnvio");

    // Cuando se hace click en un contacto, lo marcamos como activo
    $contactList.on("click", "li", function () {
      // Quitamos la clase active de todos los li
      $contactList.children("li").removeClass("active");
      // Agregamos active al elemento clickeado
      $(this).addClass("active");
      // Mostramos el boton para enviar dinero
      $btnEnviarDinero.removeClass("d-none");
    });

    // Mostrar u ocultar el formulario de nuevo contacto
    $("#btnToggleFormContacto").on("click", function () {
      $("#formNuevoContacto").toggleClass("d-none");
    });

    // Boton para cancelar la creacion de un contacto nuevo
    $("#btnCancelarContacto").on("click", function () {
      $("#formNuevoContacto")[0].reset();
      $("#formNuevoContacto").addClass("d-none");
    });

    // Guardar un contacto nuevo en la lista
    $("#formNuevoContacto").on("submit", function (e) {
      e.preventDefault();

      const nombre = $("#nombreContacto").val().trim();
      const cbu = $("#cbuContacto").val().trim();
      const alias = $("#aliasContacto").val().trim();
      const banco = $("#bancoContacto").val().trim();

      // Validacion simple: nombre y CBU obligatorios
      if (!nombre || !cbu) {
        alert("Nombre y CBU son obligatorios.");
        return;
      }

      // Creamos un nuevo elemento de lista con jQuery
      const $li = $(`
        <li class="list-group-item">
          <div>
            <span class="fw-bold"></span><br />
            <small class="text-muted"></small>
          </div>
        </li>
      `);

      // Guardamos nombre y alias como data-atributos para la busqueda
      $li.attr("data-nombre", nombre);
      $li.attr("data-alias", alias);

      // Rellenamos los textos visibles
      $li.find("span.fw-bold").text(nombre);
      $li
        .find("small.text-muted")
        .text(
          "CBU: " +
            cbu +
            (alias ? " | Alias: " + alias : "") +
            (banco ? " | Banco: " + banco : "")
        );

      // Agregamos el nuevo contacto al final de la lista
      $contactList.append($li);

      // Limpiamos y ocultamos el formulario
      $("#formNuevoContacto")[0].reset();
      $("#formNuevoContacto").addClass("d-none");
    });

    // Buscador por nombre o alias (simula autocompletar simple)
    $("#formBuscarContacto").on("submit", function (e) {
      e.preventDefault();
      const texto = $("#buscarTexto").val().toLowerCase();

      // Recorremos cada contacto y lo mostramos u ocultamos
      $contactList.children("li").each(function () {
        const nombre = ($(this).data("nombre") || "").toLowerCase();
        const alias = ($(this).data("alias") || "").toLowerCase();

        if (!texto || nombre.includes(texto) || alias.includes(texto)) {
          $(this).show();
        } else {
          $(this).hide();
        }
      });
    });

    // Enviar dinero al contacto seleccionado
    $btnEnviarDinero.on("click", function () {
      $mensajeEnvio.empty();

      const $seleccionado = $contactList.find("li.active");
      if (!$seleccionado.length) {
        alert("Selecciona un contacto de la lista.");
        return;
      }

      // Pedimos el monto mediante un prompt simple
      const montoStr = prompt("Monto a enviar:");
      const monto = Number(montoStr);

      // Validamos el monto
      if (!monto || monto <= 0) {
        alert("Monto invalido.");
        return;
      }

      const saldoActual = getBalance();
      // No permitir enviar mas dinero del que hay en la cuenta
      if (monto > saldoActual) {
        alert("Saldo insuficiente.");
        return;
      }

      const nuevoSaldo = saldoActual - monto;
      setBalance(nuevoSaldo);

      const nombre = $seleccionado.data("nombre") || "Contacto";

      // Registramos la transaccion como envio
      addTransaction("envio", monto, "Envio a " + nombre);

      // Mostramos una alerta de exito
      $mensajeEnvio.html(`
        <div class="alert alert-success" role="alert">
          Envio realizado a ${nombre} por ${formatMoney(monto)}.
          Nuevo saldo: ${formatMoney(nuevoSaldo)}.
          Redirigiendo al menu...
        </div>
      `);

      // Redirigimos al menu luego de 2 segundos
      setTimeout(function () {
        window.location.href = "menu.html";
      }, 2000);
    });
  }

  // --------------------------------------------
  // ULTIMOS MOVIMIENTOS (transacciones.html)
  // --------------------------------------------
  if ($("#listaTransacciones").length) {
    const $lista = $("#listaTransacciones");

    // Funcion que dibuja en pantalla las transacciones segun el filtro
    function mostrarUltimosMovimientos(filtro) {
      const trans = getTransactions();
      // Limpiamos la lista
      $lista.empty();

      // Filtramos por tipo si se selecciono uno distinto de "todos"
      const filtradas = trans.filter(function (t) {
        if (!filtro || filtro === "todos") return true;
        return t.tipo === filtro;
      });

      // Si no hay movimientos para ese filtro, mostramos un mensaje
      if (!filtradas.length) {
        $lista.append(
          `<li class="list-group-item">No hay movimientos para este filtro.</li>`
        );
        return;
      }

      // Recorremos las transacciones y las agregamos como elementos de lista
      filtradas.forEach(function (t) {
        const textoTipo = getTipoTransaccion(t.tipo);
        const liHtml = `
          <li class="list-group-item">
            <div class="d-flex justify-content-between">
              <div>
                <strong>${textoTipo}</strong><br>
                <small class="text-muted">${t.detalle}</small>
              </div>
              <div class="text-end">
                <span>${formatMoney(t.monto)}</span><br>
                <small class="text-muted">${t.fecha}</small>
              </div>
            </div>
          </li>
        `;
        $lista.append(liHtml);
      });
    }

    // Al abrir la pagina mostramos todos los movimientos
    mostrarUltimosMovimientos("todos");

    // Cambiamos el filtro cuando el usuario selecciona otro tipo
    $("#filtroTipo").on("change", function () {
      const filtro = $(this).val();
      mostrarUltimosMovimientos(filtro);
    });
  }
});
