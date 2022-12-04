import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import { Button, Modal } from "react-bootstrap";

import "./App.css";

// eslint-disable-next-line no-undef
const VEQUEST_ENDPOINT_URL = process.env.REACT_APP_VEQUEST_ENDPOINT_URL;

function App() {
  const [data, setData] = React.useState(null);
  const [show, setShow] = React.useState(false);
  const [modalData, setModalData] = React.useState(null);
  const [vequestTarget, setVequestTarget] = React.useState({});
  const [search, setSearch] = React.useState("");

  const approveRequest = (vequest) => {
    vequest.approved = true;
    vequest.verified_on = new Date().toLocaleDateString("en-US");

    fetch(`${VEQUEST_ENDPOINT_URL}/${vequest.pubkey}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(vequest),
    })
      .then((res) => res.json())
      .then(() => {
        setShow(false);
      });
  };

  const handleClose = () => {
    setShow(false);
    setModalData(null);
  };

  const getBtnState = (vequest) => {
    if (vequest.approved) {
      return (
        <label className="apvl-vequest-ch" htmlFor="approveVequestCheckbox">
          <div className="apvl-vequest-ch-cont">
            <input
              className="checkbox"
              type="checkbox"
              id="approveVequestCheckbox"
              checked
              disabled
            />
            Approve verification requests
          </div>
        </label>
      );
    }

    return (
      <label className="apvl-vequest-ch" htmlFor="approveVequestCheckbox">
        <div className="apvl-vequest-ch-cont">
          <input
            className="checkbox"
            type="checkbox"
            id="approveVequestCheckbox"
            onChange={() => setVequestTarget(vequest)}
          />
          Approve request
        </div>
      </label>
    );
  };

  const handleSaveChanges = () => {
    if (vequestTarget.pubkey) {
      approveRequest(vequestTarget);
    } else {
      setShow(false);
    }
  };

  const handleShow = (e) => {
    const vequest =
      data.verification_requests[e.currentTarget.getAttribute("data-rowid")];

    setModalData(
      <table className="table">
        <tbody>
          <tr>
            <td>Public Key:</td>
            <td>{vequest.pubkey}</td>
          </tr>
          <tr>
            <td>Information Link:</td>
            <td>
              <a href={vequest.info_link} target="_blank" rel="noreferrer">
                {vequest.info_link}
              </a>
            </td>
          </tr>
          <tr>
            <td>Official Website:</td>
            <td>
              <a
                href={vequest.official_website}
                target="_blank"
                rel="noreferrer"
              >
                {vequest.official_website}
              </a>
            </td>
          </tr>
          <tr>
            <td>Official Email:</td>
            <td>
              <a href={"mailto:" + vequest.official_email}>
                {vequest.official_email}
              </a>
            </td>
          </tr>
          <tr>
            <td>Organization ID:</td>
            <td>
              <img
                className="organization-id"
                src={"data:image/svg;base64," + vequest.organization_id}
                alt="Organization ID"
              />
            </td>
          </tr>
          <tr>
            <td className="py-5 my-5">Approved:</td>
            <td className="py-5 my-5">{getBtnState(vequest)}</td>
          </tr>
        </tbody>
      </table>
    );
    setShow(true);
  };

  const getVequest = () => {
    fetch(VEQUEST_ENDPOINT_URL, {
      method: "GET",
    })
      .then((response) => response.json())
      .then((json) => {
        setData(json);
      });
  };

  const generateRows = () => {
    if (!data) {
      return (
        <tr>
          <td>Loading...</td>
        </tr>
      );
    }

    if (search) {
      const filteredData = data.verification_requests.filter((vequest) => {
        return (
          vequest.pubkey.toLowerCase().includes(search.toLowerCase()) ||
          vequest.info_link.toLowerCase().includes(search.toLowerCase()) ||
          vequest.official_website
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          vequest.official_email.toLowerCase().includes(search.toLowerCase())
        );
      });

      return filteredData.map((vequest, index) => {
        return (
          <tr
            key={index}
            data-rowid={index}
            className="table-row text-truncate"
            onClick={handleShow}
          >
            <td className="text-truncate">{vequest.pubkey}</td>
            <td className="text-truncate">{vequest.info_link}</td>
            <td className="text-truncate">{vequest.official_website}</td>
            <td className="text-truncate">{vequest.official_email}</td>
            <td className="text-center">
              {vequest.organization_id ? "Yes" : "No"}
            </td>
            <td className="text-center">{vequest.approved ? "Yes" : "No"}</td>
          </tr>
        );
      });
    }

    const sortedData = data.verification_requests.sort((a, b) => {
      return a.approved - b.approved;
    });

    return sortedData.map((item, index) => {
      return (
        <tr
          key={index}
          data-rowid={index}
          className="table-row text-truncate"
          onClick={handleShow}
        >
          <td className="text-truncate">{item.pubkey}</td>
          <td className="text-truncate">{item.info_link}</td>
          <td className="text-truncate">{item.official_website}</td>
          <td className="text-truncate">{item.official_email}</td>
          <td className="text-center">{item.organization_id ? "Yes" : "No"}</td>
          <td className="text-center">{item.approved ? "Yes" : "No"}</td>
        </tr>
      );
    });
  };

  React.useEffect(() => {
    getVequest();
  }, []);

  return (
    <div className="container vh-100">
      <div className="app-modal">
        <Modal show={show} onHide={handleClose} size="xl">
          <Modal.Header closeButton>
            <Modal.Title>Verification Request</Modal.Title>
          </Modal.Header>

          <Modal.Body>{modalData}</Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
            <Button variant="primary" onClick={handleSaveChanges}>
              Save changes
            </Button>
          </Modal.Footer>
        </Modal>
      </div>

      <div className="row mt-5">
        <div className="col-12">
          <h1 className="text-center">Verification Requests</h1>
        </div>
      </div>

      <div className="row mt-5">
        <div className="col-12">
          <div className="input-group mb-3 flex-row-reverse">
            <div className="search-fn">
              <input
                type="text"
                className="form-control"
                placeholder="Search"
                aria-label="Search"
                aria-describedby="button-addon2"
                onChange={(e) => setSearch(e.target.value)}
              />
              <button
                className="btn btn-outline-secondary"
                type="button"
                id="button-addon2"
                onClick={generateRows}
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      <table className="table table-responsive mt-5">
        <thead>
          <tr>
            <th scope="col">Public Key</th>
            <th scope="col">Verification Link</th>
            <th scope="col">Official Website</th>
            <th scope="col">Official Email</th>
            <th className="text-center" scope="col">
              Organization ID
            </th>
            <th className="text-center" scope="col">
              Approved
            </th>
          </tr>
        </thead>
        <tbody>{generateRows()}</tbody>
      </table>
    </div>
  );
}

export default App;
