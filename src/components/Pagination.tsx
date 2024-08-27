import {
  faAngleDoubleLeft,
  faAngleDoubleRight,
  faArrowRight,
  faChevronLeft,
  faChevronRight,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Popover } from "@headlessui/react";
import { Formik, Field } from "formik";
import { Form } from "react-bootstrap";
import AggieButton from "./AggieButton";

interface IPagination {
  currentPage: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  size?: number;
  pageSize?: number;
}
const Pagination = ({
  currentPage,
  totalCount,
  onPageChange,
  size = 3,
  pageSize = 50,
}: IPagination) => {
  const totalPages = totalCount ? Math.floor(totalCount / pageSize) : 0;

  // light logic wrapper for whether or not to display buttons
  const NumberButton = (props: {
    direction: "prev" | "next";
    toPage: number;
    children?: React.ReactElement;
  }) => {
    const validNext = props.toPage < (totalCount || 0) / pageSize;
    const validPrev = props.toPage >= 0;
    if (props.direction === "next" ? validNext : validPrev) {
      return (
        <AggieButton
          className={"px-2 py-2 hover:bg-slate-200 justify-center "}
          onClick={() => onPageChange(props.toPage)}
        >
          {props.children || props.toPage}
        </AggieButton>
      );
    }
    return <></>;
  };
  return (
    <div className='flex font-medium bg-white rounded-lg border divide-x border-slate-300 divide-slate-300 h-fit'>
      <NumberButton direction='prev' toPage={currentPage - 1}>
        <FontAwesomeIcon icon={faChevronLeft} />
      </NumberButton>
      {Array(size)
        .fill(0)
        .map((value, index) => (
          <NumberButton
            key={index}
            direction='prev'
            toPage={currentPage - (size - index)}
          />
        ))}

      <Popover className='relative'>
        <Popover.Button className='focus-theme px-2 py-2 hover:bg-slate-200'>
          Page {currentPage} {totalCount !== 0 && <span>of {totalPages}</span>}
        </Popover.Button>

        <Popover.Panel className='absolute top-full mt-1 z-10 p-2 bg-white rounded-lg shadow-md border border-slate-300'>
          <Formik
            initialValues={{ page: undefined }}
            onSubmit={(e) => e.page && onPageChange(e.page)}
          >
            <Form className=''>
              <label className='mb-1'>Jump to:</label>
              <div className='flex focus-within-theme rounded-lg'>
                <Field
                  name='page'
                  type='number'
                  autoFocus
                  className='focus-theme px-2 py-2 border border-r-0 border-slate-300 bg-slate-50 rounded-l-lg w-24'
                  placeholder='page #'
                  max={totalPages}
                />
                <AggieButton
                  type='submit'
                  className='px-2 py-1 bg-slate-50 hover:bg-white rounded-r-lg border-y border-r border-slate-30'
                >
                  <FontAwesomeIcon icon={faArrowRight} />
                </AggieButton>
              </div>
            </Form>
          </Formik>
          <div className='flex gap-1 mt-1'>
            <AggieButton
              variant='secondary'
              onClick={() => onPageChange(0)}
              disabled={currentPage === 0}
              className='w-full'
            >
              <FontAwesomeIcon icon={faAngleDoubleLeft} />
              First
            </AggieButton>
            <AggieButton
              variant='secondary'
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
              className='w-full'
            >
              Last
              <FontAwesomeIcon icon={faAngleDoubleRight} />
            </AggieButton>
          </div>
        </Popover.Panel>
      </Popover>

      {Array(size)
        .fill(0)
        .map((value, index) => (
          <NumberButton
            key={index}
            direction='next'
            toPage={currentPage + index + 1}
          />
        ))}

      <NumberButton direction='next' toPage={currentPage + 1}>
        <FontAwesomeIcon icon={faChevronRight} />
      </NumberButton>
    </div>
  );
};

export default Pagination;
