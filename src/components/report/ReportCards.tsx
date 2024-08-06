import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import Table from "react-bootstrap/Table";
import {
  Card,
  Button,
  ButtonToolbar,
  Form,
  Image,
  Placeholder,
  Container,
  Row,
  Col,
  ListGroupItem,
  ListGroup,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useSearchParams } from "react-router-dom";
import EditGroupModal from "../group/EditGroupModal";
import "./ReportTable.module.css";
import {
  reportFullContent,
  reportImageUrl,
  reportAuthorUrl,
  stringToDate,
  groupById,
  sourceById,
  tagById,
  reportAuthor,
  capitalizeFirstLetter,
} from "../../helpers";
import { Group, Report, Source, Tag } from "../../objectTypes";
import { editReport, setSelectedRead } from "../../api/reports";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import TagsTypeahead from "../tag/TagsTypeahead";
import { faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";
import {
  faCheckCircle,
  faEnvelopeOpen,
  faLink,
  faPlusCircle,
  faTimesCircle,
  faWarning,
} from "@fortawesome/free-solid-svg-icons";
import VeracityIndication from "../VeracityIndication";
import EscalatedIndication from "../EscalatedIndication";

interface IProps {
  visibleReports: Report[];
  sources: Source[] | [];
  tags: Tag[] | undefined;
  batchMode?: boolean;
  setBatchMode?: (batchMode: boolean) => void;
  variant: "default" | "relevant" | "batch";
}

export default function ReportCards(props: IProps) {
  const queryClient = useQueryClient();
  const [selectedReports, setSelectedReports] = useState<Set<Report>>(
    new Set()
  );
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedReadStatusMutation = useMutation(
    () => {
      let allRead = true;
      selectedReports.forEach((report) => {
        if (!report.read) allRead = false;
      });
      let selectedReportsArr = Array.from(selectedReports);
      return setSelectedRead(
        selectedReportsArr.map((selectedReport) => {
          return selectedReport._id;
        }),
        !allRead
      );
    },
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(["batch"]);
      },
    }
  );

  const handleAllSelectChange = () => {
    let newSelectedReports;
    if (selectedReports.size === 0) {
      newSelectedReports = new Set(props.visibleReports);
    } else {
      newSelectedReports = new Set<Report>();
    }
    setSelectedReports(newSelectedReports);
  };
  const handleSelected = (report: Report) => {
    if (report?._id && selectedReports && setSelectedReports) {
      let newSelectedReports = new Set(selectedReports);
      if (newSelectedReports.has(report)) {
        newSelectedReports.delete(report);
      } else {
        newSelectedReports.add(report);
      }
      setSelectedReports(newSelectedReports);
    }
  };

  return (
    <Container fluid className={"p-0"}>
      <Row>
        {props.visibleReports.map((report) => {
          return (
            <Col xs={12} md={6} xl={4}>
              <Card>
                <Card.Header>
                  <Form>
                    {selectedReports && (
                      <Form.Check
                        type='checkbox'
                        id={report._id}
                        onChange={() => handleSelected(report)}
                        checked={selectedReports.has(report)}
                      />
                    )}
                  </Form>
                </Card.Header>
                <ReportCardBody
                  report={report}
                  sources={props.sources}
                  variant={props.variant}
                  tags={props.tags}
                  setSelectedReports={setSelectedReports}
                  selectedReports={selectedReports}
                />
              </Card>
            </Col>
          );
        })}
      </Row>
    </Container>
  );
}

interface ReportCardBodyIProps {
  report: Report | null;
  tags: Tag[] | undefined;
  sources: Source[] | [];
  variant: "default" | "relevant" | "batch";
  setSelectedReports?: Dispatch<SetStateAction<Set<Report>>>;
  selectedReports?: Set<Report>;
}

