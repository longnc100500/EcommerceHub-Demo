# Fiserv Payment API Demo

## Setup

- Install [NodeJs](https://nodejs.org/en/)
- Install [Yarn](https://yarnpkg.com/)
- Open 2 terminals, one in 'api' and one in 'www'
- Run 'yarn install' inside of 'www'
- Run 'npm install' inside of 'api'

## Running

- Run 'node server.js' inside of 'api'
- Run 'yarn start' inside of 'www'
- Visit 'http://localhost:3000/'

# Fiserve Charge Flow!

**Common:**
All request must be encrypted before calling any api

```js
function fiservEncode(method, url, body, callback) {
  var ClientRequestId = uuid.v4()
  var time = new Date().getTime()
  var requestBody = JSON.stringify(body)
  if (method === "GET") {
    requestBody = ""
  }
  var rawSignature = apiKey + ClientRequestId + time + requestBody
  var computedHash = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, apiSecret)
  computedHash.update(rawSignature)
  computedHash = computedHash.finalize()
  var computedHmac = b64encode(computedHash.toString())
  var options = {
    method: method,
    url,
    headers: {
      "Content-Type": "application/json",
      "Client-Request-Id": ClientRequestId,
      "Api-Key": apiKey,
      Timestamp: time.toString(),
      "Accept-Language": "en-US",
      Authorization: computedHmac,
      "Auth-Token-Type": "HMAC"
    },
    body: JSON.stringify(body)
  }
  callback(options)
}
```

Step 1: Create credential
Path: "/payments-vas/v1/security/credentials"

```js
const body = {
  domains: [
    {
      url: "http://google.com"
    }
  ],
  merchantDetails: {
    merchantId: merchantId,
    terminalId: terminalId
  }
}
```

> The response will include **"sessionId",** **"publicKey"**, **"keyId"**. FE will use that key to fill out the Iframe and show up the input card information form.

Step2: Create Payment Token
Use the previous sessionId to create payment token
Path: "payments-vas/v1/tokens"

```js
const body = {
  source: {
    sourceType: "PaymentSession",
    sessionId: "session_id_here"
  },
  merchantDetails: {
    merchantId: merchantId,
    terminalId: terminalId,
    tokenType: "AB01"
  }
}
```

> The response will include **"tokenData"**, **"tokenSource",** **"expirationMonth",** **"expirationYear".** Perhaps these fields should be stored in the DB for future use

Step3: Create Charge
Use the information from the previous steps to create a charge request

```js
const body = {
  amount: {
    total: 12,
    currency: "USD"
  },
  source: {
    sourceType: "PaymentToken",
    tokenData: "token_data_here",
    PARId: "1234", //not required,
    declineDuplicates: true, //not required
    tokenSource: "token_source_here",
    card: {
      expirationMonth: "expiration_month_here",
      expirationYear: "expiration_year_here"
    },
    transactionDetails: {
      captureFlag: true
    },
    transactionInteraction: {
      origin: "ECOM",
      eciIndicator: "CHANNEL_ENCRYPTED",
      posConditionCode: "CARD_NOT_PRESENT_ECOM"
    },
    merchantDetails: {
      merchantId: merchantId,
      terminalId: terminalId,
      tokenType: "AB01"
    }
  }
}
```

> After this request i receiver the success notification but i don't see the redirect URL
