import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';

import LocaleMessage from './LocaleMessage';

interface ScenarioEditorProps {
  endYear: number;
  inputKey: string;
  onClose: () => void;
  scenarioID: number;
}

/**
 * Retrieves the root application node, needed by AriaModal.
 */
const getApplicationNode = () =>
  // We know the element definitely exists.
  document.getElementById('root') as HTMLElement;

/**
 * Links to the correct slide in ETModel for the given scenario and input,
 * allowing the user to make further changes.
 */
const urlForInput = (scenarioID: number, inputKey: string) =>
  `${process.env.NEXT_PUBLIC_ETMODEL_URL}/scenario/myc/${scenarioID}?input=${inputKey}`;

const ScenarioEditor = (props: ScenarioEditorProps) => {
  return (
    <Transition appear show={true} as={Fragment}>
      <Dialog
        as="div"
        open={true}
        onClose={props.onClose}
        // getApplicationNode={getApplicationNode}
        // titleText="Scenario Editor"
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm" />
        </Transition.Child>

        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Dialog.Panel className="min-w-[100vw] max-w-[1327px] transform overflow-hidden rounded-md bg-white text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="border-b border-gray-300 px-6 py-3 pt-4 text-base font-medium text-gray-900"
                >
                  <LocaleMessage
                    id="scenarioEditor.title"
                    values={{ year: props.endYear.toString() }}
                  />
                </Dialog.Title>
                <iframe
                  src={urlForInput(props.scenarioID, props.inputKey)}
                  className="h-[700px] w-full"
                />
                {/* iframe here */}
                <div className="border-t border-gray-300 px-6 py-4">
                  <button
                    onClick={props.onClose}
                    className="rounded bg-emerald-600 py-1.5 px-3 text-white transition hover:bg-emerald-700"
                  >
                    <LocaleMessage id="scenarioEditor.finish" />
                  </button>
                </div>
              </Dialog.Panel>
            </div>
          </div>
        </Transition.Child>
      </Dialog>
    </Transition>
  );
};

export default ScenarioEditor;
