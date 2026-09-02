import { InputValue } from './types';

export const WRITE_DELAY = 100;

export interface WriterHooks {
  send: (values: Record<string, InputValue>) => Promise<void>;
  onStart: () => void;
  onSuccess: (sent: Record<string, InputValue>) => void;
  onFailure: (sent: Record<string, InputValue>, error: unknown) => void;
}

/**
 * Queues one column's writes, with at most one request in flight.
 *
 * A fast typist would otherwise produce a queue whose responses arrive out of order and overwrite
 * each other. Values wait `WRITE_DELAY` before going out, and a newer value for the same input
 * replaces one still waiting. Coalescing is per column, so two columns edited in quick succession
 * are two concurrent requests.
 */
export default class ColumnWriter {
  private queued: Record<string, InputValue> = {};
  private inFlight = false;
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor(private hooks: WriterHooks) {}

  write(inputKey: string, value: InputValue) {
    this.queued[inputKey] = value;

    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => this.flush(), WRITE_DELAY);
  }

  /** Whether anything is still waiting to be sent or answered. */
  get busy() {
    return this.inFlight || Object.keys(this.queued).length > 0;
  }

  private async flush() {
    this.timer = null;

    // The request in flight flushes again when it finishes, so its own values cannot be overtaken.
    if (this.inFlight || !Object.keys(this.queued).length) return;

    const sent = this.queued;
    this.queued = {};
    this.inFlight = true;
    this.hooks.onStart();

    try {
      await this.hooks.send(sent);
      this.hooks.onSuccess(sent);
    } catch (error) {
      this.hooks.onFailure(sent, error);
    } finally {
      this.inFlight = false;
    }

    if (Object.keys(this.queued).length) this.flush();
  }
}
