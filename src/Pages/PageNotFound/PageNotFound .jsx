// Pages/PageNotFound/PageNotFound.js
import React from "react";
import Lottie from "react-lottie";
import animationData from "../../assets/Animation - 1720575546436.json";

const PageNotFound = () => {
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  return (
    <div className="page-not-found ">
      <Lottie options={defaultOptions} />
    </div>
  );
};

export default PageNotFound;
