import * as path from "path";
import * as fs from "fs";
import { WriteStream } from "fs";

class Logger {
    private readonly logDir = path.resolve(__dirname, "../../.log");
    private currentDay = new Date();
    private logPath: string;
    private logStream: WriteStream;

    public error(_err: Error): void {
        return this.writeLog("ERROR", _err.stack + "\n");
    }

    private writeLog(_type: string, _message: string) {
        const now: Date = new Date();
        const message = `[${now} - ${_type}]: ${_message}\n`;

        // Create new log file for new day or logStream is not opened
        if (now.getDate() !== this.currentDay.getDate() || !this.logStream) {
            this.logPath = this.genLogPath(now);
            this.currentDay = now;

            this.logStream?.close();
            this.logStream = fs.createWriteStream(this.logPath, { flags: "a" });
        }

        this.logStream.write(message);
    }

    private genLogPath(date: Date): string {
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();

        return `${this.logDir}/${day}-${month}-${year}.log`;
    }
}

export default new Logger();
