import { useMoralis } from "react-moralis";
import { getEllipsisTxt } from "helpers/formatters";
import Blockie from "../Blockie";
import { Button, Card, Modal } from "react-bootstrap";
import { useState } from "react";
import Address from "../Address/Address";
import { getExplorer } from "helpers/networks";
import { connectors } from "./config";
import { customEnable } from "./walletlink";
import coinbaseIcon from "./WalletIcons/coinbase.svg";

const styles = {
  account: {
    height: "42px",
    padding: "0 15px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "fit-content",
    borderRadius: "12px",
    backgroundColor: "rgb(244, 244, 244)",
    cursor: "pointer",
  },
  text: {
    color: "#21BF96",
  },
  connector: {
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    height: "auto",
    justifyContent: "center",
    marginLeft: "auto",
    marginRight: "auto",
    padding: "20px 5px",
    cursor: "pointer",
  },
  icon: {
    alignSelf: "center",
    fill: "rgb(40, 13, 95)",
    flexShrink: "0",
    marginBottom: "8px",
    height: "30px",
  },
};

const signingMessage = "Welcome to PhantaSpace!";

function Account() {
  const { authenticate, isAuthenticated, chainId, logout, Moralis, user } = useMoralis();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAuthModalVisible, setIsAuthModalVisible] = useState(false);
  var account = "";
  if (user) {
    account = user.attributes.accounts[0];
  }

  if (!isAuthenticated || !account) {
    return (
      <>
        <div onClick={() => setIsAuthModalVisible(true)}>
          <p style={styles.text}>Authenticate</p>
        </div>
        <Modal show={isAuthModalVisible} onHide={() => setIsAuthModalVisible(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Connect Wallet</Modal.Title>
          </Modal.Header>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
            {connectors.map(({ title, icon, connectorId }, key) => (
              <div
                style={styles.connector}
                key={key}
                onClick={async () => {
                  try {
                    await authenticate({ provider: connectorId, signingMessage: signingMessage });

                    window.localStorage.setItem("connectorId", connectorId);
                    setIsAuthModalVisible(false);
                  } catch (e) {
                    console.error(e);
                  }
                }}
              >
                <img src={icon} alt={title} style={styles.icon} />
                <h2 style={{ fontSize: "14px" }}>{title}</h2>
              </div>
            ))}

            <div
              style={styles.connector}
              // key={key}
              onClick={async () => {
                try {
                  Moralis.setEnableWeb3(customEnable);
                  await authenticate({ signingMessage: signingMessage });
                  window.localStorage.setItem("connectorId", "injected");
                  setIsAuthModalVisible(false);
                } catch (e) {
                  console.error(e);
                }
              }}
            >
              <img src={coinbaseIcon} alt={"Coinbase"} style={styles.icon} />
              <h2 style={{ fontSize: "14px" }}>Coinbase Wallet</h2>
            </div>
          </div>
        </Modal>
      </>
    );
  }

  return (
    <>
      {/* <button
        onClick={async () => {
          try {
            console.log("change")
            await web3._provider.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: "0x38" }],
            });
            console.log("changed")
          } catch (e) {
            console.error(e);
          }
        }}
      >
        Hi
      </button> */}

      <div style={styles.account} onClick={() => setIsModalVisible(true)}>
        <Blockie address={account} scale={3} />
        <p style={{ marginLeft: "5px", ...styles.text }}>{getEllipsisTxt(account, 6)}</p>
      </div>
      <Modal show={isModalVisible} onHide={() => setIsModalVisible(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Account</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Card>
            <Address avatar="left" size={6} copyable style={{ fontSize: "20px" }} />
            <div style={{ marginTop: "10px", padding: "0 10px" }}>
              <a href={`${getExplorer(chainId)}/address/${account}`} target="_blank" rel="noreferrer">
                View on Explorer
              </a>
            </div>
          </Card>
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={async () => {
              await logout();

              window.localStorage.removeItem("connectorId");
              setIsModalVisible(false);
            }}
          >
            Disconnect Wallet
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default Account;
