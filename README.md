# HeProT website

A static HTML, CSS and JavaScript site that can be published with GitHub Pages. It has no build step, server, or database dependency.

## Publish with GitHub Pages

1. Create a GitHub repository for the site.
2. Upload the **contents** of this `outputs` folder to the repository root, including `index.html`, `styles.css`, `script.js`, `config.js`, `supabase-config.js`, `supabase-client.js`, `logo.png`, and `.nojekyll`.
3. In the repository, open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**, select `main` and `/(root)`, then save.
5. GitHub will show the published site URL in the Pages settings when deployment completes.

All local site files use relative paths, so this folder works at the repository root and on GitHub Pages.

## WhatsApp invite link

The WhatsApp community invite is configured in `config.js`. To change it later, replace `whatsappInviteLink` with the new official invite URL.

## Supabase browser client

The site dynamically imports the official `@supabase/supabase-js` v2 browser ES module from jsDelivr and initializes one reusable client as `window.heprotSupabase`. The project URL and publishable key are in `supabase-config.js`. These browser-facing settings are public by design; never put a Supabase secret key, service-role key, or database password in this folder.

No database tables, forms, or membership submissions are configured.

### Safely check the connection

After the page is deployed to GitHub Pages, hard-refresh the site, open your browser's Developer Tools console, and run:

```js
await window.heprotSupabaseReady;
console.log(typeof window.heprotSupabase); // should print "object"
console.log(window.heprotSupabaseInitError || 'Client initialized');
```

If the result is not `object`, check the browser Console and Network panels for a failed `supabase-client.js` or jsDelivr request. Confirm both `supabase-client.js` and `supabase-config.js` were uploaded to the GitHub Pages published folder.

Then run the read-only connection check:

```js
const { url, publishableKey } = window.HEPROT_SUPABASE_CONFIG;
const response = await fetch(`${url}/auth/v1/health`, {
  headers: { apikey: publishableKey }
});
console.log(response.status, await response.json());
```

A `200` response with Auth service information confirms that the browser reached your Supabase project with the publishable key. This is a read-only health check; it does not access table data or write anything. It does not test database permissions because no tables or database operations are set up yet.

## External assets

The hero photo is served by Unsplash and the web fonts are served by Google Fonts, so those two items need an internet connection. The hero photo is free to use under the Unsplash License. Its source is https://unsplash.com/photos/team-stacking-hands-together-in-unity-UdDjFekHQuk.


