import React, { useEffect, createRef } from "react";
import "../List.css";
import { useDispatch, useSelector } from "react-redux";
import { LOOK, EXPLORE } from "../../redux/types";
import { useParams } from "react-router-dom";
import {
  Container,
  Modal,
  Row,
  Col,
  InputGroup,
  Form,
  Button,
  Card,
} from "react-bootstrap";
import { useMoralis, useNFTBalances } from "react-moralis";
import NFTModalInfo from "components/nftModalInfo/NFTModalInfo";

var refs = {};

const ModalSection = (props) => {
  const { title, body } = props;
  return (
    <Card className="w-full">
      <Card.Body>
        <Card.Title className="text-left">{title}</Card.Title>
        <Card.Text className="text-left">{body}</Card.Text>
      </Card.Body>
    </Card>
  );
};

export default function ExploreList() {
  const dispatch = useDispatch();
  const NFTid = useParams().NFTid;
  const ownedNFTs = useSelector((state) => state.map.owned);
  const NFTs = useSelector((state) => state.map.all);
  const click = useSelector((state) => state.map.click);
  const loading_all = useSelector((state) => state.sidebar.loading_all);
  const { user } = useMoralis();

  useEffect(() => {
    dispatch({ type: EXPLORE });
  }, []);

  useEffect(() => {
    if (NFTid && !loading_all) {
      dispatch({ type: LOOK, payload: { NFTid: NFTid } });
    }
  }, [NFTid, loading_all]);

  useEffect(() => {
    if (click) {
      if (refs[click]) {
        refs[click].current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }
  }, [click]);

  const onSelect = (nft) => {
    dispatch({ type: LOOK, payload: { NFTid: nft.NFTid } });
    window.history.pushState("", "", `#/explore/${nft.NFTid}`);
  };

  function copyToClipboard(textToCopy) {
    // navigator clipboard api needs a secure context (https)
    if (navigator.clipboard && window.isSecureContext) {
      // navigator clipboard api method'
      return navigator.clipboard.writeText(textToCopy);
    } else {
      // text area method
      let textArea = document.createElement("textarea");
      textArea.value = textToCopy;
      // make the textarea out of viewport
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      return new Promise((res, rej) => {
        // here the magic happens
        document.execCommand("copy") ? res() : rej();
        textArea.remove();
      });
    }
  }

  const handleSelectNFT = (nft) => {
    setMakeOfferModalNFT(nft);
  };

  const handleOfferChange = (e) => {
    setOfferValue(e.target.value);
  };

  const handleMakeOffer = () => {
    // TODO: Buy the NFT here
    console.log(parseFloat(offerValue));
  };

  const handleQueryChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // const handleSearch = () => {
  //   setFilteredNFTs()
  // }

  const [copied, setCopied] = React.useState(false);
  const [makeOfferModalNFT, setMakeOfferModalNFT] = React.useState(null);
  const [offerValue, setOfferValue] = React.useState(0);
  const [searchQuery, setSearchQuery] = React.useState("");
  // const [filteredNFTs, setFilteredNFTs] = React.useState(NFTs);

  console.log(makeOfferModalNFT);

  return (
    <div className="bg-dark text-light" id="ExploreListAccordion">
      <InputGroup className="p-1">
        <Form.Control
          placeholder="Search"
          aria-label="Search"
          value={searchQuery}
          onChange={handleQueryChange}
        />
        {/* <Button onClick={handleSearch}>
          Search
        </Button> */}
      </InputGroup>
      {NFTs.filter((nft) =>
        nft.metadata.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
        .slice(0)
        .reverse()
        .map((nft) => {
          // console.log(nft);
          // console.log(user)
          refs[nft.NFTid] = createRef();
          return (
            <div
              className="card  bg-dark"
              key={nft.NFTid}
              ref={refs[nft.NFTid]}
            >
              <div className="card-body text-center justify-content-center">
                <a
                  className="btn rounded-pill"
                  data-toggle="collapse"
                  href={"#collapse" + nft.NFTid}
                  role="button"
                  aria-expanded="false"
                  aria-controls={"collapse" + nft.NFTid}
                  onClick={() => onSelect(nft)}
                >
                  {nft.image ? (
                    <div>
                      <img
                        className="img-thumbnail rounded-pill "
                        src={nft.image}
                        alt="nft"
                      />
                    </div>
                  ) : (
                    <h5 className="text-light">{nft.metadata.name}</h5>
                  )}
                </a>
              </div>
              <div
                className="collapse col justify-content-center"
                id={"collapse" + nft.NFTid}
                data-parent="#ExploreListAccordion"
              >
                <button
                  type="button"
                  className="row btn btn-light rounded"
                  onClick={() => handleSelectNFT(nft)}
                >
                  {ownedNFTs.map((nft) => nft.NFTid).includes(nft.NFTid)
                    ? "View"
                    : "Make an offer"}
                </button>
                <span data-toggle="tooltip" title="Copy shareable link">
                  <img
                    src="shareIcon.png"
                    style={{
                      cursor: "pointer",
                      display: "block",
                      float: "right",
                      z_index: "3",
                      position: "absolute",
                      right: "5px",
                      top: "5px",
                      width: "25px",
                      height: "25px",
                    }}
                    onClick={() => {
                      copyToClipboard(
                        `https://phanta.space/#/explore/${nft.NFTid}`
                      );
                      setCopied(true);
                    }}
                  ></img>
                </span>
                <a
                  href={nft.metadata.permalink}
                  className="row text-light justify-content-center"
                  target="_blank"
                >
                  {nft.metadata.description
                    ? nft.metadata.description
                    : "Check out the source for description"}
                </a>
              </div>
            </div>
          );
        })}
      <Modal show={copied} onHide={() => setCopied(false)}>
        <Modal.Header className="justify-content-center">
          <Modal.Title>
            <p>Link copied to the clipboard successfully.</p>
          </Modal.Title>
        </Modal.Header>
      </Modal>

      <Modal
        show={makeOfferModalNFT}
        dialogClassName="offer-modal"
        onHide={() => setMakeOfferModalNFT(null)}
      >
        {makeOfferModalNFT && (
          <>
            <NFTModalInfo nft={makeOfferModalNFT} />
            {!ownedNFTs
              .map((nft) => nft.NFTid)
              .includes(makeOfferModalNFT.NFTid) && (
              <Modal.Footer className="offer-modal-footer">
                <Container>
                  <Row className="mb-3">
                    <InputGroup>
                      <InputGroup.Text>Offer Amount</InputGroup.Text>
                      <Form.Control
                        type="number"
                        aria-label="Amount"
                        className="text-right"
                        value={offerValue}
                        onChange={handleOfferChange}
                      />
                      <Form.Select
                        aria-label="Select Currency"
                        className="px-2"
                      >
                        <option value="ETH">ETH</option>
                      </Form.Select>
                    </InputGroup>
                  </Row>
                  {/* <Row className="my-3">
                  <InputGroup>
                    <InputGroup.Text>Offer Expiration</InputGroup.Text>
                    <Form.Control
                      type="datetime-local"
                      name="offer-expiration"
                      placeholder="Offer expires after"
                    />
                  </InputGroup>
                </Row> */}
                  <Row className="mt-3">
                    <Button variant="primary" onClick={handleMakeOffer}>
                      Make Offer
                    </Button>
                  </Row>
                </Container>
              </Modal.Footer>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}
