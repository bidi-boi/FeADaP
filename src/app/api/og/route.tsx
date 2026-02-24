import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // ?completed=...&total=...
    const hasCompleted = searchParams.has('completed');
    const hasTotal = searchParams.has('total');

    // Parse completed and total, defaulting to 0
    const completedRaw = hasCompleted && searchParams.get('completed')
      ? parseInt(searchParams.get('completed')!)
      : 0;
    const totalRaw = hasTotal && searchParams.get('total')
      ? parseInt(searchParams.get('total')!)
      : 0;

    const completed = isNaN(completedRaw) ? 0 : completedRaw;
    const total = isNaN(totalRaw) ? 0 : totalRaw;

    const percentage = total === 0 ? 0 : (completed / total) * 100;

    // Logic for styling
    // Default Red (Needs a Push)
    let bgGradient = 'linear-gradient(to bottom right, #ef4444, #b91c1c)';
    let statusText = "Needs a Push";
    let emoji = "🔴";

    if (percentage >= 100) {
        // Green (Done)
        bgGradient = 'linear-gradient(to bottom right, #22c55e, #15803d)';
        statusText = "Done!";
        emoji = "☑️";
    } else if (percentage > 80) {
        // Green (Crushing It)
        bgGradient = 'linear-gradient(to bottom right, #22c55e, #15803d)';
        statusText = "Crushing It";
        emoji = "🟢";
    } else if (percentage >= 40) {
        // Yellow (Grinding)
        bgGradient = 'linear-gradient(to bottom right, #eab308, #a16207)';
        statusText = "Grinding";
        emoji = "🟡";
    }

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundImage: bgGradient,
            color: 'white',
            fontFamily: 'sans-serif',
          }}
        >
          <div
             style={{
                 display: 'flex',
                 flexDirection: 'column',
                 alignItems: 'center',
                 justifyContent: 'center',
                 backgroundColor: 'rgba(255, 255, 255, 0.15)',
                 borderRadius: '32px',
                 padding: '60px 80px',
                 boxShadow: '0 8px 60px rgba(0,0,0,0.2)',
                 border: '2px solid rgba(255,255,255,0.3)',
                 minWidth: '600px'
             }}
          >
              <div style={{ fontSize: 100, marginBottom: 20 }}>{emoji}</div>
              <div style={{ fontSize: 80, fontWeight: 900, marginBottom: 10, textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
                {statusText}
              </div>
              <div style={{ fontSize: 36, fontWeight: 500, opacity: 0.95, marginTop: 20 }}>
                Completed {completed} out of {total} tasks today.
              </div>

              <div style={{
                  marginTop: 40,
                  width: '100%',
                  height: 16,
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  borderRadius: 8,
                  overflow: 'hidden',
                  display: 'flex'
              }}>
                  <div style={{
                      width: `${percentage}%`,
                      height: '100%',
                      backgroundColor: 'white',
                      borderRadius: 8
                  }} />
              </div>
          </div>

          <div style={{ position: 'absolute', bottom: 40, opacity: 0.8, fontSize: 24, fontWeight: 600 }}>
            Fe-Accountability Dashboard
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
