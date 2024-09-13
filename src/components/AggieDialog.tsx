// a more generic dialog
import { Dialog } from "@headlessui/react";

interface IProps {
  isOpen: boolean;
  onClose: () => void;
  data?: {
    title: string;
    description?: string;
  };
  children?: React.ReactNode;
  className?: string;
}

const AggieDialog = ({
  isOpen = false,
  onClose,
  children,
  data,
  className,
}: IProps) => {
  if (isOpen)
    return (
      <Dialog static open onClose={() => onClose()} className='relative z-50'>
        <div className='fixed inset-0 bg-black/30' aria-hidden='true' />
        <div className='fixed inset-0 flex w-screen items-center justify-center p-4'>
          <Dialog.Panel
            className={`bg-white rounded-xl border border-slate-200 shadow-xl min-w-24 min-h-12 ${className}`}
          >
            {!!data && (
              <header className=' pb-3 '>
                <Dialog.Title className='text-xl font-medium'>
                  {data.title}
                </Dialog.Title>
                <Dialog.Description>{data.description}</Dialog.Description>
              </header>
            )}

            {children}
          </Dialog.Panel>
        </div>
      </Dialog>
    );
  return <></>;
};
export default AggieDialog;
