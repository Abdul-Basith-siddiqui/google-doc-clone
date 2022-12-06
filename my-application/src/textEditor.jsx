//run the server on 3001

import React, {
  createElement,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css"; // style sheet for the editor
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";

const SAVE_INTERVAL_MS = 2000;
var toolbarOptions = [
  ["bold", "italic", "underline", "strike"], // toggled buttons
  ["blockquote", "code-block"],

  [{ header: 1 }], // custom button values
  [{ list: "ordered" }, { list: "bullet" }],
  [{ script: "sub" }, { script: "super" }], // superscript/subscript
  [{ indent: "-1" }, { indent: "+1" }], // outdent/indent
  [{ direction: "rtl" }], // text direction

  [{ header: [1, 2, 3, 4, 5, 6, false] }],

  [{ color: [] }, { background: [] }], // dropdown with defaults from theme
  [{ font: [] }],
  [{ align: [] }],

  ["clean"], // remove formatting button
];

export default function TextEditor() {
  const { id: documentid } = useParams(); // we are grabbing the id from App.js (uuid) and reNaming it to documentid
  console.log(documentid); //gives the id - o/p - 439d0da2-d9c3-4335-9e60-0756adab0f04
  const [socket, setSocket] = useState(); //using the useState to connect the server
  const [quill, setQuill] = useState();

  //conncting to the server
  useEffect(() => {
    const s = io("http://localhost:3002"); // connecting to the server
    setSocket(s);

    return () => {
      s.disconnect(); // disconnecting from the server
    };
  }, []);

  //using useParams

  useEffect(() => {
    if (socket == null || quill == null) return;

    socket.once("load-document", (document) => {
      quill.setContents(document);
      quill.enable();
    });

    socket.emit("get-document", documentid);
  }, [socket, quill, documentid]);

  // SAVE THE TEXT EVERY 2 SEC
  useEffect(() => {
    if (socket == null || quill == null) return;
    const interval = setInterval(() => {
      socket.emit("save-document", quill.getContents());

      return () => {
        clearInterval(interval);
      };
    }, SAVE_INTERVAL_MS);
  }, [socket, quill]);

  //server broadcast the changes to all the clients and we want to recieve the changes

  useEffect(() => {
    if (socket == null || quill == null) return;

    const handler = (delta) => {
      quill.updateContents(delta);
    };

    socket.on("receive-changes", handler); // when ever the text changes the call this function

    return () => {
      socket.off("receive-changes", handler); //when we disconnect from the server then remove the event listener
    };
  }, [socket, quill]);

  //when textChanges in the editor, we want to send the changes to the server
  useEffect(() => {
    if (socket == null || quill == null) return;

    const handler = (delta, oldDelta, source) => {
      // when ever the text changes the call this function
      if (source !== "user") return; //if the changes is not made by user then return
      socket.emit("send-changes", delta); //if user make the changes then emit send to server --check server.js their it catches
    }; // delta is the changes that the user made

    quill.on("text-change", handler); // when ever the text changes the call this function

    return () => {
      quill.off("text-change", handler); //when we disconnect from the server then remove the event listener
    };
  }, [socket, quill]);

  // const wraperRef = useRef();
  // console.log(wraperRef);

  const wrapperRef = useCallback((wrapper) => {
    if (wrapper == null) return; // if wrapper is null, we are returing from the function - nothing happens - yahase hi return nicheke lines nai run hote

    wrapper.innerHTML = ""; // if wrapper is not null, we are setting the innerHTML of the wrapper to an empty string

    const editor = document.createElement("div");
    wrapper.append(editor);
    const q = new Quill(editor, {
      // #container is the id of the div where the editor will be rendered
      theme: "snow", // theme of the editor
      modules: {
        toolbar: toolbarOptions,
      },
    });
    q.disable();
    q.setText("loading...");
    setQuill(q);
  }, []);
  return <div className="container" ref={wrapperRef}></div>; // when ever page render and when it comes to this line, it will call the wrapperRef function and wrapper fun has useCallback which takes a argument as the div, this line (wrapper)
}
