import React from "react";
import DataGridTemplate from "./DataGridTemplate"; // Adjust path as needed
 
const Documents = () => {
  let collectionName = "documents";
  const userConfig = {
    title: "Documents",
    fetchFieldApiUrl: `http://localhost:5000/api/get_document_by_collection/${collectionName}`,
    fetchActualData: "http://localhost:5000/api/document_list",
    postApiUrl: "http://localhost:5000/api/save_document",
    updateApiUrl: "http://localhost:5000/api/update_document",
    collectionName: "documents",
  };
 
  return <DataGridTemplate {...userConfig} />;
};
 
export default Documents;
 