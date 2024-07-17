import React, { useState } from "react";
import {
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
  Collapse,
  InputGroup,
  FormControl,
  Table,
  ButtonToolbar,
  Placeholder,
  Pagination,
  ButtonGroup,
  FormGroup,
  FormLabel,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClose,
  faEnvelope,
  faEnvelopeOpen,
  faFilter,
  faPlusCircle,
  faSearch,
  faSlidersH,
} from "@fortawesome/free-solid-svg-icons";
import ReportTable, {
  LoadingReportTable,
} from "../../components/report/ReportTable";
import StatsBar from "../../components/StatsBar";
import { AlertContent } from "../../components/AlertService";
import { Field, Formik } from "formik";
import * as Yup from "yup";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelBatch,
  getBatch,
  getNewBatch,
  getReports,
  setSelectedRead,
} from "../../api/reports";
import { getSources } from "../../api/sources";
import { getGroups } from "../../api/groups";
import { getTags } from "../../api/tags";
import DatePickerField from "../../components/DatePickerField";
import {
  CTList,
  Groups,
  ReportQueryState,
  Reports,
  Source,
  Tag,
} from "../../objectTypes";
import {
  capitalizeFirstLetter,
  ctListToOptions,
  hasSearchParams,
  objectsToIds,
  parseFilterFields,
} from "../../helpers";
import { getCTLists } from "../../api/ctlists";
import TagsTypeahead from "../../components/tag/TagsTypeahead";
import { AxiosError } from "axios";
import ErrorCard from "../../components/ErrorCard";
import AggiePagination, {
  LoadingPagination,
} from "../../components/AggiePagination";
import { getSession } from "../../api/session";
import EditGroupModal from "../../components/group/EditGroupModal";
import ReportCards from "../../components/report/ReportCards";
const ITEMS_PER_PAGE = 50;

const mediaTypes = [
  "twitter",
  "instagram",
  "RSS",
  "elmo",
  "SMS GH",
  "facebook",
];

// TODO: Finish up validating reportQueries using Yup.
const reportQuerySchema = Yup.object().shape({
  sourceId: Yup.array().nullable(),
  media: Yup.string(),
  before: Yup.date(),
  after: Yup.date(),
  page: Yup.number(),
  keywords: Yup.string(),
  groupId: Yup.array().nullable(),
  author: Yup.string(),
});

interface IProps {
  setGlobalAlert: (alertMessage: AlertContent) => void;
}

