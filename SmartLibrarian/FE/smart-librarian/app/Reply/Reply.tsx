import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/all";
export function Message({ message, isPrompt }: { message: string; isPrompt?: boolean }) {

 const responseRef = useRef<HTMLParagraphElement>(null);

  if(!isPrompt){
     return (
        <div className={"flex justify-end items-end "}>
            <article className={"rounded-4xl bg-primary-orange text-[#FFFFFF] shadow-lg text-center p-2 "}>
                <p className=" m-2" ref={responseRef} >{message}</p>
            </article>
        </div>
    );
  }   

  useEffect(() => {
    if (!message || !responseRef.current) return;
    const t1 = gsap.timeline()
    const split = new SplitText(responseRef.current, {
      type: "words",
    });

    t1.from(split.words, {
      duration: 0.4,
      autoAlpha: 0,
      y: 10,
      ease: "power2.out",
      stagger: 0.1
    });
    
      return () => {
      split.revert();
    };
  }, [message]);

    return (
        <div className={"flex justify-start items-start"}>
            <article className={" text-gray-800"}>
                <p className=" m-2" ref={responseRef} >{message}</p>
            </article>
        </div>
    );
}

