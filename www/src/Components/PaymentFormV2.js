import { Button, CircularProgress } from "@material-ui/core"
import React, { Component } from "react"
import "./Frame.css"
const ListStep = [
  {
    id: 1,
    title: "Initial"
  },
  {
    id: 2,
    title: "Generate Credential"
  },
  {
    id: 3,
    title: "Input card details"
  },
  {
    id: 4,
    title: "Paying"
  },
  {
    id: 5,
    title: "Paysuccess"
  },
  {
    id: 6,
    title: "Create Token"
  },
  {
    id: 7,
    title: "Paying with Token"
  }
]
const savedToken = {
  tokenData: "7654177240070640",
  tokenSource: "TRANSARMOR",
  expirationMonth: "10",
  expirationYear: "2024"
}
const PaymentFormV2 = () => {
  const [activeStep, setActiveStep] = React.useState(0)
  const [credential, setCredential] = React.useState({})
  const [loading, setLoading] = React.useState(false)
  const loadCardCaptureForm = (credential = {}) => {
    const apiKey = "MI9EWlUQ9bMnTvUCbPcMiy5GbYnwo8tV"
    const merchantId = "100008000306136"
    const authorization = credential.accessToken

    const formConfig = {
      merchantId: merchantId,
      publicKey: credential.publicKey,
      symmetricEncryptionAlgorithm: "AES_GCM",
      asymmetricEncryptionAlgorithm: "RSA",
      keyId: credential.keyId
    }
    const form = new window.commercehub.FiservSaqAEp(
      formConfig,
      authorization,
      apiKey
    )
    form
      .loadPaymentForm("payment-saq-a-ep-form-div")
      .then((next) => {
        console.log("LOADFORM SUCCESS")
        setActiveStep(5)
        handleCreatePaymentToken(credential?.sessionId)
      })
      .catch((error) => {
        console.log("LOAD FORM ERR", error)
      })
  }
  const handleCreatePaymentToken = (sessionId = "") => {
    setLoading(true)
    fetch("http://localhost:3124/api/token/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      redirect: "follow",
      body: JSON.stringify({
        sessionId
      })
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("CREATE TOKEN SUCCESS", data)
        setActiveStep(3)
        handleChargeWithToken(
          data.data?.paymentTokens[0]?.tokenData,
          data?.data?.paymentTokens[0]?.tokenSource,
          data?.data?.source?.card?.expirationMonth,
          data?.data?.source?.card?.expirationYear
        )
      })
      .catch((err) => {
        console.log("CREATE TOKEN ERR", err)
      })
      .finally(() => setLoading(false))
  }

  const handleChargeWithToken = (
    tokenData = "",
    tokenSource = "",
    expirationMonth = "",
    expirationYear = ""
  ) => {
    if (!tokenData || !tokenSource || !expirationMonth || !expirationYear) {
      console.log("INVALID DATA", {
        total: 25,
        tokenData,
        tokenSource,
        expirationMonth,
        expirationYear
      })
      return
    }
    setLoading(true)
    fetch("http://localhost:3124/api/charge/create-with-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      redirect: "follow",
      body: JSON.stringify({
        total: 25,
        tokenData,
        tokenSource,
        expirationMonth,
        expirationYear
      })
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("CHARGE SUCCESS", data)
        setActiveStep(4)
      })
      .catch((err) => {
        console.log("CHARGE ERR", err)
      })
      .finally(() => setLoading(false))
  }

  const handleChargeWithSessionId = (sessionId = "") => {
    setLoading(true)
    fetch("http://localhost:3124/api/charge/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      redirect: "follow",
      body: JSON.stringify({
        total: 25,
        sessionId
      })
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("CHARGE SUCCESS", data)
        setActiveStep(4)
      })
      .catch((err) => {
        console.log("CHARGE ERR", err)
      })
      .finally(() => setLoading(false))
  }
  const handleCreateCredential = () => {
    setActiveStep(1)
    setLoading(true)
    var requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      redirect: "follow"
    }
    fetch("http://localhost:3124/api/credential/create", requestOptions)
      .then((res) => {
        return res.json()
      })
      .then((data) => {
        console.log("CREDENTIAL DATA", data)
        setCredential(data)
        loadCardCaptureForm(data)
        setActiveStep(2)
      })
      .catch((err) => {
        console.log("CREATE CREDENTIAL ERR", err)
      })
      .finally(() => setLoading(false))
  }

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          flex: 1
        }}
      >
        <div style={{ flex: 1, border: "1px solid" }}>
          <h1>FPV Drone</h1>
          <img className="image" alt="A FPV Drone" src={"./drone.jpeg"}></img>
          <h2>25$</h2>
        </div>
        <div
          style={{
            flex: 1,
            border: "1px solid",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: 20
          }}
        >
          <h1>{ListStep[activeStep].title}</h1>
          <div
            id="payment-saq-a-ep-form-div"
            style={{
              width: "100%",
              border: "1px solid",
              padding: 40,
              flex: 1,
              backgroundColor: "#eee"
            }}
          ></div>
          <Button
            color="primary"
            onClick={() => {
              handleCreateCredential()
              //Below is function charge with token data load from BE
              // handleChargeWithToken(
              //   savedToken.tokenData,
              //   savedToken.tokenSource,
              //   savedToken.expirationMonth,
              //   savedToken.expirationYear
              // )
            }}
            style={{ backgroundColor: "green", color: "#fff" }}
          >
            Create Credential
          </Button>
          {loading && (
            <>
              <h4>Loading</h4>
              <CircularProgress />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
export default PaymentFormV2
