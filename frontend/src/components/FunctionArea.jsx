import React from "react";
import DataGridTemplate from "./DataGridTemplate"; // Adjust path as needed

const FunctionArea = () => {
  const userConfig = {
    title: "FunctionalArea",
    fetchApiUrl: "http://localhost:5000/api/function_area", // User-specific fetch API
    postApiUrl: "http://localhost:5000/api/save_function_area", // User-specific post API
    //  initialNewRowData: { moduleNameee: "", moduleDescription: "" }, // Fields for new user row
    // displayFields: ["moduleName", "moduleDescription"], // Fields to display for users
  };

  return <DataGridTemplate {...userConfig} />;
};

export default FunctionArea;
