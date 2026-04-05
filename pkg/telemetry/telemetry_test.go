//go:build !integration

package telemetry

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/trace"
)

func TestTracer_ReturnsTracer(t *testing.T) {
	tr := Tracer()
	require.NotNil(t, tr, "Tracer() should return a non-nil tracer")
}

func TestTracer_UsesGlobalProvider(t *testing.T) {
	tr := Tracer()
	// The global tracer provider's tracer for the same name should be equal
	globalTracer := otel.Tracer(instrumentationName)
	assert.Equal(t, tr, globalTracer, "Tracer() should use the global TracerProvider")
}

func TestInitTracerProvider_NoEndpoint(t *testing.T) {
	// Without OTEL_EXPORTER_OTLP_ENDPOINT set, InitTracerProvider should be a no-op
	t.Setenv("OTEL_EXPORTER_OTLP_ENDPOINT", "")

	ctx := context.Background()
	shutdown, err := InitTracerProvider(ctx)

	require.NoError(t, err, "InitTracerProvider should not return an error when endpoint is unset")
	require.NotNil(t, shutdown, "shutdown function should not be nil")

	// Shutdown should be a no-op and not error
	assert.NoError(t, shutdown(ctx), "no-op shutdown should not error")
}

func TestInitTracerProvider_NoEndpointLeavesNoopProvider(t *testing.T) {
	t.Setenv("OTEL_EXPORTER_OTLP_ENDPOINT", "")

	ctx := context.Background()
	_, err := InitTracerProvider(ctx)
	require.NoError(t, err, "InitTracerProvider should succeed without an endpoint")

	// The global provider should still produce valid (no-op) spans
	tr := Tracer()
	_, span := tr.Start(ctx, "test-span")
	require.NotNil(t, span, "span should not be nil")

	// A no-op span is not sampled
	assert.False(t, span.SpanContext().IsSampled(), "no-op span should not be sampled")
	span.End()
}

func TestInitTracerProvider_SpanContext(t *testing.T) {
	t.Setenv("OTEL_EXPORTER_OTLP_ENDPOINT", "")

	ctx := context.Background()
	_, err := InitTracerProvider(ctx)
	require.NoError(t, err)

	tr := Tracer()
	ctx2, span := tr.Start(ctx, "gh-aw.agent.execute")
	defer span.End()

	// Context should carry the span
	spanFromCtx := trace.SpanFromContext(ctx2)
	assert.Equal(t, span.SpanContext().SpanID(), spanFromCtx.SpanContext().SpanID(),
		"span embedded in context should match the started span")
}
