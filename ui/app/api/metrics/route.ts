import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    const timestamp = Date.now();

    // Prometheus format metrics
    const metrics = `
# HELP frontend_uptime_seconds Total uptime of the frontend service in seconds
# TYPE frontend_uptime_seconds counter
frontend_uptime_seconds ${uptime}

# HELP frontend_memory_usage_bytes Memory usage in bytes
# TYPE frontend_memory_usage_bytes gauge
frontend_memory_usage_bytes{type="rss"} ${memoryUsage.rss}
frontend_memory_usage_bytes{type="heapTotal"} ${memoryUsage.heapTotal}
frontend_memory_usage_bytes{type="heapUsed"} ${memoryUsage.heapUsed}
frontend_memory_usage_bytes{type="external"} ${memoryUsage.external}

# HELP frontend_health Status of the frontend service (1 for healthy, 0 for unhealthy)
# TYPE frontend_health gauge
frontend_health 1

# HELP frontend_timestamp_seconds Current timestamp
# TYPE frontend_timestamp_seconds gauge
frontend_timestamp_seconds ${Math.floor(timestamp / 1000)}

# HELP frontend_nodejs_version_info Node.js version information
# TYPE frontend_nodejs_version_info gauge
frontend_nodejs_version_info{version="${process.version}"} 1
`.trim();

    return new NextResponse(metrics, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  } catch {
    return new NextResponse('# Frontend metrics unavailable\n', {
      status: 503,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  }
}