const RelevantReportsIndex = (props: IProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  // This is the state of the URL
  const [searchParams, setSearchParams] = useSearchParams();
  const [cardView, setCardView] = useState(false);

  // This is the state of the Report Query
  const [queryState, setQueryState] = useState<ReportQueryState>({
    keywords: searchParams.get("keywords"),
    author: searchParams.get("author"),
    groupId: searchParams.get("groupId"),
    media: searchParams.get("media"),
    sourceId: searchParams.get("sourceId"),
    list: searchParams.get("list"),
    before: searchParams.get("before"),
    after: searchParams.get("after"),
    tags: (searchParams.get("tags") || "").split(","),
    page: Number(searchParams.get("page") || "0"),
  });

  // This clears search state and search params
  const clearFilterParams = () => {
    setSearchParams({});
    setFilterTags([]);
    setQueryState({
      keywords: queryState.keywords,
      author: queryState.author,
      groupId: queryState.groupId,
      media: null,
      sourceId: null,
      list: null,
      before: null,
      after: null,
      page: null,
      tags: null,
    });
  };

  const goToPage = (pageNum: number) => {
    setSearchParams({
      ...searchParams,
      page: String(pageNum),
    });
    setQueryState({
      ...queryState,
      page: pageNum,
    });
    reportsQuery.refetch();
  };

  const reportsQuery = useQuery<Reports | undefined, AxiosError>(
    ["reports", queryState],
    () => getReports(queryState, [], true),
    {
      keepPreviousData: true,
    }
  );
  const sourcesQuery = useQuery<Source[] | undefined, AxiosError>(
    ["sources"],
    getSources,
    {}
  );
  const ctListsQuery = useQuery<CTList | undefined, AxiosError>(
    ["ctLists"],
    getCTLists,
    {}
  );
  const groupsQuery = useQuery<Groups | undefined, AxiosError>(
    ["groups", "all"],
    () => {
      return getGroups();
    },
    {}
  );
  const tagsQuery = useQuery(["tags"], getTags, {});
  const selectedReadStatusMutation = useMutation(
    (read: boolean) => {
      let selectedReportIdsArr = Array.from(selectedReportIds);
      return setSelectedRead(selectedReportIdsArr, read);
    },
    {
      onSuccess: (data) => {
        reportsQuery.refetch();
      },
    }
  );
  const [showFilterParams, setShowFilterParams] = useState<boolean>(false);
  const [selectedReportIds, setSelectedReportIds] = useState<Set<string>>(
    new Set()
  );
  const [filterTags, setFilterTags] = useState<Tag[] | []>([]);
  return (
    <Container fluid className={"pt-4"}>
      <Row>
        <Col></Col>
        <Col xl={9}>
          <Formik
            validationSchema={reportQuerySchema}
            initialValues={{
              keywords: searchParams.get("keywords") || "",
              author: searchParams.get("author") || "",
              groupId: searchParams.get("groupId") || "",
              media: searchParams.get("media") || "",
              sourceId: searchParams.get("sourceId") || "",
              list: searchParams.get("list") || "",
              before: searchParams.get("before") || "",
              after: searchParams.get("after") || "",
            }}
            onSubmit={(values, { setSubmitting, resetForm }) => {
              console.log(parseFilterFields(values, filterTags));
              //setSearchParams(parseFilterFields(values, filterTags));
              //setQueryState(parseFilterFields(values));
            }}
          >
            {({ values, errors, handleSubmit }) => (
              <Form>
                <Card className='mb-3' bg='light'>
                  <Card.Body className='pb-2 pt-2'>
                    <Row className={"justify-content-between"}>
                      <Col>
                        {errors.groupId}
                        {errors.author}
                        {errors.keywords}
                        <InputGroup className={"mt-2 mb-2"}>
                          <Field
                            id='keyword'
                            name='keywords'
                            placeholder='Search by keyword, author, or group number'
                            className='form-control'
                          />
                          <Button variant='primary' type='submit'>
                            <FontAwesomeIcon icon={faSearch} />
                          </Button>
                        </InputGroup>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
                <Collapse in={showFilterParams}>
                  <Card className='mb-3' bg='light'>
                    <Card.Body className='pb-2 pt-2'>
                      {errors.sourceId}
                      {errors.media}
                      {errors.after}
                      {errors.before}
                      {errors.list}
                      <Row>
                        <Col>
                          <FormGroup className='mt-2 mb-2'>
                            <FormLabel>Tags</FormLabel>
                            {tagsQuery.isFetched && (
                              <TagsTypeahead
                                options={tagsQuery.data}
                                selected={filterTags}
                                onChange={setFilterTags}
                                variant='search'
                                id='report-tags-filter'
                              />
                            )}
                          </FormGroup>
                        </Col>
                        <Col md>
                          <FormGroup
                            controlId='searchMedia'
                            className='mt-2 mb-2'
                          >
                            <FormLabel>Platform</FormLabel>
                            <Field
                              as={"select"}
                              name='media'
                              className='form-select'
                            >
                              <option key='none' value={""}>
                                All
                              </option>
                              {mediaTypes.map((mediaType) => {
                                return (
                                  <option key={mediaType} value={mediaType}>
                                    {capitalizeFirstLetter(mediaType)}
                                  </option>
                                );
                              })}
                            </Field>
                          </FormGroup>
                        </Col>
                        <Col md>
                          <FormGroup
                            controlId='searchSource'
                            className='mt-2 mb-2'
                          >
                            <FormLabel>Source</FormLabel>
                            <Field
                              as={"select"}
                              name='sourceId'
                              className='form-select'
                            >
                              <option key={"none"} value={""}>
                                All
                              </option>
                              {sourcesQuery.isSuccess &&
                                sourcesQuery.data &&
                                sourcesQuery.data.map((source: Source) => {
                                  return (
                                    <option value={source._id} key={source._id}>
                                      {source.nickname}
                                    </option>
                                  );
                                })}
                            </Field>
                          </FormGroup>
                        </Col>
                      </Row>
                      <Row>
                        <Col md>
                          <FormGroup className='mt-2 mb-2'>
                            <FormLabel>CT List</FormLabel>
                            <Field
                              as={"select"}
                              name='list'
                              className='form-select'
                            >
                              <option key={"none"} value={""}>
                                All
                              </option>
                              {ctListsQuery.isSuccess &&
                                ctListsQuery.data &&
                                ctListToOptions(ctListsQuery.data)}
                            </Field>
                          </FormGroup>
                        </Col>
                        <Col md>
                          <FormGroup className='mt-2 mb-2'>
                            <FormLabel>Authored after</FormLabel>
                            <DatePickerField
                              className={"form-control"}
                              name='after'
                            />
                          </FormGroup>
                        </Col>
                        <Col md>
                          <FormGroup className='mt-2 mb-2'>
                            <FormLabel>Authored before</FormLabel>
                            <DatePickerField
                              className={"form-control"}
                              name='before'
                            />
                          </FormGroup>
                        </Col>
                      </Row>
                      <Row>
                        <ButtonToolbar className={"justify-content-between"}>
                          <ButtonGroup className={"mt-2 mb-2"}>
                            {/*
                                      <Button
                                        variant={"outline-secondary"}
                                        disabled={!gridView}
                                        onClick={()=>setGridView(false)}
                                    >
                                      <FontAwesomeIcon icon={faList} className="me-2"/>
                                      List
                                    </Button>
                                    <Button variant={"outline-secondary"} disabled={gridView} onClick={()=>setGridView(true)}>
                                      <FontAwesomeIcon icon={faGrip} className="me-2"/>
                                      Grid
                                    </Button>
                                    */}
                          </ButtonGroup>
                          {(values.sourceId ||
                            values.media ||
                            values.after ||
                            values.before ||
                            values.list ||
                            filterTags.length > 0) && (
                            <div className={"mt-2 mb-2"}>
                              <Button
                                variant={"outline-secondary"}
                                onClick={() => {
                                  clearFilterParams();
                                  values.media = "";
                                  values.sourceId = "";
                                  values.list = "";
                                  values.before = "";
                                  values.after = "";
                                  setFilterTags([]);
                                }}
                                className={"me-2"}
                              >
                                <FontAwesomeIcon
                                  icon={faClose}
                                  className={"me-2"}
                                />
                                Clear filter(s)
                              </Button>
                              <Button variant='primary' type='submit'>
                                Apply filter(s)
                              </Button>
                            </div>
                          )}
                        </ButtonToolbar>
                      </Row>
                    </Card.Body>
                  </Card>
                </Collapse>
              </Form>
            )}
          </Formik>
          {!cardView &&
            sourcesQuery.isSuccess &&
            reportsQuery.isSuccess &&
            tagsQuery.isSuccess &&
            groupsQuery.isSuccess &&
            tagsQuery.data &&
            reportsQuery.data &&
            groupsQuery.data &&
            sourcesQuery.data && (
              <Card>
                <Card.Header className='pe-2 ps-2'>
                  <ButtonToolbar className={"justify-content-between"}>
                    <div>
                      <Button
                        variant='outline-secondary'
                        onClick={() => setShowFilterParams(!showFilterParams)}
                        aria-controls='searchParams'
                        aria-expanded={showFilterParams}
                        className={"me-2"}
                        size='sm'
                      >
                        <FontAwesomeIcon icon={faFilter} className='me-2' />
                        Filter(s)
                      </Button>
                    </div>
                    {reportsQuery.data.total !== null && (
                      <AggiePagination
                        goToPage={goToPage}
                        total={reportsQuery.data.total}
                        itemsPerPage={ITEMS_PER_PAGE}
                        size='sm'
                      />
                    )}
                  </ButtonToolbar>
                </Card.Header>
                <ReportTable
                  visibleReports={reportsQuery.data.results}
                  sources={sourcesQuery.data}
                  tags={tagsQuery.data}
                  selectedReportIds={selectedReportIds}
                  setSelectedReportIds={setSelectedReportIds}
                  variant={"relevant"}
                />
                <Card.Footer>
                  <ButtonToolbar className={"justify-content-end"}>
                    {reportsQuery.data.total && (
                      <AggiePagination
                        goToPage={goToPage}
                        total={reportsQuery.data.total}
                        itemsPerPage={ITEMS_PER_PAGE}
                      />
                    )}
                  </ButtonToolbar>
                </Card.Footer>
              </Card>
            )}
          {reportsQuery.isError && (
            <>
              {reportsQuery.error &&
                reportsQuery.error.response &&
                reportsQuery.error.response.status &&
                reportsQuery.error.response.data && (
                  <ErrorCard
                    errorStatus={reportsQuery.error.response.status}
                    errorData={reportsQuery.error.response.data}
                  />
                )}
            </>
          )}
          {reportsQuery.isLoading && (
            <Card>
              <Card.Header className='pe-2 ps-2'>
                <ButtonToolbar className={"justify-content-between"}>
                  <div>
                    <Button
                      variant='outline-secondary'
                      className={"me-2"}
                      size='sm'
                      disabled
                    >
                      <FontAwesomeIcon icon={faFilter} className='me-2' />
                      Filter(s)
                    </Button>
                    <ButtonGroup className='me-2'>
                      <Button disabled size='sm' variant={"secondary"}>
                        <FontAwesomeIcon
                          icon={faEnvelopeOpen}
                        ></FontAwesomeIcon>
                      </Button>
                      <Button disabled size='sm' variant={"secondary"}>
                        <FontAwesomeIcon icon={faEnvelope}></FontAwesomeIcon>
                      </Button>
                    </ButtonGroup>
                  </div>
                  <LoadingPagination size='sm' />
                </ButtonToolbar>
              </Card.Header>
              <Card.Body className='p-0'>
                <LoadingReportTable variant={"relevant"} />
              </Card.Body>
            </Card>
          )}
          {cardView &&
            sourcesQuery.isSuccess &&
            reportsQuery.isSuccess &&
            tagsQuery.isSuccess &&
            groupsQuery.isSuccess &&
            tagsQuery.data &&
            reportsQuery.data &&
            groupsQuery.data &&
            sourcesQuery.data && (
              <ReportCards
                sources={sourcesQuery.data}
                visibleReports={reportsQuery.data.results}
                tags={tagsQuery.data}
                variant={"relevant"}
              ></ReportCards>
            )}
          <div className={"pb-5"}></div>
        </Col>
        <Col>
          <div className='d-none d-xl-block'>{/*<StatsBar/>*/}</div>
        </Col>
      </Row>
    </Container>
  );
};
export default RelevantReportsIndex;
