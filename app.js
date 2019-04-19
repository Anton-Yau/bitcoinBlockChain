//Provide Account Balance
document.getElementById("search").onclick = function() {
  let userInput = document.getElementById("basic-url").value;
  console.log(userInput);
  let api = `https://api.blockcypher.com/v1/btc/test3/addrs/${userInput}/balance`;
  fetch(api)
    .then(response => {
      return response.json();
    })
    .then(data => {
      console.log(data);
      const balance = data.balance / 10 ** 8;
      const unconfirmedBalance = data.unconfirmed_balance / 10 ** 8;
      const finalBalance = data.final_balance / 10 ** 8;
      document.getElementById(
        "showBalance"
      ).innerHTML = `Account Balance: ฿${balance}`;
      document.getElementById(
        "showUnconfirmedBalance"
      ).innerHTML = `Unconfirmed Balance: ฿${unconfirmedBalance}`;
      document.getElementById(
        "showFinalBalance"
      ).innerHTML = `Final Balance ฿${finalBalance}`;
    });
};

//Transfer bitcoin
document.getElementById("transfer").onclick = function() {
  let from = document.getElementById("from-url").value;
  let to = document.getElementById("to-url").value;
  let v = document.getElementById("transferAmount").value * 10 ** 8;
  let newtx = {
    inputs: [{ addresses: [from] }],
    outputs: [{ addresses: [to], value: v }]
  };
  console.log(JSON.stringify(newtx));
  fetch("https://api.blockcypher.com/v1/btc/test3/txs/new", {
    method: "post",
    body: JSON.stringify(newtx)
  })
    .then(response => {
      return response.json();
    })
    .then(function(tmptx) {
      let eccrypto = require("eccrypto");
      let privateKey = Buffer.from(
        document.getElementById("privateKey").value,
        "hex"
      );
      let publicKey = eccrypto.getPublic(privateKey).toString("hex");
      tmptx.pubkeys = [];
      let promises = tmptx.tosign.map(toSign => {
        tmptx.pubkeys.push(publicKey);
        let buf = Buffer.from(toSign, "hex");
        return eccrypto.sign(privateKey, buf).then(function(sig) {
          return sig.toString("hex");
        });
      });
      Promise.all(promises).then(result => {
        tmptx.signatures = result;
        console.log("tmptx " + JSON.stringify(tmptx));
        fetch("https://api.blockcypher.com/v1/btc/test3/txs/send", {
          method: "post",
          body: JSON.stringify(tmptx)
        })
          .then(response => {
            return response.json();
          })
          .then(data => {
            console.log("final " + JSON.stringify(data));
          });
      });
    });
};
