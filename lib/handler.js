/**
 * Cloudfront Function to rewrite URLs.
 *
 * Enables navigation to files in subdirectories (/games/game1) without having to include the
 * index.html filename in the url.
 *
 * example: 
 *   /games/hilton_head_2024 -> /games/hilton_head_2024/index.html
 */
async function handler(event) {
  const request = event.request;
  const uri = request.uri;

  // Check whether the URI is missing a file name.
  if (uri.endsWith('/')) {
    request.uri += 'index.html';
  }
  // Check whether the URI is missing a file extension.
  else if (!uri.includes('.')) {
    request.uri += '/index.html';
  }

  return request;
}
