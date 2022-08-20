import "../List.css";
import {
  Container,
  Modal,
  Row,
  Col,
  Card,
} from "react-bootstrap";

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

export default function NFTModalInfo(props) {
  const { nft } = props;

  return (
    <>
      <Modal.Header className="justify-content-center">
        <Modal.Title>
          <p>{nft.metadata.name}</p>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container>
          <Row className="mb-3">
            <Col md={4} sm={12}>
              {nft.image ? (
                <div>
                  <img
                    className="img-thumbnail rounded-pill m-auto"
                    src={nft.image}
                    alt="nft"
                  />
                </div>
              ) : (
                <h5 className="text-light">
                  {nft.metadata.name}
                </h5>
              )}
            </Col>
            <Col md={8} sm={12} className="text-left">
              <ModalSection
                title="Description"
                body={
                  nft.metadata.description ||
                  "Check out the source for description."
                }
              />
              <ModalSection
                title="Source"
                body={
                  <a
                    href={nft.metadata.permalink}
                    target="_blank"
                  >
                    Source here (opens new tab)
                  </a>
                }
              />
              <ModalSection
                title="Owner"
                body={`Owned by ${nft.metadata.owner.user.username}`}
              />
            </Col>
          </Row>
        </Container>
      </Modal.Body>
    </>
  );
}
