//These libraries are for the running of this API.
const express = require("express")
const router = express.Router()
var request = require("request")
var CryptoJS = require("crypto-js")
const uuid = require("uuid")
const { b64encode } = require("./utils")

//These are the API keys and token for generating an encrypted message
const apiKey = "MI9EWlUQ9bMnTvUCbPcMiy5GbYnwo8tV"
const apiSecret = "aLS4AkBhjSJvq8m8cGQ6KzgaGbl28yW3aczF8lYP4Hf"
const url = "https://cert.api.fiservapps.com/ch"
const merchantId = "100008000306136"
const terminalId = "10000001"

//When ever you communicate with IPG you need to encrypt the body of the message. This function modifies the API call to include the correct message signatures.
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

//Create Credential
router.post("/credential/create", async (req, res) => {
  const body = {
    domains: [
      {
        url: "http://localhost:3124"
        //Maybe this is url redirect when suceess or faile
      }
    ],
    merchantDetails: {
      merchantId: merchantId,
      terminalId: terminalId
    }
  }
  fiservEncode(
    "POST",
    url + "/payments-vas/v1/security/credentials",
    body,
    (options) => {
      //Submit the API call to Fiserv
      request(options, function (error, paymentResponse) {
        if (error) throw new Error(error)
        let creadential = JSON.parse(paymentResponse.body)
        //Save to db ??
        return res.status(200).json({
          requestName: "Create Creadentital Success",
          ...creadential
        })
      })
    }
  )
})

// Create Payment Token use for future request
router.post("/token/create", async (req, res) => {
  const sessionId = req.body?.sessionId
  const body = {
    source: {
      sourceType: "PaymentSession",
      sessionId: sessionId
    },
    merchantDetails: {
      merchantId: merchantId,
      terminalId: terminalId,
      tokenType: "AB01"
    }
  }
  fiservEncode("POST", url + "/payments-vas/v1/tokens", body, (options) => {
    //Submit the API call to Fiserv
    request(options, function (error, tokenResponse) {
      if (error) throw new Error(error)
      let data = JSON.parse(tokenResponse.body)
      return res.status(200).json({
        requestName: "Create token Success",
        data: data
      })
    })
  })
})

//Step 3: Create Charge Request With PaymentSession
router.post("/charge/create", async (req, res) => {
  //Start by encoding the message.
  const sessionId = req.body?.sessionId
  const total = req.body?.total
  const body = {
    amount: {
      total: total,
      currency: "USD"
    },
    source: {
      sourceType: "PaymentSession",
      sessionId: sessionId
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
      terminalId: terminalId
    }
  }
  fiservEncode("POST", url + "/payments/v1/charges", body, (options) => {
    //Submit the API call to Fiserv
    console.log("CHARGE")
    request(options, function (error, paymentResponse) {
      if (error) throw new Error(error)
      let data = JSON.parse(paymentResponse.body)
      return res.status(200).json({
        requestName: "Create charge Success",
        data: data
      })
    })
  })
})

//Create Charge Request With PaymentToken
router.post("/charge/create-with-token", async (req, res) => {
  //Start by encoding the message.
  const total = req.body?.total
  const tokenData = req.body?.tokenData
  const expirationMonth = req.body?.expirationMonth
  const expirationYear = req.body?.expirationYear
  const tokenSource = req.body?.tokenSource

  const body = {
    amount: {
      total: total,
      currency: "USD"
    },
    source: {
      sourceType: "PaymentToken",
      tokenData: tokenData,
      PARId: "1234",
      declineDuplicates: true,
      tokenSource: tokenSource,
      card: {
        expirationMonth: expirationMonth,
        expirationYear: expirationYear
      }
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

  fiservEncode("POST", url + "/payments/v1/charges", body, (options) => {
    request(options, function (error, paymentResponse) {
      if (error) throw new Error(error)
      let data = JSON.parse(paymentResponse.body)
      return res.status(200).json({
        requestName: "Charge With token Success",
        data: data
      })
    })
  })
})

module.exports = router
