import { Worker } from 'worker_threads';

export class WorkerPool<TInput, TOutput> {
  private workers: Worker[] = [];
  private maxWorkers: number;
  private taskQueue: {
    task: TInput;
    resolve: (value: TOutput) => void;
    reject: (reason?: any) => void;
  }[] = [];
  private workerScript: string;

  constructor(workerScript: string, maxWorkers: number) {
    this.workerScript = workerScript;
    this.maxWorkers = maxWorkers;
  }

  runTask(task: TInput): Promise<TOutput> {
    return new Promise((resolve, reject) => {
      const taskWrapper = { task, resolve, reject };
      if (this.workers.length < this.maxWorkers) {
        this.executeTask(taskWrapper);
      } else {
        this.taskQueue.push(taskWrapper);
      }
    });
  }

  private executeTask(taskWrapper: {
    task: TInput;
    resolve: (value: TOutput) => void;
    reject: (reason?: any) => void;
  }) {
    const worker = new Worker(this.workerScript, {
      eval: true,
      workerData: taskWrapper.task,
    });

    worker.on(
      'message',
      (message: { success: boolean; result: TOutput; error?: string }) => {
        this.removeWorker(worker);

        if (message.success) {
          taskWrapper.resolve(message.result);
        } else {
          taskWrapper.reject(new Error(message.error));
        }
        this.runNextTask();
      },
    );

    worker.on('error', (error) => {
      this.removeWorker(worker);
      taskWrapper.reject(error);
      this.runNextTask();
    });

    worker.on('exit', (code) => {
      if (code !== 0) {
        taskWrapper.reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });

    this.workers.push(worker);
  }

  private removeWorker(worker: Worker) {
    const index = this.workers.indexOf(worker);
    if (index !== -1) {
      this.workers.splice(index, 1);
    }
  }

  private runNextTask() {
    if (this.taskQueue.length > 0 && this.workers.length < this.maxWorkers) {
      const nextTask = this.taskQueue.shift();
      nextTask && this.executeTask(nextTask);
    }
  }
}
