import { randomUUID } from "node:crypto";
import { SpanStatusCode, trace, type Attributes } from "@opentelemetry/api";
import type { Session } from "next-auth";

const tracer = trace.getTracer("rmovie");
const errorContexts = new WeakMap<Error, ErrorTraceContext>();

export interface ErrorTraceContext {
  errorId: string;
  traceId: string;
  spanId: string;
}

export function getErrorTraceContext(error: unknown): ErrorTraceContext | undefined {
  return error instanceof Error ? errorContexts.get(error) : undefined;
}

export function endUserAttributes(session: Session): Attributes {
  const attributes: Attributes = { "enduser.id": session.user.id };
  // Email is PII. Keep this explicit so operators can redact user.email in the
  // OpenTelemetry Collector if their retention or access policy requires it.
  if (session.user.email) attributes["user.email"] = session.user.email;
  return attributes;
}

export function annotateActiveSpanWithEndUser(session: Session) {
  trace.getActiveSpan()?.setAttributes(endUserAttributes(session));
}

export async function withSpan<T>(
  name: string,
  operation: () => Promise<T>,
  attributes?: Attributes,
): Promise<T> {
  const parentSpan = trace.getActiveSpan();
  return tracer.startActiveSpan(name, { attributes }, async (span) => {
    try {
      const result = await operation();
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      const exception = error instanceof Error ? error : new Error(String(error));
      const errorId = randomUUID();
      const spanContext = span.spanContext();
      const context = {
        errorId,
        traceId: spanContext.traceId,
        spanId: spanContext.spanId,
      };
      errorContexts.set(exception, context);
      span.recordException(exception);
      const errorAttributes = {
        "error.type": exception.name,
        "error.message": exception.message,
        "error": true,
        "rmovie.error.id": errorId,
      };
      span.setAttributes(errorAttributes);
      span.setStatus({ code: SpanStatusCode.ERROR, message: exception.message });
      // The application converts domain errors into HTTP responses. Mark the
      // enclosing Next.js request span too, otherwise Jaeger can show the root
      // request as successful while only a nested span is red.
      parentSpan?.setAttributes(errorAttributes);
      parentSpan?.setStatus({ code: SpanStatusCode.ERROR, message: exception.message });
      throw exception;
    } finally {
      span.end();
    }
  });
}
