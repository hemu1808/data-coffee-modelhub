'use client';

import React, { useMemo } from 'react';
import DOMPurify from 'isomorphic-dompurify';
import { cn } from '../../lib/utils';

interface SafeHTMLProps {
  html: string;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

/**
 * Renders HTML content safely using DOMPurify sanitization.
 * Replaces all dangerouslySetInnerHTML usage across the app.
 */
export function SafeHTML({ html, className, as: Tag = 'div' }: SafeHTMLProps) {
  const sanitized = useMemo(
    () =>
      DOMPurify.sanitize(html, {
        ALLOWED_TAGS: [
          'p', 'br', 'b', 'strong', 'i', 'em', 'u', 'a',
          'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4',
          'code', 'pre', 'blockquote', 'span', 'div',
          'table', 'thead', 'tbody', 'tr', 'th', 'td',
          'hr', 'sup', 'sub',
        ],
        ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'id'],
        ADD_ATTR: ['target'],
      }),
    [html]
  );

  return (
    <Tag
      className={cn('prose-hub', className)}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
