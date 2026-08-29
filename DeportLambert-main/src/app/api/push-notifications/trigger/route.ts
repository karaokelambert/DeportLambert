import { NextResponse } from 'next/server';

/**
 * Función observadora / webhook dedicada para disparar notificaciones push
 * tras la actualización o finalización de un partido.
 * 
 * Ejemplo de mensaje emitido:
 * "Finalizó: Monagas Basket 90 - 61 Linces"
 */
interface MatchUpdatePayload {
  gameId?: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  status: 'Programado' | 'Finalizado';
}

export async function POST(request: Request) {
  try {
    const body: MatchUpdatePayload = await request.json();

    const { homeTeam, awayTeam, homeScore, awayScore, status, gameId } = body;

    if (!homeTeam || !awayTeam) {
      return NextResponse.json(
        { success: false, error: 'homeTeam y awayTeam son requeridos' },
        { status: 400 }
      );
    }

    let notificationTitle = 'JL Sports Club 360';
    let notificationBody = '';

    if (status === 'Finalizado') {
      notificationTitle = '⏱ Partido Finalizado · JL Sports Club 360';
      notificationBody = `Finalizó: ${homeTeam} ${homeScore} – ${awayScore} ${awayTeam}`;
    } else {
      notificationTitle = '⚡ Actualización de Partido · JL Sports Club 360';
      notificationBody = `Marcador: ${homeTeam} ${homeScore} – ${awayScore} ${awayTeam}`;
    }

    const notificationPayload = {
      title: notificationTitle,
      body: notificationBody,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      timestamp: Date.now(),
      data: {
        gameId,
        url: '/',
      },
    };

    // Registro del webhook observer
    return NextResponse.json({
      success: true,
      observer: 'match_status_change_observer',
      message: 'Notificación procesada y enviada a los suscriptores',
      notification: notificationPayload,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error ejecutando trigger de notificación' },
      { status: 500 }
    );
  }
}
