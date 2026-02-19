import { useEffect, useRef } from 'react';
import { useWorkflowStore } from '../stores/workflowStore';
import { generateMarkdown } from '../utils/markdownGenerator';
import { compile, isCompilerReady } from '../utils/compiler';

/**
 * Auto-compile hook that subscribes to workflow store changes,
 * debounces by 400ms, generates markdown, and compiles via WASM.
 */
export function useAutoCompile() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Subscribe to all state changes that affect the workflow output
    const unsubscribe = useWorkflowStore.subscribe((state, prevState) => {
      // Only recompile when workflow data changes (not UI state)
      const stateChanged =
        state.name !== prevState.name ||
        state.description !== prevState.description ||
        state.trigger !== prevState.trigger ||
        state.permissions !== prevState.permissions ||
        state.engine !== prevState.engine ||
        state.tools !== prevState.tools ||
        state.instructions !== prevState.instructions ||
        state.safeOutputs !== prevState.safeOutputs ||
        state.network !== prevState.network ||
        state.timeoutMinutes !== prevState.timeoutMinutes ||
        state.imports !== prevState.imports ||
        state.environment !== prevState.environment ||
        state.cache !== prevState.cache ||
        state.strict !== prevState.strict;

      if (!stateChanged) return;

      // Clear any pending debounce
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // Debounce 400ms
      timerRef.current = setTimeout(() => {
        const currentState = useWorkflowStore.getState();
        const markdown = generateMarkdown(currentState);

        // Update compiled markdown immediately
        currentState.setCompiledMarkdown(markdown);

        // Only compile via WASM if the compiler is ready
        if (!isCompilerReady()) return;

        currentState.setIsCompiling(true);

        compile(markdown)
          .then((result) => {
            const store = useWorkflowStore.getState();
            store.setCompiledYaml(result.yaml);
            store.setWarnings(result.warnings);
            store.setError(result.error);
            store.setIsCompiling(false);
          })
          .catch((err) => {
            const store = useWorkflowStore.getState();
            store.setError(err instanceof Error ? err.message : String(err));
            store.setIsCompiling(false);
          });
      }, 400);
    });

    return () => {
      unsubscribe();
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);
}
