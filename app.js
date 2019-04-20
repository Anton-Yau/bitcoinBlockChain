//Provide Account Balance
document.getElementById("search").onclick = function() {
  let userInput = document.getElementById("basic-url").value;
  let api = `https://api.blockcypher.com/v1/btc/test3/addrs/${userInput}`;
  fetch(api)
    .then(response => {
      if (!response.ok) {
        throw Error(response.statusText);
      }
      return response.json();
    })
    .then(data => {
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
      let txList = [];
      for (tx of data.txrefs) {
        let x = tx.block_height;
        let y = tx.ref_balance / 10 ** 8;
        let point = { x, y };
        txList.unshift(point);
      }
      console.log(txList);
      drawChart(txList);
      document.getElementById("info").style.display = "block";
    })
    .catch(function(error) {
      alert("Cannot find this address, please check again.");
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
  fetch("https://api.blockcypher.com/v1/btc/test3/txs/new", {
    method: "post",
    body: JSON.stringify(newtx)
  })
    .then(response => {
      if (!response.ok) {
        throw Error(response.statusText);
      }
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
        fetch("https://api.blockcypher.com/v1/btc/test3/txs/send", {
          method: "post",
          body: JSON.stringify(tmptx)
        })
          .then(response => {
            if (!response.ok) {
              throw Error(response.statusText);
            }
            return response.json();
          })
          .then(data => {
            document.getElementById(
              "message"
            ).innerHTML = `Transfer Successful!`;
          })
          .catch(function(error) {
            alert(error + ", make sure to enter the corrrect input.");
          });
      });
    })
    .catch(function(error) {
      alert(error + ", make sure to enter the corrrect input.");
    });
};
function drawChart(d) {
  let Chart = require("chart.js");
  let ctx = document.getElementById("myChart").getContext("2d");
  let lineChart = new Chart(ctx, {
    type: "line",
    data: {
      datasets: [
        {
          label: "Account Balance(฿)",

          data: d,
          backgroundColor: "rgba(0,0,255,0.9)",
          borderColor: "rgba(0,0,255,0.5)",
          fill: false
        }
      ]
    },
    options: {
      title: {
        display: true,
        text: "Account Balance Over Block Height",
        fontColor: "white"
      },
      legend: {
        labels: {
          fontColor: "white"
        }
      },
      scales: {
        yAxes: [
          {
            ticks: {
              fontColor: "white"
            }
          }
        ],
        xAxes: [
          {
            label: "Block Height",
            type: "linear",
            position: "bottom",
            ticks: {
              fontColor: "white"
            }
          }
        ]
      }
    }
  });
}
