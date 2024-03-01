/**
 * Class for handling voice recognition and speech synthesis.
 * This only works in Chrome and Safari
 * @constructor Creates a new Voice object
 * @example
 * let voice = new Voice();
 * voice.start();
 * $(voice).on("result", (event, transcript) => { console.log("Transcript: " + transcript) });
 * $(voice).on("end", (event) => { console.log("Done Listening") });
 * voice.speak("Hello World"); // This will speak hello world using the browser's speech synthesis
 * voice.stop();
 */
export default class Voice {
    /**
     * Creates a new Voice object.
     * @param {string|RegExp} replaceText - The text to replace with the voice input.
     * @returns {Voice} - The newly created Voice object.
     * @example
     * let voice = new Voice();
     * voice.start();
     * $(voice).on("result", (event, transcript) => { console.log("Transcript: " + transcript) });
     * $(voice).on("end", (event) => { console.log("Done Listening") });
     * voice.speak("Hello World"); // This will speak hello world using the browser's speech synthesis
     * voice.stop();
     */
    constructor(replaceText = "") {
        // Checks if the browser supports voice recognition
        // Only works in Chrome and Safari
        if (!(window.SpeechRecognition || window.webkitSpeechRecognition)) {
            this.unsupported = true;
            alert("Your browser does not support voice recognition");
            return;
        }
        this.unsupported = false;
        this.shouldListen = false;
        this.recognition = new webkitSpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = "en-US";
        this.recognition.onresult = (event) => {
            let interim_transcript = "";
            let final_transcript = "";
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    final_transcript += event.results[i][0].transcript;
                } else {
                    interim_transcript += event.results[i][0].transcript;
                }
            }
            if (replaceText != "") {
                final_transcript = final_transcript.replace(replaceText, "");
                interim_transcript = interim_transcript.replace(replaceText, "");
            }

            final_transcript = final_transcript.trim();
            interim_transcript = interim_transcript.trim();

            if (interim_transcript !== "") {
                $(this).trigger("interim", [interim_transcript]);
            } else if (final_transcript !== "") {
                $(this).trigger("result", [final_transcript]);
            }
        };
        this.recognition.onend = () => {
            $(this).trigger("end");
        };
    }

    /**
     * Starts listening for speech.
     */
    start() {
        this.shouldListen = true;
        this.recognition.start();
    }

    /**
     * Stops listening for speech.
     */
    stop() {
        this.shouldListen = false;
        this.recognition.stop();
    }

    /**
     * Speaks a message using the browser's speech synthesis.
     * @param {string} message - The message to speak.
     */
    speak(message) {
        let msg = new SpeechSynthesisUtterance(message);
        window.speechSynthesis.speak(msg);
    }
}
