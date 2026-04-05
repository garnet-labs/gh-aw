package telemetry

import (
	"context"
	"fmt"
	"os"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp"
	"go.opentelemetry.io/otel/sdk/resource"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.26.0"
	"go.opentelemetry.io/otel/trace"
)

const instrumentationName = "gh-aw"

// Tracer returns the gh-aw tracer. When no TracerProvider has been configured
// (i.e. InitTracerProvider was not called or OTEL_EXPORTER_OTLP_ENDPOINT is
// unset), the global no-op provider is used and all spans are silently
// discarded.
func Tracer() trace.Tracer {
	return otel.Tracer(instrumentationName)
}

// InitTracerProvider configures a TracerProvider that exports spans over OTLP
// HTTP when OTEL_EXPORTER_OTLP_ENDPOINT is set in the environment. The
// returned shutdown function must be called (typically via defer) to flush and
// stop the provider before the process exits.
//
// When OTEL_EXPORTER_OTLP_ENDPOINT is empty the function is a no-op: the
// global no-op TracerProvider is left in place and the returned shutdown
// function does nothing.
func InitTracerProvider(ctx context.Context) (shutdown func(context.Context) error, err error) {
	if os.Getenv("OTEL_EXPORTER_OTLP_ENDPOINT") == "" {
		// No OTLP endpoint configured: return a no-op shutdown function so
		// callers can always defer shutdown without needing to check nil.
		return func(_ context.Context) error { return nil }, nil
	}

	exporter, err := otlptracehttp.New(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to create OTLP trace exporter: %w", err)
	}

	res, err := resource.New(ctx,
		resource.WithAttributes(semconv.ServiceName(instrumentationName)),
		resource.WithFromEnv(),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create OTEL resource: %w", err)
	}

	tp := sdktrace.NewTracerProvider(
		sdktrace.WithBatcher(exporter),
		sdktrace.WithResource(res),
	)

	otel.SetTracerProvider(tp)

	return tp.Shutdown, nil
}
