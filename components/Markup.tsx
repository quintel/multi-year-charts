import sanitizeHtml from 'sanitize-html';

// Handle setting carrying markup, such as the 2 in CO<sub>2</sub>
export default function Markup({ children }: { children: string }) {
  return (
    <span
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(children, { allowedTags: ['sub', 'sup'] }) }}
    />
  );
}
