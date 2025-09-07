import React from "react";
import DataGridTemplate from "./DataGridTemplate"; // Adjust path as needed
 
const FunctionArea = () => {
  let collectionName = "functional_areas";
  const userConfig = {
    title: "FunctionalArea",
    fetchFieldApiUrl: `http://localhost:5000/api/get_document_by_collection/${collectionName}`,
    fetchActualData: "http://localhost:5000/api/functional_area",
    postApiUrl: "http://localhost:5000/api/save_functional_area",
    updateApiUrl: "http://localhost:5000/api/update_functional_area",
    collectionName: "functional_areas",
  };
 
  return <DataGridTemplate {...userConfig} />;
};
 
export default FunctionArea;