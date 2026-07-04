import { SpanStatusCode, trace, type Attributes } from "@opentelemetry/api";

const tracer = trace.getTracer("rmovie");

export async function withSpan<T>(
  name: string,
  operation: () => Promise<T>,
  attributes?: Attributes,
): Promise<T> {
  return tracer.startActiveSpan(name, { attributes }, async (span) => {
    try {
      const result = await operation();
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.recordException(error instanceof Error ? error : String(error));
      span.setStatus({ code: SpanStatusCode.ERROR });
      throw error;
    } finally {
      span.end();
    }
  });
}
