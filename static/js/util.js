/**
 * Create a query parameter string from a key and value
 *
 * @method createQueryParam
 * @param {String} key
 * @param {Variant} value
 * @returns {String}
 * URL safe serialized query parameter
 */
function createQueryParam(key, value) {
  return encodeURIComponent(key) + '=' + encodeURIComponent(value);
}

/**
 * Create a query string out of an object.
 * @method objectToQueryString
 * @param {Object} obj
 * Object to create query string from
 * @returns {String}
 * URL safe query string
 */
function objectToQueryString(obj) {
  var queryParams = [];

  for (var key in obj) {
    queryParams.push(createQueryParam(key, obj[key]));
  }

  return '?' + queryParams.join('&');
}

function decryptMyKeys(hex) {
  var pk = JSON.parse(localStorage.getItem('pk'));
  console.log('pk', pk)

  function hexStringToByte(str) {
    if (!str) {
      return new Uint8Array();
    }

    var a = [];
    for (var i = 0, len = str.length; i < len; i+=2) {
      a.push(parseInt(str.substr(i,2),16));
    }

    return new Uint8Array(a);
  }

  return window.crypto.subtle.importKey(
    "jwk", //can be "jwk" (public or private), "spki" (public only), or "pkcs8" (private only)
    pk,
    {   //these are the algorithm options
      name: "RSA-OAEP",
      hash: {name: "SHA-256"}, //can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
    },
    false, //whether the key is extractable (i.e. can be used in exportKey)
    ["decrypt"] //"encrypt" or "wrapKey" for public key import or
    //"decrypt" or "unwrapKey" for private key imports
  ).then(function (totallyPk) {
    console.log('totallyPk', totallyPk)
    return window.crypto.subtle.decrypt(
      {
        name: "RSA-OAEP",
        //label: Uint8Array([...]) //optional
      },
      totallyPk, //from generateKey or importKey above
      hexStringToByte(hex) //ArrayBuffer of the data
    )
      .then(function(decrypted){
        //returns an ArrayBuffer containing the decrypted data
        console.log(decrypted);
        console.log(new Uint8Array(decrypted));
        console.log('keys', new TextDecoder("utf-8").decode(new Uint8Array(decrypted)))
        //console.log('keys', keys)

      })
      .catch(function(err){
        console.error(err);
        throw err

      });



  })


}

function createKeyPair () {
  return window.crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 4096, //can be 1024, 2048, or 4096
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
      hash: {name: "SHA-256"}, //can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
    },
    true, //whether the key is extractable (i.e. can be used in exportKey)
    ["encrypt", "decrypt"] //must be ["encrypt", "decrypt"] or ["wrapKey", "unwrapKey"]
  )
    .then(function(key){
      //returns a keypair object
      console.log(key);
      console.log('key.publicKey', key.publicKey);
      console.log(key.privateKey);
      return key
    })
    .catch(function(err){
      console.error(err);
    });
}
