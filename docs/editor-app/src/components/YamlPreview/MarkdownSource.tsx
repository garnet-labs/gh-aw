import { Highlight, themes } from 'prism-react-renderer';

export function MarkdownSource({ code }: { code: string }) {
  if (!code) {
    return (
      <div style={emptyStyle}>
        No markdown generated yet. Configure your workflow to see the source.
      </div>
    );
  }

  return (
    <Highlight theme={themes.github} code={code} language="yaml">
      {({ style, tokens, getLineProps, getTokenProps }) => (
        <pre style={{ ...style, ...preStyle }}>
          {tokens.map((line, i) => {
            const lineProps = getLineProps({ line });
            return (
              <div key={i} {...lineProps} style={{ ...lineProps.style, display: 'flex' }}>
                <span style={lineNumberStyle}>{i + 1}</span>
                <span style={{ flex: 1 }}>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </span>
              </div>
            );
          })}
        </pre>
      )}
    </Highlight>
  );
}

const preStyle: React.CSSProperties = {
  margin: 0,
  padding: '12px',
  fontSize: '13px',
  lineHeight: '1.6',
  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
  overflow: 'auto',
  minHeight: '100%',
};

const lineNumberStyle: React.CSSProperties = {
  display: 'inline-block',
  width: '40px',
  paddingRight: '12px',
  textAlign: 'right',
  color: '#8c959f',
  userSelect: 'none',
  flexShrink: 0,
};

const emptyStyle: React.CSSProperties = {
  padding: '24px',
  color: '#656d76',
  fontSize: '14px',
  textAlign: 'center',
};
