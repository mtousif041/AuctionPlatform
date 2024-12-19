import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Card = ({ imgSrc, title, startingBid, startTime, endTime, id }) => {
  // ye card khuch props accept krta hai
  const calculateTimeLeft = () => {
    // ye countdown function hoga , agr auction start nhai hua ho to bolega ki ye itne time baad start hoga aur agr start hai phele se to ye bolega ki itne time me khatam hoga

    // isme subse phele hume difference chaiye start time ka aur end time ka
    const now = new Date(); // ye hmara currunt time hai
    const startDifference = new Date(startTime) - now; // new Date() hum isliye likh rhe hai kyunki hmare data base me jo time save hai vo string formate hai
    const endDifference = new Date(endTime) - now;
    let timeLeft = {}; // ki time kita bacha hai uske bnayenge ek simple sa empty object

    if (startDifference > 0) {
      // yeaani jab startTime me se now time ko minus krne pr zero se bda aaya yaani statrt hone me time baki hai
      timeLeft = { //search on google ya chatgpt ki how to calculate countdown in react
        // ab timeLeft me kuch chijo ko enter krenge
        type: "Starts In:",
        days: Math.floor(startDifference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((startDifference / (1000 * 60 * 60)) % 24), // remender chaiye
        minutes: Math.floor((startDifference / 1000 / 60) % 60),
        seconds: Math.floor((startDifference / 1000) % 60),
      };
    } else if (endDifference > 0) {
      // iska ye matlab hai ki hamara auction end ho chuka hai ya fir hone wala hai itne time baad 
      timeLeft = {
        type: "Ends In:",
        days: Math.floor(endDifference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((endDifference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((endDifference / 1000 / 60) % 60),
        seconds: Math.floor((endDifference / 1000) % 60),
      };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft()); // isse kiya hoga ki humne yha pr calculateTimeLeft ko call kiya hai jisse is calculateTimeLeft se jo return ho rha hai vo issme usteState me aajyegi as a initial value  

  useEffect(() => {
    const timer = setTimeout(() => {
      // setTimeout javaScript ka function hai
      setTimeLeft(calculateTimeLeft());
    });
    return () => clearTimeout(timer); //ye ye krega ki jo time ka purana data tha usko clear krke new time data add krte rho har baar
  }, [timeLeft]); // yaani jab jab time left ki value change hoti rhegi ye useEffect call hota rhaega

  const formatTimeLeft = ({ days, hours, minutes, seconds }) => {
    const pad = (num) => String(num).padStart(2, "0"); // padStart ye krta hai ki manlo hmare pass 6 mint remaining hai to ye aise likhega 06 aur zero minut remaining hai to ye aise likehega 00:// pad ek function hai jo num parameter leta hai fir us num ko string me conert krta hai fir padStart method lgata hai 
    return `(${days} Days) ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  return (
    <>
      <Link
        to={`/auction/item/${id}`} // ye id jo apne uper props me di thi usse aaarhai hai
        className=" basis-full  bg-white rounded-md group sm:basis-56 lg:basis-60 2xl:basis-80" //isme se flex-grow mene hta diya mene 
      >
        <img
          src={imgSrc}
          alt={title}
          className="w-full aspect-[4/3] m-auto md:p-12"
        />
        <div className="px-2 pt-4 pb-2">
          <h5 className="font-semibold text-[18px] group-hover:text-[#d6482b] mb-2">
            {title}
          </h5>
          {startingBid && ( // yaani agr starting bid hai koi to hum log yha pr yhe krenge
            <p className="text-stone-600 font-light">
              Starting Bid:{" "}
              <span className="text-[#fdba88] font-bold ml-1">
                {startingBid}
              </span>
            </p>
          )}
          <p className="text-stone-600 font-light">
            {timeLeft.type}
            {Object.keys(timeLeft).length > 1 ? (
              <span className="text-[#fdba88] font-bold ml-1">
                {formatTimeLeft(timeLeft)}
              </span>
            ) : (
              <span className="text-[#fdba88] font-bold ml-1">Time's up!</span>
            )}
          </p>
        </div>
      </Link>
    </>
  );
};

export default Card;