export function ReportCardBody(props: ReportCardBodyIProps) {
  const reportMutation = useMutation(
    (report: Report) => {
      return editReport(report);
    },
    {
      onSuccess: () => {
        if (props.report && props.report.read === false) {
          props.report.read = true;
        }
      },
    }
  );
  //@ts-ignore
  const [queryTags, setQueryTags] = useState<Tag[]>(
    //@ts-ignore
    props.report.smtcTags.map((tag) => {
      return tagById(tag, props.tags);
    })
  );
  /**
   * Handle Selected runs when a report is selected via checkbox. In order to track which reports are selected, we use
   * a set that contains selected report _ids to represent selected reports.
   */

  const handleTagsBlur = () => {
    if (props.report && queryTags) {
      props.report.smtcTags = queryTags.map((tag) => {
        return tag._id;
      });
      reportMutation.mutate(props.report);
    }
  };

  if (props.report) {
    switch (props.variant) {
      case "default":
      case "batch":
        // @ts-ignore
        return (
          <Card.Body>
            <Card.Img variant='top' src={reportImageUrl(props.report)} />
            <tr
              key={props.report._id}
              className={props.report.read ? "tr--read" : "tr--unread"}
            >
              <td className='sourceInfo'>
                <span>
                  {stringToDate(props.report.authoredAt).toLocaleTimeString()}
                </span>
                <br />
                <span>
                  {stringToDate(props.report.authoredAt).toLocaleDateString()}
                </span>
                <br />
                <a
                  href={reportAuthorUrl(props.report)}
                  target='_blank'
                  className='sourceInfo__link'
                >
                  <b>{reportAuthor(props.report)}</b>
                </a>
                <br />
                <span>
                  {
                    sourceById(props.report._sources[0], props.sources)
                      ?.nickname
                  }
                </span>
                {props.report.metadata &&
                  props.report.metadata.ct_tag &&
                  props.report.metadata.ct_tag.length &&
                  props.report.metadata.ct_tag.map && (
                    <>
                      {" "}
                      {">"}{" "}
                      {props.report.metadata.ct_tag.map((tag: string) => {
                        return <>{tag}</>;
                      })}{" "}
                      <br />
                    </>
                  )}
                <br />
                <a
                  href={props.report.url}
                  target='_blank'
                  className='sourceInfo__link'
                >
                  {capitalizeFirstLetter(props.report._media[0])}{" "}
                  <FontAwesomeIcon
                    icon={faArrowUpRightFromSquare}
                  ></FontAwesomeIcon>
                </a>
              </td>
              <td className={"td__image"}>
                {reportImageUrl(props.report) && (
                  <a href={props.report.url}>
                    <Image thumbnail src={reportImageUrl(props.report)}></Image>
                  </a>
                )}
              </td>
              <td className='text-break content'>
                <Link
                  to={"/report/" + props.report._id}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='content__link'
                >
                  {/* This is a janky method of showing full tweets instead of shorted ones */}
                  {reportFullContent(props.report) ? (
                    <>{reportFullContent(props.report)}</>
                  ) : (
                    <>{props.report.content}</>
                  )}
                </Link>
              </td>
              <td>
                {props.tags && props.report && props.report._id && (
                  <TagsTypeahead
                    id={props.report._id}
                    options={props.tags}
                    selected={queryTags}
                    onChange={setQueryTags}
                    onBlur={handleTagsBlur}
                    variant={"table"}
                  />
                )}
              </td>
            </tr>
          </Card.Body>
        );
        break;
      case "relevant":
        return (
          <>
            <Card.Img variant='top' src={reportImageUrl(props.report)} />
            <Card.Body key={props.report._id}>
              <VeracityIndication
                veracity={props.report.veracity}
                id={props.report._id}
                variant={"table"}
              />
              <EscalatedIndication
                escalated={props.report.escalated}
                id={props.report._id}
                variant={"table"}
              />
              <div className={"sourceInfo mb-2"}>
                <Card.Title>
                  <a
                    href={reportAuthorUrl(props.report)}
                    target='_blank'
                    className='sourceInfo__link'
                  >
                    <b>{reportAuthor(props.report)}</b>
                  </a>
                </Card.Title>
                <Card.Subtitle>
                  <span>
                    {stringToDate(props.report.authoredAt).toLocaleString()}
                  </span>
                </Card.Subtitle>

                <span>
                  {
                    sourceById(props.report._sources[0], props.sources)
                      ?.nickname
                  }
                </span>
              </div>
              <Card.Text className={"content"}>
                <Link
                  to={"/report/" + props.report._id}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='content__link'
                >
                  {/* This is a janky method of showing full tweets instead of shorted ones */}
                  {reportFullContent(props.report) ? (
                    <>{reportFullContent(props.report)}</>
                  ) : (
                    <>{props.report.content}</>
                  )}
                </Link>
              </Card.Text>

              {props.report.metadata &&
                props.report.metadata.ct_tag &&
                props.report.metadata.ct_tag.length &&
                props.report.metadata.ct_tag.map && (
                  <>
                    {" "}
                    {">"}{" "}
                    {props.report.metadata.ct_tag.map((tag: string) => {
                      return <>{tag}</>;
                    })}{" "}
                    <br />
                  </>
                )}
              <br />
              <a
                href={props.report.url}
                target='_blank'
                className='sourceInfo__link'
              >
                {capitalizeFirstLetter(props.report._media[0])}{" "}
                <FontAwesomeIcon
                  icon={faArrowUpRightFromSquare}
                ></FontAwesomeIcon>
              </a>
            </Card.Body>
            <ListGroup className='list-group-flush'>
              <ListGroupItem>
                {props.tags && props.report && props.report._id && (
                  <TagsTypeahead
                    id={props.report._id}
                    options={props.tags}
                    selected={queryTags}
                    onChange={setQueryTags}
                    onBlur={handleTagsBlur}
                    variant={"table"}
                  />
                )}
              </ListGroupItem>
              <ListGroupItem>
                <Form.Control
                  as='textarea'
                  rows={4}
                  disabled
                  defaultValue={props.report.notes}
                />
              </ListGroupItem>
              <ListGroupItem>
                <div className='d-flex justify-content-center'>
                  <EditGroupModal
                    reports={[props.report]}
                    groupId={props.report._group}
                    tags={props.tags}
                    sources={props.sources}
                    variant={"inline"}
                  />
                </div>
              </ListGroupItem>
            </ListGroup>
          </>
        );
    }
  } else {
    return (
      <tr key='empty'>
        <td>No report found.</td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
      </tr>
    );
  }
}

