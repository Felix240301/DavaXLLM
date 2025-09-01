import gsap from "gsap";
import { SplitText } from "gsap/all";
import { use, useEffect } from "react";
import { Chat } from "~/Chat/chat";


export function Welcome() {

  useEffect(() => {
    
    const t1 = gsap.timeline()
    const split = new SplitText(".welcome-text", {
      type: "words",
      wordsClass: "welcome-word"
    });


    t1.from(split.words, {
      duration: 1,
      autoAlpha: 0,
      y: 20,
      ease: "power2.out",
      stagger: 0.1
    });
    
    
    return () => split.revert();
  }, []);
  return (
      <div className="grid grid-cols-1 grid-rows-3 h-[100vh] bg-[url('/backgroundLanding.png')] bg-cover bg-center bg-no-repeat bg-fixed">
        <div className="row-span-1 row-start-1 flex flex-col justify-center items-center">
          <h1 className="text-7xl md:text-5xl font-bold text-primary-blue welcome-text font-sans">Welcome to Smart Librarian</h1>
          <p className="welcome-text text-4xl text-primary-blue">Your <span className="font-bold text-primary-orange">AI-powered</span> research assistant.</p>
        </div>
        <div className="row-span-2 row-start-2 flex justify-center items-center">
           <Chat />
        </div>
       
      </div>
  );
}


