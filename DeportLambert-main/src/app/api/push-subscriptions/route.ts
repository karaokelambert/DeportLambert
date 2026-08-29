import { NextResponse } from 'next/server';
export const dynamic = 'force-static';

/**
 * Tabla / Colección independiente en memoria (o adaptador para BD persistente)
 * para almacenar las suscripciones push de los dispositivos de forma totalmente
 * aislada de las tablas existentes del torneo (equipos, partidos, etc.).
 */
interface PushSubscriptionRecord {
  id: string;
  endpoint: string;
  keys?: {
    p256dh: string;
    auth: string;
  };
  createdAt: string;
  userAgent?: string;
}

// Estructura independiente push_subscriptions
const pushSubscriptionsStore: PushSubscriptionRecord[] = [];

// GET: Consultar cantidad de dispositivos suscritos (Solo Lectura)
export async function GET() {
  return NextResponse.json({
    success: true,
    collection: 'push_subscriptions',
    totalSubscriptions: pushSubscriptionsStore.length,
    subscriptions: pushSubscriptionsStore.map(s => ({
      id: s.id,
      endpoint: s.endpoint.slice(0, 40) + '...',
      createdAt: s.createdAt,
    })),
  });
}

// POST: Registrar una nueva suscripción de dispositivo
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { endpoint, keys, userAgent } = body;

    if (!endpoint) {
      return NextResponse.json(
        { success: false, error: 'Endpoint es requerido' },
        { status: 400 }
      );
    }

    // Evitar duplicados por endpoint
    const existingIndex = pushSubscriptionsStore.findIndex(s => s.endpoint === endpoint);
    const newRecord: PushSubscriptionRecord = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      endpoint,
      keys,
      userAgent: userAgent || request.headers.get('user-agent') || undefined,
      createdAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      pushSubscriptionsStore[existingIndex] = newRecord;
    } else {
      pushSubscriptionsStore.push(newRecord);
    }

    return NextResponse.json({
      success: true,
      message: 'Suscripción push registrada en push_subscriptions con éxito.',
      id: newRecord.id,
      totalActive: pushSubscriptionsStore.length,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error procesando solicitud de suscripción push' },
      { status: 500 }
    );
  }
}
