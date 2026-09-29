# Configuracion de MercadoPago - MockMaster

Esta guia te lleva paso a paso para configurar MercadoPago como metodo de pago para suscripciones.

---

## Checklist de Configuracion

### 1. Activar Credenciales de Produccion

- [ ] Ir a [Panel de Desarrolladores](https://www.mercadopago.com.ar/developers/panel/app/245622864092506)
- [ ] Click en "Credenciales de produccion"
- [ ] Verificar etapa actual (debe ser 5 de 5 para usar produccion)
- [ ] Si no esta en 5 de 5, completar los requisitos pendientes

**Requisitos por etapa:**

| Etapa | Requisito | Estado |
|-------|-----------|--------|
| 1 | Crear cuenta MercadoPago | Completado |
| 2 | Crear aplicacion | Completado (MockMaster) |
| 3 | Completar datos de la app | Pendiente |
| 4 | Recibir un pago productivo | Pendiente |
| 5 | Activacion automatica | Se activa al completar etapa 4 |

---

### 2. Completar Etapa 3: Datos de la App

- [ ] Ir a [Editar aplicacion](https://www.mercadopago.com.ar/developers/panel/app/245622864092506)
- [ ] Completar descripcion de la aplicacion
- [ ] Subir logo (opcional pero recomendado)
- [ ] Agregar URL del sitio: `https://mockmastercv.com`

---

### 3. Completar Etapa 4: Recibir un Pago

Para activar credenciales de produccion, necesitas recibir al menos un pago real.

#### Opcion A: Link de Pago (Recomendada)

1. [ ] Ir a [Crear Link de Pago](https://www.mercadopago.com.ar/tools/create)
2. [ ] Crear un link de pago de $100 ARS
3. [ ] Compartir el link con un amigo o familiar
4. [ ] Pedirle que complete el pago
5. [ ] Verificar que el pago se acredito

#### Opcion B: Segunda Cuenta

1. [ ] Crear cuenta MercadoPago con otro email (puede ser `tuemail+mp2@gmail.com`)
2. [ ] Crear link de pago desde tu cuenta principal
3. [ ] Pagar desde la segunda cuenta

#### Opcion C: Contactar Soporte

1. [ ] Ir a [Ayuda MercadoPago](https://www.mercadopago.com.ar/ayuda)
2. [ ] Explicar que necesitas activar credenciales para integracion de suscripciones
3. [ ] Solicitar activacion manual

---

### 4. Obtener Credenciales de Produccion

Una vez completada la etapa 4:

- [ ] Ir a [Credenciales](https://www.mercadopago.com.ar/developers/panel/app/245622864092506/credentials)
- [ ] Copiar **Public Key** (empieza con `APP_USR-`)
- [ ] Copiar **Access Token** (empieza con `APP_USR-`)

**Tus credenciales:**

```
Public Key:    APP_USR-________________________________
Access Token:  APP_USR-________________________________
```

---

### 5. Configurar Variables de Entorno

#### En `.env.local` (desarrollo local)

- [ ] Agregar al archivo `.env.local`:

```env
# MercadoPago (Produccion)
MP_PUBLIC_KEY=APP_USR-tu-public-key-aqui
MP_ACCESS_TOKEN=APP_USR-tu-access-token-aqui
MP_WEBHOOK_SECRET=
```

#### En Vercel (produccion)

- [ ] Ir a [Vercel Dashboard](https://vercel.com) > Tu proyecto > Settings > Environment Variables
- [ ] Agregar `MP_PUBLIC_KEY` con tu Public Key
- [ ] Agregar `MP_ACCESS_TOKEN` con tu Access Token
- [ ] Agregar `MP_WEBHOOK_SECRET` (se configura en el siguiente paso)

---

### 6. Configurar Webhook (IMPORTANTE)

El webhook es necesario para que MercadoPago notifique a tu app cuando un usuario completa una suscripcion.

**Paso a paso:**

1. [ ] Ir a [Configuracion de Webhooks](https://www.mercadopago.com.ar/developers/panel/app/245622864092506/webhooks)
2. [ ] Click en "Agregar URL" o "Configurar notificaciones"
3. [ ] En **URL de produccion**, pegar: `https://mockmastercv.com/api/subscriptions/webhook`
4. [ ] En **Eventos**, marcar los siguientes:
   - [x] `subscription_preapproval` - Cuando se crea/actualiza una suscripcion
   - [x] `subscription_authorized_payment` - Cuando se procesa un pago de suscripcion
5. [ ] Click en "Guardar"

**Nota:** El webhook secret es opcional pero recomendado. Si lo configuras, agregalo a las variables de entorno.

**Tu Webhook Secret (opcional):**

```
Webhook Secret: ________________________________
```

- [ ] Agregar `MP_WEBHOOK_SECRET` a `.env.local` (si lo configuraste)
- [ ] Agregar `MP_WEBHOOK_SECRET` en Vercel (si lo configuraste)

---

### 7. Deploy y Prueba

- [ ] Hacer deploy a Vercel (se hace automatico con push a main)
- [ ] Ir a `https://mockmastercv.com/billing`
- [ ] Iniciar sesion con una cuenta de usuario
- [ ] Click en "Comenzar prueba gratis" o "Upgrade"
- [ ] Completar el pago en MercadoPago
- [ ] Verificar que vuelve a `/billing?success=true`
- [ ] Verificar que el plan cambio a Pro

---

## Verificacion Final

- [ ] Las credenciales estan en etapa 5 de 5
- [ ] `.env.local` tiene MP_ACCESS_TOKEN, MP_PUBLIC_KEY, MP_WEBHOOK_SECRET
- [ ] Vercel tiene las mismas 3 variables configuradas
- [ ] El webhook esta configurado con la URL correcta
- [ ] Un pago de prueba funciono correctamente

---

## Tarjetas de Prueba (Argentina)

Para probar con credenciales TEST:

| Tipo | Numero | CVV | Vencimiento | Nombre |
|------|--------|-----|-------------|--------|
| Aprobada | 5031 7557 3453 0604 | 123 | 11/25 | APRO |
| Rechazada | 5031 7557 3453 0604 | 123 | 11/25 | OTHE |

---

## URLs Importantes

- [Panel de la App](https://www.mercadopago.com.ar/developers/panel/app/245622864092506)
- [Credenciales](https://www.mercadopago.com.ar/developers/panel/app/245622864092506/credentials)
- [Webhooks](https://www.mercadopago.com.ar/developers/panel/app/245622864092506/ipn)
- [Documentacion Suscripciones](https://www.mercadopago.com.ar/developers/es/docs/subscriptions/landing)
- [Crear Link de Pago](https://www.mercadopago.com.ar/tools/create)

---

## Troubleshooting

### Error "Internal server error" al crear suscripcion

- Verificar que las credenciales son de produccion (empiezan con `APP_USR-`)
- Verificar que la aplicacion tiene el producto "Suscripciones" habilitado
- Verificar que las credenciales estan en etapa 5 de 5

### El webhook no actualiza el estado

- Verificar que la URL del webhook es correcta
- Verificar que `MP_WEBHOOK_SECRET` esta configurado
- Revisar logs en Vercel para ver errores

### Error "Invalid back_url"

- MercadoPago no acepta `localhost` como back_url
- Usar la URL de produccion: `https://mockmastercv.com`

### El usuario no es redirigido despues del pago

- Verificar que `NEXT_PUBLIC_APP_URL` esta configurado correctamente
- La URL debe ser exactamente: `https://mockmastercv.com` (sin `/` al final)
- Si el problema persiste, configurar el back_url directamente en el plan:
  1. Ir a [Planes de Suscripcion](https://www.mercadopago.com.ar/subscription-plans)
  2. Editar el plan MockMasterCV Pro
  3. Configurar URL de retorno: `https://mockmastercv.com/billing?success=true`

### El estado del usuario no se actualiza a Pro

- Verificar que el webhook esta configurado correctamente
- Revisar logs en Vercel > Deployments > Functions > api/subscriptions/webhook
- El webhook debe recibir el evento `subscription_preapproval` con status `authorized`
