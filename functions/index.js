const functions = require('firebase-functions');
const jsrsasign = require('jsrsasign');


// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest((request, response) => {
 response.send("Hello from Firebase!");
});



exports.getJwt = functions.https.onRequest((req, res)=>{
	// Header
	let header = {alg: "HS256", typ: "JWT"};

	// Payload
	let payload = {};

	// Reserved claims (metadata of the JWT)
	payload.iat = jsrsasign.jws.IntDate.get('now'); // Fecha de generación
	payload.exp = jsrsasign.jws.IntDate.get('now + 1day'); // Fecha de expiración

	// Private claims (our info we want to send)
	payload.secretCode = 'p4ssw0d';
	payload.currentState = 'purchase-cart';

	// Signature = (header + payload + secret_phrase) * alg
	let secret_phrase = 'spkcs8pem';
	let jwt = jsrsasign.jws.JWS.sign("HS256", JSON.stringify(header), JSON.stringify(payload), secret_phrase);

	// Enviar un JWT generado
	res.send(jwt);
})


exports.readJwt = functions.https.onRequest((req, res)=>{
	let jwt = req.body.jwt;
	let passphrase = req.body.passphrase;

	// Verificamos que el JWT y el passphrase coincidan
	// Eso quiere decir que la firma es válida
	let isValid = jsrsasign.jws.JWS.verifyJWT(jwt, passphrase, {alg: ['HS256']});

	if(isValid){
		// Mostrar el contenido del JWT
		let header = jsrsasign.jws.JWS.readSafeJSONString(
			jsrsasign.b64utoutf8(
				jwt.split('.')[0]
			)
		);
		let payload = jsrsasign.jws.JWS.readSafeJSONString(jsrsasign.b64utoutf8(jwt.split('.')[1]));

		let decoded = { header: header, payload: payload };

		res.send(decoded);
	}else{
		// Si no, mostramos un error
		res.send('La firma del JWT no es válida');
	}
})


