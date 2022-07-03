import React, { useEffect, createRef } from "react";
import "../List.css";
import { useDispatch, useSelector } from "react-redux";
import { LOOK, EXPLORE } from "../../redux/types";
import { useParams } from "react-router-dom";
import { Modal } from "react-bootstrap";

var refs = {};

export default function ExploreList() {
  const dispatch = useDispatch();
  const NFTid = useParams().NFTid;
  const NFTs = useSelector((state) => state.map.all);
  const click = useSelector((state) => state.map.click);
  const loading_all = useSelector((state) => state.sidebar.loading_all);

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

  const [copied, setCopied] = React.useState(false);

  return (
    <div className="bg-dark text-light" id="ExploreListAccordion">
      {NFTs.slice(0)
        .reverse()
        .map((nft) => {
          refs[nft.NFTid] = createRef();
          return (
            <div className="card  bg-dark" key={nft.NFTid} ref={refs[nft.NFTid]}>
              <div className="card-body text-center ">
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
                      copyToClipboard(`https://phanta.space/#/explore/${nft.NFTid}`);
                      setCopied(true);
                    }}
                  ></img>
                </span>

                <a
                  className="btn rounded-pill col-12"
                  data-toggle="collapse"
                  href={"#collapse" + nft.NFTid}
                  role="button"
                  aria-expanded="false"
                  aria-controls={"collapse" + nft.NFTid}
                  onClick={() => onSelect(nft)}
                >
                  {nft.image ? (
                    <div>
                      <img className="img-thumbnail rounded-pill" src={nft.image} alt="nft" />
                      <h5 className="text-light">{nft.metadata.name}</h5>
                    </div>
                  ) : (
                    <h5 className="text-light">{nft.metadata.name}</h5>
                  )}
                </a>

                <h5 className="text-center">{nft.name}</h5>
              </div>
              <div className="collapse" id={"collapse" + nft.NFTid} data-parent="#ExploreListAccordion">
                <a href={nft.metadata.permalink} className="text-light  justify-content-center" target="_blank">
                  {nft.metadata.description ? nft.metadata.description : "Check out the source for description"}
                </a>
              </div>
            </div>
          );
        })}
      <Modal show={copied} onHide={() => setCopied(false)}>
        <Modal.Header className="justify-content-center">
          <Modal.Title>
            <p>Link copied to the clipboard successfully.</p>
            <p>Go amaze your friends now!</p>
          </Modal.Title>
        </Modal.Header>
      </Modal>
    </div>
  );
}
