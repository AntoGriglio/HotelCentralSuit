import { pgTable, uuid, serial, varchar, integer, boolean, timestamp, date, doublePrecision, text } from 'drizzle-orm/pg-core';

// Tabla cliente
export const cliente = pgTable('cliente', {
  dni: varchar('dni', { length: 255 }).primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  nombre_completo: varchar('nombre_completo', { length: 255 }),
  telefono: varchar('telefono', { length: 255 }),
  localidad: varchar('localidad', { length: 255 }).notNull(),
  provincia: varchar('provincia', { length: 255 }),
  pais: varchar('pais', { length: 255 }).notNull(),
});


// Tabla canal_comercializacion
export const canal_comercializacion = pgTable('canal_comercializacion', {
  id: uuid('id').defaultRandom().primaryKey(),
  descripcion: varchar('descripcion', { length: 255 }),
});

// Tabla tipo_pago
export const tipo_pago = pgTable('tipo_pago', {
  id: uuid('id').defaultRandom().primaryKey(),
  descripcion: varchar('descripcion', { length: 255 }),
});

// Tabla tipo_unidad_habitacional (tipos: alquilable, ocupacional)
export const tipo_unidad_habitacional = pgTable('tipo_unidad_habitacional', {
  id: uuid('id').defaultRandom().primaryKey(),
  descripcion: varchar('descripcion', { length: 255 }),
});

// Tabla unidad_habitacional (ajustada a estructura real de Supabase)
export const unidad_habitacional = pgTable('unidad_habitacional', {
  id: uuid('id').defaultRandom().primaryKey(),

  capacidad_max: integer('capacidad_max'),
  capacidad_min: integer('capacidad_min'),
  cantidad_normal: integer('capacidad_normal'),

  camas_matrimonial: integer('camas_matrimonial'),
  camas_individual: integer('camas_individual'),

  pagina_turismo: varchar('pagina_turismo', { length: 255 }),
  de_que_pagina_es: varchar('de_que_pagina_es', { length: 255 }),
nombre: varchar('nombre', { length: 255 }),
  piso: integer('piso'),
  numero: integer('numero'),
  metros_cuadrados: doublePrecision('metros_cuadrados'),

  balcon: boolean('balcon'),
  cantidad_banos: integer('cantidad_banos'),
  cantidad_habitaciones: integer('cantidad_habitaciones'),

  check_limpieza: boolean('check_limpieza').default(false),
  tipo_habitacion_id: uuid('tipo_habitacion_id').references(() => tipo_habitacion.id),

  tipo_unidad_id: uuid('tipo_unidad_id').references(() => tipo_unidad_habitacional.id),
});

export const precio_habitacion = pgTable('precio_habitacion', {
  id: uuid('id').defaultRandom().primaryKey(),
  habitacion_id: uuid('habitacion_id').references(() => unidad_habitacional.id),
  monto: doublePrecision('monto').notNull(),
  fecha_actualizacion: timestamp('fecha_actualizacion').defaultNow(),
})


// Tabla estadia
export const estadia = pgTable('estadia', {
  id: uuid('id').defaultRandom().primaryKey(),
  nro_estadia: serial('nro_estadia').unique(),
  cantidad_personas: integer('cantidad_personas'),
  fecha_ingreso: date('fecha_ingreso'),
  fecha_egreso: date('fecha_egreso'),
  fecha_creacion: timestamp('fecha_creacion').defaultNow(),
  cochera: boolean('cochera').default(false),
  precio_por_noche: doublePrecision('precio_por_noche'),
  total: doublePrecision('total'),
  porcentaje_reserva: doublePrecision('porcentaje_reserva'),
  monto_reserva: doublePrecision('monto_reserva'),
  cliente_dni: varchar('cliente_dni', { length: 255 }).references(() => cliente.dni),
  desayuno: boolean('desayuno').default(false),
  pension_completa: boolean('pension_completa').default(false),
  pension_media: boolean('pension_media').default(false),
  all_inclusive: boolean('all_inclusive').default(false),
  canal_id: uuid('canal_id').references(() => canal_comercializacion.id),
  ropa_blanca: boolean('ropa_blanca').default(false),
  observaciones: varchar('observaciones', { length: 1000 }),
  habitacion_id: uuid('habitacion_id').references(() => unidad_habitacional.id),
  estado_id: uuid('estado_id').references(() => estado_estadia.id),
});

