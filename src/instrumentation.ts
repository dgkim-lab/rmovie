export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const [{ NodeSDK }, { OTLPTraceExporter }, resources, semantic] = await Promise.all([
    import("@opentelemetry/sdk-node"),
    import("@opentelemetry/exporter-trace-otlp-http"),
    import("@opentelemetry/resources"),
    import("@opentelemetry/semantic-conventions"),
  ]);
  const sdk = new NodeSDK({
    resource: resources.resourceFromAttributes({
      [semantic.ATTR_SERVICE_NAME]: process.env.OTEL_SERVICE_NAME || "rmovie",
    }),
    traceExporter: new OTLPTraceExporter(),
  });
  sdk.start();
}
