import { Dialog } from "@headlessui/react";
import AggieButton from "./AggieButton";

interface IProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  data?: {
    title: string;
    description?: string;
  };
  children?: React.ReactNode;
  confirmButton?: React.ReactNode;
  disabled?: boolean;
}

const ConfirmationModal = ({
  isOpen = false,
  onClose,
  onConfirm,
  children,
  data,
  disabled = false,
  confirmButton,
}: IProps) => {
  return (
    <Dialog
      open={isOpen}
      onClose={() => !disabled && onClose()}
      className='relative z-50'
    >
      <div className='fixed inset-0 bg-black/30' aria-hidden='true' />
      <div className='fixed inset-0 flex w-screen items-center justify-center p-4'>
        <Dialog.Panel className='bg-white rounded-xl border border-slate-200 shadow-xl min-w-24 min-h-12'>
          {!!data && (
            <header className='px-3 py-2 '>
              <Dialog.Title className='text-xl font-medium'>
                {data.title}
              </Dialog.Title>
              <Dialog.Description>{data.description}</Dialog.Description>
            </header>
          )}

          {children}
          <div className='flex gap-1 justify-between  px-3 py-2 border-t border-slate-200'>
            <AggieButton
              className={
                confirmButton
                  ? ""
                  : "px-2 py-1 bg-green-700 text-white hover:bg-green-600 rounded-lg"
              }
              onClick={() => {
                onConfirm();
              }}
              disabled={disabled}
            >
              {confirmButton ? confirmButton : "Confirm"}
            </AggieButton>
            <AggieButton
              className='px-2 py-1 bg-slate-100 rounded-lg border border-slate-200 hover:bg-slate-200'
              onClick={onClose}
              disabled={disabled}
            >
              Cancel
            </AggieButton>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default ConfirmationModal;
