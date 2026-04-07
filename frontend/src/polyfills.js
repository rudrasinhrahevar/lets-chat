// Polyfills for Node.js globals required by simple-peer (uses readable-stream)
// Webpack 5 (CRA 5) removed automatic Node.js polyfills, so we add them here.
import { Buffer } from "buffer";
import process from "process/browser";

window.process = process;
window.Buffer = Buffer;
