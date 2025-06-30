import React from "react";
import DataGridTemplate from "./DataGridTemplate"; // Adjust path as needed

const Documents = () => {
  const userConfig = {
    title: "Documents",
    fetchApiUrl: "http://localhost:5000/api/document_list", // User-specific fetch API
    postApiUrl: "http://localhost:5000/api/save_document", // User-specific post API
    //  initialNewRowData: { moduleNameee: "", moduleDescription: "" }, // Fields for new user row
    //displayFields: ["moduleName", "moduleDescription"], // Fields to display for users
  };

  return <DataGridTemplate {...userConfig} />;
};

export default Documents;
