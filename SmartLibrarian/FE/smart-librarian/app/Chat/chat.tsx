import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { getChatResponse } from "~/services/chatservice";
import { Message } from "../Reply/Reply";
import gsap from "gsap";


type ChatPair = {
  prompt: string;
  reply: string;
};

export function Chat() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [chatHistory, setChatHistory] = useState<ChatPair[]>([]);
  const [firstQuery, setFirstQuery] = useState(false);

  const mutation = useMutation({
    mutationFn: getChatResponse,
    onSuccess: (data: string, variables: string) => {
      setChatHistory((prev) => [...prev, { prompt: variables, reply: data }]);
    }
  });

  useEffect(() => {
    if(firstQuery) {
    const t1 = gsap.timeline();
    t1.to(".chat", {
      duration: 0.5,
      y: "200",
      ease: "ease-in",
      stagger: 0.1
    }
    )
  }
  },[firstQuery])


  const handleSend = () => {
    setFirstQuery(true)
    const value = inputRef.current?.value || "";
    if (!value) return;
    mutation.mutate(value);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className=" col-start-1 col-end-2 flex flex-col items-center justify-start h-[60vh] w-full">
        <div className="flex flex-col justify-center max-h-1/2 h-[50vh] min-w-1/3 overflow-y-scroll gap-4 w-[40vw]">
            {chatHistory.map((item, idx) => (
                <div key={idx} className="mb-4 ">
                    <Message message={item.prompt} isPrompt={false} />
                    <Message message={item.reply}  isPrompt={true}/>
                </div>
            ))}
        </div>
        <div className= {(firstQuery ? "chat" : "absolute bottom-1/2 -transalte-y-1/2") + " flex items-center justify-center w-[40vw] gap-4 m-0"}>
             <input
            className="border-2 border-primary-blue rounded-3xl p-4 shadow-md w-full bg-white"
            placeholder="Looking for something?"
            ref={inputRef}
            onKeyDown={(e) => {
            if (e.key === "Enter") {
                handleSend();
            }
            }}
          />
          <button
            onClick={handleSend}
            className=" mt-4 px-6 py-3 bg-primary-blue text-white rounded-full shadow-lg hover:bg-primary-orange transition-colors duration-300"
          >
              Search
          </button>
        </div>
       
        
    </div>
  );
}

