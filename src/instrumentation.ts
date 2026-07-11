export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const [{ NodeSDK }, { OTLPTraceExporter }, { PgInstrumentation }, resources, semantic] =
    await Promise.all([
    import("@opentelemetry/sdk-node"),
    import("@opentelemetry/exporter-trace-otlp-http"),
    import("@opentelemetry/instrumentation-pg"),
    import("@opentelemetry/resources"),
    import("@opentelemetry/semantic-conventions"),
    ]);
  const sdk = new NodeSDK({
    resource: resources.resourceFromAttributes({
      [semantic.ATTR_SERVICE_NAME]: process.env.OTEL_SERVICE_NAME || "rmovie",
    }),
    traceExporter: new OTLPTraceExporter(),
    instrumentations: [new PgInstrumentation()],
  });
  sdk.start();
}
