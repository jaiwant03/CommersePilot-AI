import React from 'react';

// Helper to parse inline markdown: **bold**, *italic*, `code`, and currency/badges
export const renderInlineMarkdown = (text) => {
  if (!text) return null;

  const parts = [];
  let key = 0;

  // Regex matching `code`, **bold**, or *italic*
  const tokenRegex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let match;
  let lastIndex = 0;

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={key++}>{text.substring(lastIndex, match.index)}</span>);
    }

    const token = match[0];
    if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code
          key={key++}
          style={{
            background: 'rgba(2, 132, 199, 0.08)',
            border: '1px solid rgba(2, 132, 199, 0.22)',
            color: '#0284C7',
            padding: '2px 7px',
            borderRadius: '5px',
            fontFamily: 'monospace',
            fontSize: '12px',
            fontWeight: 700
          }}
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={key++} style={{ fontWeight: 700, color: '#0F172A' }}>
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(<em key={key++}>{token.slice(1, -1)}</em>);
    }

    lastIndex = tokenRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(<span key={key++}>{text.substring(lastIndex)}</span>);
  }

  return parts.length > 0 ? parts : text;
};

// Parser for whole assistant markdown output
const FormattedAssistantMessage = ({ content }) => {
  if (!content) return null;

  const lines = content.split('\n');
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    // 1. Skip empty lines
    if (!line) {
      i++;
      continue;
    }

    // 2. Detect Markdown Table
    if (line.startsWith('|') && line.endsWith('|')) {
      const tableLines = [];
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }

      if (tableLines.length >= 2) {
        // Table line 0 is header, line 1 is divider
        const parseRow = (rowStr) => {
          return rowStr
            .slice(1, -1)
            .split('|')
            .map((cell) => cell.trim());
        };

        const headers = parseRow(tableLines[0]);
        // Filter out divider row (contains only dashes, colons, spaces)
        const dataRows = tableLines.slice(1)
          .filter((row) => !/^\|[\s:\-\|]+\|$/.test(row))
          .map(parseRow);

        blocks.push({
          type: 'table',
          headers,
          rows: dataRows
        });
        continue;
      }
    }

    // 3. Detect Headings (# Heading, ## Heading, ### Heading)
    if (line.startsWith('#')) {
      const level = line.match(/^#+/)[0].length;
      const text = line.replace(/^#+\s*/, '');
      blocks.push({
        type: 'heading',
        level,
        text
      });
      i++;
      continue;
    }

    // 4. Detect Alert Callout (starts with 🚨, ⚠️, or **🚨, **⚠️)
    if (/^(\*\*|\s)*(🚨|⚠️|ALERT)/i.test(line)) {
      blocks.push({
        type: 'alert',
        text: line
      });
      i++;
      continue;
    }

    // 5. Detect Lists (* item, - item, • item)
    if (/^[\*\-•]\s+/.test(line)) {
      const listItems = [];
      while (i < lines.length && /^[\*\-•]\s+/.test(lines[i].trim())) {
        listItems.push(lines[i].trim().replace(/^[\*\-•]\s+/, ''));
        i++;
      }
      blocks.push({
        type: 'unordered-list',
        items: listItems
      });
      continue;
    }

    // 6. Detect Numbered Lists (1. item, 2. item)
    if (/^\d+\.\s+/.test(line)) {
      const listItems = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        listItems.push(lines[i].trim().replace(/^\d+\.\s+/, ''));
        i++;
      }
      blocks.push({
        type: 'ordered-list',
        items: listItems
      });
      continue;
    }

    // 7. Detect Note footer (*Note: or *Operational Note)
    if (/^\*Note:|\*Operational Note/i.test(line)) {
      blocks.push({
        type: 'note',
        text: line.replace(/^\*+|\*+$/g, '')
      });
      i++;
      continue;
    }

    // 8. Regular paragraph
    blocks.push({
      type: 'paragraph',
      text: line
    });
    i++;
  }

  return (
    <div className="formatted-assistant-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {blocks.map((b, idx) => {
        switch (b.type) {
          case 'table':
            return (
              <div
                key={idx}
                style={{
                  margin: '14px 0',
                  borderRadius: '12px',
                  border: '1.5px solid #E2E8F0',
                  background: '#FFFFFF',
                  overflowX: 'auto',
                  boxShadow: '0 4px 14px -3px rgba(15, 23, 42, 0.06)'
                }}
              >
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    textAlign: 'left',
                    minWidth: '580px',
                    fontSize: '13px'
                  }}
                >
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
                      {b.headers.map((h, hIdx) => (
                        <th
                          key={hIdx}
                          style={{
                            padding: '11px 14px',
                            fontWeight: 700,
                            color: '#1E293B',
                            fontSize: '12px',
                            letterSpacing: '0.02em',
                            whiteSpace: 'nowrap',
                            textAlign: /margin|revenue|profit|units|sold|price/i.test(h) ? 'right' : 'left'
                          }}
                        >
                          {renderInlineMarkdown(h)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {b.rows.map((row, rIdx) => (
                      <tr
                        key={rIdx}
                        style={{
                          borderBottom: rIdx === b.rows.length - 1 ? 'none' : '1px solid #F1F5F9',
                          background: rIdx % 2 === 1 ? 'rgba(248, 250, 252, 0.65)' : '#FFFFFF',
                          transition: 'background 0.15s ease'
                        }}
                      >
                        {row.map((cell, cIdx) => {
                          const headerText = b.headers[cIdx] || '';
                          const isNumericCol = /margin|revenue|profit|units|sold|price/i.test(headerText);
                          return (
                            <td
                              key={cIdx}
                              style={{
                                padding: '10px 14px',
                                color: '#334155',
                                textAlign: isNumericCol ? 'right' : 'left',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {renderInlineMarkdown(cell)}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );

          case 'heading':
            if (b.level === 1) {
              return (
                <h3 key={idx} style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: '14px 0 6px' }}>
                  {renderInlineMarkdown(b.text)}
                </h3>
              );
            }
            if (b.level === 2) {
              return (
                <h4 key={idx} style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: '12px 0 6px' }}>
                  {renderInlineMarkdown(b.text)}
                </h4>
              );
            }
            return (
              <h5
                key={idx}
                style={{
                  fontSize: '14.5px',
                  fontWeight: 700,
                  color: '#1E293B',
                  margin: '12px 0 4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {renderInlineMarkdown(b.text)}
              </h5>
            );

          case 'alert':
            return (
              <div
                key={idx}
                style={{
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1.5px solid rgba(239, 68, 68, 0.28)',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  margin: '8px 0',
                  color: '#991B1B',
                  fontWeight: 600,
                  fontSize: '13.5px',
                  lineHeight: 1.5
                }}
              >
                {renderInlineMarkdown(b.text)}
              </div>
            );

          case 'unordered-list':
            return (
              <ul
                key={idx}
                style={{
                  margin: '4px 0 8px',
                  paddingLeft: '22px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  fontSize: '13px',
                  color: '#334155',
                  lineHeight: 1.55
                }}
              >
                {b.items.map((it, itIdx) => (
                  <li key={itIdx}>{renderInlineMarkdown(it)}</li>
                ))}
              </ul>
            );

          case 'ordered-list':
            return (
              <ol
                key={idx}
                style={{
                  margin: '4px 0 8px',
                  paddingLeft: '22px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  fontSize: '13px',
                  color: '#334155',
                  lineHeight: 1.55
                }}
              >
                {b.items.map((it, itIdx) => (
                  <li key={itIdx}>{renderInlineMarkdown(it)}</li>
                ))}
              </ol>
            );

          case 'note':
            return (
              <div
                key={idx}
                style={{
                  fontSize: '12px',
                  color: '#64748B',
                  fontStyle: 'italic',
                  borderLeft: '3px solid #CBD5E1',
                  paddingLeft: '10px',
                  margin: '8px 0',
                  lineHeight: 1.5
                }}
              >
                {renderInlineMarkdown(b.text)}
              </div>
            );

          case 'paragraph':
          default:
            return (
              <p
                key={idx}
                style={{
                  margin: '0',
                  fontSize: '13.5px',
                  lineHeight: 1.6,
                  color: '#334155'
                }}
              >
                {renderInlineMarkdown(b.text)}
              </p>
            );
        }
      })}
    </div>
  );
};

export default FormattedAssistantMessage;
