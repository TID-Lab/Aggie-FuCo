import React from "react";
import {
  Nav,
  Navbar,
  NavDropdown,
  Image,
  Container,
  Offcanvas,
} from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import { LinkContainer } from "react-router-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faTags,
  faUsersCog,
  faCog,
  faCloud,
  faKey,
  faChartLine,
} from "@fortawesome/free-solid-svg-icons";
import ConfirmModal from "./ConfirmModal";
import "./AggieNavbar.css";
import { Session } from "../objectTypes";
import { useQueryClient } from "@tanstack/react-query";
import FetchIndicator from "./FetchIndicator";

interface IProps {
  isAuthenticated: boolean;
  session: Session | undefined;
}

const AggieNavbar = (props: IProps) => {
  const queryClient = useQueryClient();
  queryClient.invalidateQueries(["groups"]);
  const location = useLocation();
  return (
    <Navbar className='bg-[#356C4E]' variant='dark' expand={false}>
      <Container fluid>
        {location.pathname === "/login" && (
          <Navbar.Brand>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 62 62'
            >
              <path
                d='M31 39a7 7 0 1 1-14 0 7 7 0 0 1 14 0Zm15-15a7 7 0 1 1-14 0 7 7 0 0 1 14 0Zm-4-14a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm0 29a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm13 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm-43 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm30 13a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm14-28a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm-43 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm16 0a5 5 0 1 1-10 0 5 5 0 0 1 10 0Z'
                fill='currentColor'
              />
            </svg>
          </Navbar.Brand>
        )}
        {location.pathname !== "/login" && (
          <>
            <Nav variant={"pills"} className={"me-auto aggie-nav "}>
              <LinkContainer to={"/reports"}>
                <Navbar.Brand>
                  <svg fill='none' viewBox='0 0 62 62' className='w-8'>
                    <path
                      d='M31 39a7 7 0 1 1-14 0 7 7 0 0 1 14 0Zm15-15a7 7 0 1 1-14 0 7 7 0 0 1 14 0Zm-4-14a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm0 29a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm13 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm-43 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm30 13a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm14-28a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm-43 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm16 0a5 5 0 1 1-10 0 5 5 0 0 1 10 0Z'
                      fill='#fff'
                    />
                  </svg>
                </Navbar.Brand>
              </LinkContainer>
              <Nav.Item>
                <LinkContainer to={"/reports"}>
                  <Nav.Link className={"ps-2 pe-2 aggie-nav-link"} eventKey='1'>
                    Reports
                  </Nav.Link>
                </LinkContainer>
              </Nav.Item>
              <Nav.Item>
                <LinkContainer to={"/incidents"}>
                  <Nav.Link className={"ps-2 pe-2 aggie-nav-link"} eventKey='2'>
                    Incidents
                  </Nav.Link>
                </LinkContainer>
              </Nav.Item>
              <Nav.Item>
                <LinkContainer to={"/relevant-reports"}>
                  <Nav.Link
                    className={"ps-2 pe-2 aggie-nav-link"}
                    eventKey='3'
                    title='Item'
                  >
                    Relevant Reports
                  </Nav.Link>
                </LinkContainer>
              </Nav.Item>
              <Nav.Item>
                <LinkContainer to={"/groups"}>
                  <Nav.Link className={"ps-2 pe-2 aggie-nav-link"} eventKey='4'>
                    OLD:Groups
                  </Nav.Link>
                </LinkContainer>
              </Nav.Item>
              <Nav.Item>
                <LinkContainer to={"/analysis"}>
                  <Nav.Link className={"ps-2 pe-2 aggie-nav-link"} eventKey='5'>
                    Analysis
                  </Nav.Link>
                </LinkContainer>
              </Nav.Item>

              <Nav.Item>
                <LinkContainer to={"/reports-old"}>
                  <Nav.Link className={"ps-2 pe-2 aggie-nav-link"} eventKey='6'>
                    OLD:reports
                  </Nav.Link>
                </LinkContainer>
              </Nav.Item>
            </Nav>
            <Nav>
              <Navbar.Toggle aria-controls='offcanvasNavbar' />
            </Nav>
            <Navbar.Offcanvas
              id='offcanvasNavbar'
              aria-labelledby='offcanvasNavbarLabel'
              placement='end'
              scroll={true}
            >
              <Offcanvas.Header closeButton>
                <Offcanvas.Title id='offcanvasNavbarLabel'>
                  Navigation
                </Offcanvas.Title>
              </Offcanvas.Header>
              <Offcanvas.Body>
                <Nav variant={"pills"}>
                  {props.isAuthenticated &&
                  props.session &&
                  props.session.role ? (
                    <Nav.Item>
                      <LinkContainer to={"/user/" + props.session._id}>
                        <Nav.Link eventKey='5' className='ps-2'>
                          <FontAwesomeIcon className='me-2' icon={faUser} />
                          {props.session ? (
                            <span> {props.session.username} </span>
                          ) : (
                            <span> Undefined </span>
                          )}
                        </Nav.Link>
                      </LinkContainer>
                    </Nav.Item>
                  ) : (
                    <></>
                  )}
                  <Nav.Item>
                    <LinkContainer to={"/config"}>
                      <Nav.Link eventKey='6' className='ps-2'>
                        <FontAwesomeIcon className='me-2' icon={faCog} />
                        <span>Configuration</span>
                      </Nav.Link>
                    </LinkContainer>
                  </Nav.Item>
                  <Nav.Item>
                    <LinkContainer to={"/credentials"}>
                      <Nav.Link eventKey='7' className={"ps-2"}>
                        <FontAwesomeIcon className='me-2' icon={faKey} />
                        <span>Credentials</span>
                      </Nav.Link>
                    </LinkContainer>
                  </Nav.Item>
                  <Nav.Item>
                    <LinkContainer to={"/users"}>
                      <Nav.Link eventKey='8' className={"ps-2"}>
                        <FontAwesomeIcon className='me-2' icon={faUsersCog} />
                        <span>Users</span>
                      </Nav.Link>
                    </LinkContainer>
                  </Nav.Item>
                  <Nav.Item>
                    <LinkContainer to={"/tags"}>
                      <Nav.Link eventKey='9' className={"ps-2"}>
                        <FontAwesomeIcon className='me-2' icon={faTags} />
                        <span>Tags</span>
                      </Nav.Link>
                    </LinkContainer>
                  </Nav.Item>
                  <Nav.Item>
                    <LinkContainer to={"/sources"}>
                      <Nav.Link eventKey='10' className={"ps-2"}>
                        <FontAwesomeIcon className='me-2' icon={faCloud} />
                        <span>Sources</span>
                      </Nav.Link>
                    </LinkContainer>
                  </Nav.Item>
                  <ConfirmModal
                    type={"logout"}
                    variant={"button"}
                  ></ConfirmModal>
                </Nav>
              </Offcanvas.Body>
            </Navbar.Offcanvas>
          </>
        )}
      </Container>
    </Navbar>
  );
};

export default AggieNavbar;
