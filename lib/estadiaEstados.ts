// lib/estadiaEstados.ts

export const ESTADOS = {
  SIN_CONFIRMAR: '462ab8f6-ff33-4958-ac16-f72c37a3090a',
  PENDIENTE: 'acc266fa-96b1-4be0-bdbc-7d4c6b02586f',
  RESERVADO: '7d735e7f-458b-4db8-8c6a-e3f48b559d44',
  PAGADO: '4b925402-cf36-47a6-bc1e-22eda045c59d',
  ANULADA: 'd0d4f505-6263-475a-b213-791673f0f985',
  CANCELADA: 'ef4dae08-fcea-4e3f-81dc-27f21b2c6f25',
  CANCELADA_PENDIENTE: '742b9d8d-cf80-4e7c-962d-5e2f49b30700',
};

export function esTransicionValida(estadoActual: string, estadoNuevo: string, opciones: { tieneCliente: boolean; tienePagoReserva: boolean; tienePagoTotal: boolean } = {
  tieneCliente: false,
  tienePagoReserva: false,
  tienePagoTotal: false,
}) {
  const { tieneCliente, tienePagoReserva, tienePagoTotal } = opciones;

  switch (estadoNuevo) {
    case ESTADOS.PENDIENTE:
      return estadoActual === ESTADOS.SIN_CONFIRMAR && tieneCliente;

    case ESTADOS.RESERVADO:
      return tienePagoReserva;

    case ESTADOS.PAGADO:
      return tienePagoTotal;

    case ESTADOS.ANULADA:
      return [ESTADOS.SIN_CONFIRMAR, ESTADOS.PENDIENTE].includes(estadoActual) && !tienePagoReserva && !tienePagoTotal;

    case ESTADOS.CANCELADA:
      return [ESTADOS.RESERVADO, ESTADOS.PAGADO].includes(estadoActual) && (tienePagoReserva || tienePagoTotal);

    case ESTADOS.CANCELADA_PENDIENTE:
      return estadoActual === ESTADOS.RESERVADO;

    default:
      return false;
  }
}