// Tabla pago
export const pago = pgTable('pago', {
  id: uuid('id').defaultRandom().primaryKey(),
  estadia_id: uuid('estadia_id').references(() => estadia.id),
  fecha_pago: timestamp('fecha_pago'),
  comprobante_pago: varchar('comprobante_pago', { length: 255 }),
  tipo_pago_id: uuid('tipo_pago_id').references(() => tipo_pago.id),
  monto: doublePrecision('monto'),
   forma_pago_id: uuid('forma_pago_id').references(() => forma_pago.id),
});

// Tabla limpieza
export const limpieza = pgTable('limpieza', {
  id: uuid('id').defaultRandom().primaryKey(),
  habitacion_id: uuid('habitacion_id').references(() => unidad_habitacional.id),
  fecha: date('fecha'),
  persona: varchar('persona', { length: 255 }),
  observacion: varchar('observacion', { length: 1000 }),
});

// Tabla mantenimiento
export const mantenimiento = pgTable('mantenimiento', {
  id: uuid('id').defaultRandom().primaryKey(),
  unidad_id: uuid('unidad_id').references(() => unidad_habitacional.id),
  persona: varchar('persona', { length: 255 }),
  observacion: varchar('observacion', { length: 1000 }),
});

// Tabla tipo_usuario
export const tipo_usuario = pgTable('tipo_usuario', {
  id: uuid('id').defaultRandom().primaryKey(),
  descripcion: varchar('descripcion', { length: 255 }),
});

// Tabla usuario
export const usuario = pgTable('usuario', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  nombre: varchar('nombre', { length: 255 }),
  contrasenia: varchar('contrasenia', { length: 255 }).notNull(), // 👈 agregado
});

export const estado_estadia = pgTable('estado_estadia', {
  id: uuid('id').defaultRandom().primaryKey(),
  nombre: varchar('nombre', { length: 255 }).notNull(),
});

export const item_precio = pgTable('item_precio', {
  id: uuid('id').defaultRandom().primaryKey(),
  nombre: varchar('nombre', { length: 255 }).notNull(), 
});

export const precio = pgTable('precio', {
  id: uuid('id').defaultRandom().primaryKey(),
  item_id: uuid('item_id').notNull().references(() => item_precio.id),
  monto: doublePrecision('monto').notNull(),
  desde: timestamp('desde').defaultNow(),
  hasta: timestamp('hasta'), 
});

export const tipo_habitacion = pgTable('tipo_habitacion', {
  id: uuid('id').defaultRandom().primaryKey(),
  nombre: varchar('nombre', { length: 255 }).notNull(),
});

export const forma_pago = pgTable('forma_pago', {
  id: uuid('id').defaultRandom().primaryKey(),
  descripcion: text('descripcion').notNull(),
});
export const huesped = pgTable('huesped', {
  id: uuid('id').defaultRandom().primaryKey(),
  estadia_id: uuid('estadia_id').notNull().references(() => estadia.id),
  nombre_completo: varchar('nombre_completo', { length: 255 }).notNull(),
  dni: varchar('dni', { length: 255 }).notNull(),
  fecha_nacimiento: date('fecha_nacimiento'),
  sexo: varchar('sexo', { length: 50 }), // puede ser 'masculino', 'femenino', 'otro', etc.

  foto_cara: varchar('foto_cara', { length: 255 }),
  dni_frente: varchar('dni_frente', { length: 255 }),
  dni_dorso: varchar('dni_dorso', { length: 255 }),
});