interface LoadingReportCardsIProps {
  variant: "default" | "relevant";
}
export const LoadingReportCards = (props: LoadingReportCardsIProps) => {
  const placeholderValues = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    21, 22, 23, 24,
  ];
  if (props.variant === "default") {
    return (
      <Card>
        <Card.Header>
          <ButtonToolbar>
            <Button
              variant={"secondary"}
              disabled
              aria-disabled={true}
              className='me-3'
            >
              <FontAwesomeIcon icon={faEnvelopeOpen} className={"me-2"} />
              Read/Unread
            </Button>
            <Button
              variant={"secondary"}
              disabled
              aria-disabled={true}
              className='me-3'
            >
              <FontAwesomeIcon icon={faPlusCircle} className={"me-2"} />
              Add to Group
            </Button>
            <Button variant={"primary"} disabled aria-disabled={true}>
              Batch Mode
            </Button>
          </ButtonToolbar>
        </Card.Header>
        <Table bordered hover size='sm'>
          <thead>
            <tr>
              <th>
                <Form>
                  <Form.Check type='checkbox' id={"select-all"} disabled />
                </Form>
              </th>
              <th>Source Info</th>
              <th>Thumbnail</th>
              <th>Content</th>
              <th>Tags</th>
              <th>Group</th>
            </tr>
          </thead>
          <tbody>
            {placeholderValues.map((value) => {
              return (
                <tr key={"placeholderRow" + value}>
                  <td>
                    <Form>
                      <Form.Check type='checkbox' disabled />
                    </Form>
                  </td>
                  <td className='sourceInfo'>
                    <Placeholder as={Card.Text} animation='glow'>
                      <Placeholder xs={4} />
                      <br />
                      <Placeholder xs={5} />
                      <br />
                      <Placeholder xs={4} />
                    </Placeholder>
                    <br />
                    <Placeholder as={Card.Text} animation='glow'>
                      <Placeholder xs={4} />
                      <br />
                      <Placeholder xs={5} />
                      <br />
                      <Placeholder xs={4} />
                    </Placeholder>
                  </td>
                  <td></td>
                  <td>
                    <Placeholder as={Card.Text} animation='glow'>
                      <Placeholder xs={12} />
                      <Placeholder xs={12} />
                      <Placeholder style={{ minWidth: 400 }} />
                      {/* Not sure why this minWidth thing makes it like 3/4 of the screen */}
                    </Placeholder>
                  </td>
                  <td>
                    <Form.Group>
                      <Form.Control
                        as='textarea'
                        style={{ height: "144px" }}
                        disabled
                      />
                    </Form.Group>
                  </td>
                  <td className={"align-middle"}>
                    <Placeholder animation='glow'>
                      <Placeholder.Button variant='link' xs={12} />
                    </Placeholder>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Card>
    );
  } else {
    return (
      <Card>
        <Card.Header>
          <ButtonToolbar>
            <Button
              variant={"secondary"}
              disabled
              aria-disabled={true}
              className='me-3'
            >
              <FontAwesomeIcon icon={faEnvelopeOpen} className={"me-2"} />
              Read/Unread
            </Button>
            <Button
              variant={"secondary"}
              disabled
              aria-disabled={true}
              className='me-3'
            >
              <FontAwesomeIcon icon={faPlusCircle} className={"me-2"} />
              Add to Group
            </Button>
          </ButtonToolbar>
        </Card.Header>
        <Table bordered hover size='sm'>
          <thead>
            <tr>
              <th>
                <Form>
                  <Form.Check type='checkbox' id={"select-all"} disabled />
                </Form>
              </th>
              <th>Source Info</th>
              <th>Thumbnail</th>
              <th>Content</th>
              <th>Tags</th>
              <th>Group</th>
            </tr>
          </thead>
          <tbody>
            {placeholderValues.map((value) => {
              return (
                <tr key={"placeholderRow" + value}>
                  <td>
                    <Form>
                      <Form.Check type='checkbox' disabled />
                    </Form>
                  </td>
                  <td className='sourceInfo'>
                    <Placeholder as={Card.Text} animation='glow'>
                      <Placeholder xs={4} />
                      <br />
                      <Placeholder xs={5} />
                      <br />
                      <Placeholder xs={4} />
                    </Placeholder>
                    <br />
                    <Placeholder as={Card.Text} animation='glow'>
                      <Placeholder xs={4} />
                      <br />
                      <Placeholder xs={5} />
                      <br />
                      <Placeholder xs={4} />
                    </Placeholder>
                  </td>
                  <td></td>
                  <td>
                    <Placeholder as={Card.Text} animation='glow'>
                      <Placeholder xs={12} />
                      <Placeholder xs={12} />
                      <Placeholder style={{ minWidth: 400 }} />
                      {/* Not sure why this minWidth thing makes it like 3/4 of the screen */}
                    </Placeholder>
                  </td>
                  <td>
                    <Form.Group>
                      <Form.Control
                        as='textarea'
                        style={{ height: "144px" }}
                        disabled
                      />
                    </Form.Group>
                  </td>
                  <td className={"align-middle"}>
                    <Placeholder animation='glow'>
                      <Placeholder.Button variant='link' xs={12} />
                    </Placeholder>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Card>
    );
  }
};
