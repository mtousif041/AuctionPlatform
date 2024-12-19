// ye component use nhai krne wale hai chaye to daelte krdo

import React from "react";

const H1 = ({ content, color }) => {
  return (
    <h1
      className={`text-[${color}] text-2xl font-bold mb-2 min-[480]:text-4xl md:text-6xl xl:text-7xl 2xl:text-8xl`}
    >
      {content}
    </h1>
  );
};

export default H1;
