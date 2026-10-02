export async function GET() {
  const content = `User-agent: *\nAllow: /\nDisallow: /admin/\n`;
  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}
