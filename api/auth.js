export default async function handler(req, res) {
  const client_id = process.env.OAUTH_GITHUB_CLIENT_ID;
  const client_secret = process.env.OAUTH_GITHUB_CLIENT_SECRET;
  const { code, provider } = req.query;

  if (!code) {
    // Redirect to GitHub OAuth
    const redirect_uri = `https://${req.headers.host}/api/auth`;
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&scope=repo,user`;
    return res.redirect(authUrl);
  }

  // Exchange code for token
  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ client_id, client_secret, code })
  });
  const data = await response.json();
  const token = data.access_token;

  // Return the token to the CMS via postMessage
  const script = `
    <script>
      window.opener.postMessage(
        'authorization:github:success:${JSON.stringify({ token, provider: 'github' })}',
        '*'
      );
    </script>
  `;
  return res.send(script);
}