import { Injectable, Logger } from '@nestjs/common';

export interface FeatureCommunicationResult {
  responded: ReadonlySet<string>;
  success: boolean;
  timedOut: boolean;
  reset: boolean;
}

interface PendingCommunication {
  expected: Set<string>;
  responded: Set<string>;
  resolve: (result: FeatureCommunicationResult) => void;
  timeout: NodeJS.Timeout;
}

@Injectable()
export class FeatureResponseTracker {
  private readonly logger = new Logger(FeatureResponseTracker.name);

  private readonly pending = new Map<string, PendingCommunication>();

  public wait(
    key: string,
    expected: string[],
    timeoutMs: number = 5000,
  ): Promise<FeatureCommunicationResult> {
    this.reset(key);

    return new Promise((resolve) => {
      const pending: PendingCommunication = {
        expected: new Set(expected),
        responded: new Set(),
        resolve,
        timeout: setTimeout(() => {
          this.finish(key, true, false);
        }, timeoutMs),
      };

      this.pending.set(key, pending);

      if (expected.length === 0) {
        this.finish(key, false, false);
      }
    });
  }

  public response(key: string, feature: string): void {
    const pending = this.pending.get(key);

    if (!pending || !pending.expected.has(feature)) {
      return;
    }

    pending.responded.add(feature);

    if (pending.responded.size === pending.expected.size) {
      this.finish(key, false, false);
    }
  }

  public reset(key: string): void {
    this.finish(key, false, true);
  }

  private finish(key: string, timedOut: boolean, reset: boolean): void {
    const pending = this.pending.get(key);
    if (!pending) return;

    const { timeout, expected, responded, resolve } = pending;

    clearTimeout(timeout);
    this.pending.delete(key);

    if (timedOut) {
      const respondedArray = [...responded];
      const missing = [...expected]
        .filter((x) => !respondedArray.includes(x))
        .join(', ');
      this.logger.warn(
        `Response tracker for ${key} timeouted. Missing features: ${missing}`,
      );
    } else if (reset) {
      this.logger.log(`Response tracker for ${key} reseted`);
    } else {
      this.logger.log(`Response tracker for ${key} successed`);
    }

    resolve({
      responded: new Set(responded),
      success: expected.size === responded.size,
      timedOut,
      reset,
    });
  }
}
